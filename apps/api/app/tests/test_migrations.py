"""Migration coverage for the dashboard foundation schema."""

from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect


def build_alembic_config(database_url: str) -> Config:
    project_root = Path(__file__).resolve().parents[2]
    config = Config(str(project_root / "alembic.ini"))
    config.set_main_option("script_location", str(project_root / "alembic"))
    config.set_main_option("sqlalchemy.url", database_url)
    return config


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
