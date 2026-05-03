"""Seed flow coverage for the dashboard foundation."""

from pathlib import Path

from alembic import command
from alembic.config import Config
from app.db.models import City, DashboardSnapshot, SourceRun
from app.jobs.seed_dev import seed_development_data
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session


def build_alembic_config(database_url: str) -> Config:
    project_root = Path(__file__).resolve().parents[2]
    config = Config(str(project_root / "alembic.ini"))
    config.set_main_option("script_location", str(project_root / "alembic"))
    config.set_main_option("sqlalchemy.url", database_url)
    return config


def test_seed_development_data_is_repeatable(tmp_path: Path) -> None:
    database_path = tmp_path / "dashboard.db"
    database_url = f"sqlite+pysqlite:///{database_path.as_posix()}"
    command.upgrade(build_alembic_config(database_url), "head")

    seed_development_data(database_url)
    seed_development_data(database_url)

    with Session(create_engine(database_url)) as session:
        cities = session.scalars(select(City).order_by(City.slug)).all()
        runs = session.scalars(select(SourceRun).order_by(SourceRun.source_name)).all()
        snapshots = session.scalars(select(DashboardSnapshot)).all()

    assert [city.slug for city in cities] == ["amsterdam", "rotterdam", "utrecht"]
    assert {run.source_name for run in runs} == {
        "knmi",
        "luchtmeetnet",
        "rijkswaterstaat",
    }
    assert len(snapshots) == 3
    amsterdam_snapshot = next(
        snapshot
        for snapshot in snapshots
        if snapshot.summary_payload["city_slug"] == "amsterdam"
    )
    assert amsterdam_snapshot.summary_payload["current"]["temperature_c"] == 16.4
