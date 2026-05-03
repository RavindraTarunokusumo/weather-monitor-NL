"""Migration coverage for the dashboard foundation schema."""

from pathlib import Path

from alembic import command
from app.tests.support import build_alembic_config
from sqlalchemy import create_engine, inspect


def test_upgrade_head_creates_foundation_tables(tmp_path: Path) -> None:
    database_path = tmp_path / "dashboard.db"
    database_url = f"sqlite+pysqlite:///{database_path.as_posix()}"

    command.upgrade(build_alembic_config(database_url), "head")

    engine = create_engine(database_url)
    inspector = inspect(engine)

    assert {
        "cities",
        "source_runs",
        "weather_snapshots",
        "air_quality_snapshots",
        "water_snapshots",
        "dashboard_snapshots",
    } <= set(inspector.get_table_names())
