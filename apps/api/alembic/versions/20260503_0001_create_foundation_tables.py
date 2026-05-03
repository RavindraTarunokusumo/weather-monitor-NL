"""create foundation tables"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.types import Uuid

revision = "20260503_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "cities",
        sa.Column("id", Uuid(), nullable=False),
        sa.Column("slug", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("country_code", sa.String(length=2), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("timezone", sa.String(length=64), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_cities")),
        sa.UniqueConstraint("slug", name=op.f("uq_cities_slug")),
    )
    op.create_table(
        "source_runs",
        sa.Column("id", Uuid(), nullable=False),
        sa.Column("source_name", sa.String(length=64), nullable=False),
        sa.Column("job_type", sa.String(length=64), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("records_fetched", sa.Integer(), nullable=False),
        sa.Column("records_stored", sa.Integer(), nullable=False),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_source_runs")),
    )
    op.create_table(
        "weather_snapshots",
        sa.Column("id", Uuid(), nullable=False),
        sa.Column("city_id", Uuid(), nullable=False),
        sa.Column("observed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ingested_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("temperature_c", sa.Float(), nullable=True),
        sa.Column("feels_like_c", sa.Float(), nullable=True),
        sa.Column("rain_mm", sa.Float(), nullable=True),
        sa.Column("rain_probability", sa.Float(), nullable=True),
        sa.Column("wind_speed_kmh", sa.Float(), nullable=True),
        sa.Column("wind_gust_kmh", sa.Float(), nullable=True),
        sa.Column("wind_direction", sa.String(length=16), nullable=True),
        sa.Column("weather_code", sa.String(length=32), nullable=True),
        sa.Column("warning_level", sa.String(length=32), nullable=True),
        sa.Column("source_name", sa.String(length=64), nullable=False),
        sa.Column("source_payload", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(
            ["city_id"], ["cities.id"], name=op.f("fk_weather_snapshots_city_id_cities")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_weather_snapshots")),
    )
    op.create_table(
        "air_quality_snapshots",
        sa.Column("id", Uuid(), nullable=False),
        sa.Column("city_id", Uuid(), nullable=False),
        sa.Column("observed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ingested_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("aqi_value", sa.Float(), nullable=True),
        sa.Column("aqi_label", sa.String(length=32), nullable=True),
        sa.Column("pm25", sa.Float(), nullable=True),
        sa.Column("pm10", sa.Float(), nullable=True),
        sa.Column("no2", sa.Float(), nullable=True),
        sa.Column("o3", sa.Float(), nullable=True),
        sa.Column("so2", sa.Float(), nullable=True),
        sa.Column("main_pollutant", sa.String(length=32), nullable=True),
        sa.Column("trend_label", sa.String(length=32), nullable=True),
        sa.Column("source_name", sa.String(length=64), nullable=False),
        sa.Column("source_payload", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(
            ["city_id"],
            ["cities.id"],
            name=op.f("fk_air_quality_snapshots_city_id_cities"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_air_quality_snapshots")),
    )
    op.create_table(
        "water_snapshots",
        sa.Column("id", Uuid(), nullable=False),
        sa.Column("city_id", Uuid(), nullable=False),
        sa.Column("station_id", sa.String(length=64), nullable=True),
        sa.Column("station_name", sa.String(length=128), nullable=True),
        sa.Column("observed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ingested_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("water_level_cm", sa.Float(), nullable=True),
        sa.Column("trend_label", sa.String(length=32), nullable=True),
        sa.Column("risk_label", sa.String(length=32), nullable=True),
        sa.Column("source_name", sa.String(length=64), nullable=False),
        sa.Column("source_payload", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(
            ["city_id"], ["cities.id"], name=op.f("fk_water_snapshots_city_id_cities")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_water_snapshots")),
    )
    op.create_table(
        "dashboard_snapshots",
        sa.Column("id", Uuid(), nullable=False),
        sa.Column("city_id", Uuid(), nullable=False),
        sa.Column("generated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("state_hash", sa.String(length=128), nullable=False),
        sa.Column("weather_snapshot_id", Uuid(), nullable=True),
        sa.Column("air_quality_snapshot_id", Uuid(), nullable=True),
        sa.Column("water_snapshot_id", Uuid(), nullable=True),
        sa.Column("cycle_comfort_score", sa.Integer(), nullable=True),
        sa.Column("cycle_comfort_label", sa.String(length=32), nullable=True),
        sa.Column("best_outdoor_window", sa.String(length=64), nullable=True),
        sa.Column("worst_outdoor_window", sa.String(length=64), nullable=True),
        sa.Column("summary_payload", sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(
            ["air_quality_snapshot_id"],
            ["air_quality_snapshots.id"],
            name=op.f(
                "fk_dashboard_snapshots_air_quality_snapshot_id_air_quality_snapshots"
            ),
        ),
        sa.ForeignKeyConstraint(
            ["city_id"],
            ["cities.id"],
            name=op.f("fk_dashboard_snapshots_city_id_cities"),
        ),
        sa.ForeignKeyConstraint(
            ["water_snapshot_id"],
            ["water_snapshots.id"],
            name=op.f("fk_dashboard_snapshots_water_snapshot_id_water_snapshots"),
        ),
        sa.ForeignKeyConstraint(
            ["weather_snapshot_id"],
            ["weather_snapshots.id"],
            name=op.f("fk_dashboard_snapshots_weather_snapshot_id_weather_snapshots"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_dashboard_snapshots")),
    )


def downgrade() -> None:
    op.drop_table("dashboard_snapshots")
    op.drop_table("water_snapshots")
    op.drop_table("air_quality_snapshots")
    op.drop_table("weather_snapshots")
    op.drop_table("source_runs")
    op.drop_table("cities")
