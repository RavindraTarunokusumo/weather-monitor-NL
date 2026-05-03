"""Shared test helpers for API database setup."""

from pathlib import Path

from alembic import command
from alembic.config import Config
from app.jobs.seed_dev import seed_development_data


def build_alembic_config(database_url: str) -> Config:
    project_root = Path(__file__).resolve().parents[2]
    config = Config(str(project_root / "alembic.ini"))
    config.set_main_option("script_location", str(project_root / "alembic"))
    config.set_main_option("sqlalchemy.url", database_url)
    return config


def seed_database(tmp_path: Path) -> str:
    database_path = tmp_path / "dashboard.db"
    database_url = f"sqlite+pysqlite:///{database_path.as_posix()}"
    command.upgrade(build_alembic_config(database_url), "head")
    seed_development_data(database_url)
    return database_url
