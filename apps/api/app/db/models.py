"""ORM models for the seeded dashboard foundation."""

from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Uuid

from app.db.base import Base


class City(Base):
    __tablename__ = "cities"

    id: Mapped[str] = mapped_column(Uuid, primary_key=True, default=uuid4)
    slug: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    country_code: Mapped[str] = mapped_column(String(2), nullable=False, default="NL")
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    timezone: Mapped[str] = mapped_column(
        String(64), nullable=False, default="Europe/Amsterdam"
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )


class SourceRun(Base):
    __tablename__ = "source_runs"

    id: Mapped[str] = mapped_column(Uuid, primary_key=True, default=uuid4)
    source_name: Mapped[str] = mapped_column(String(64), nullable=False)
    job_type: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    finished_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    records_fetched: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    records_stored: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    run_metadata: Mapped[dict | None] = mapped_column("metadata", JSON, nullable=True)


class WeatherSnapshot(Base):
    __tablename__ = "weather_snapshots"

    id: Mapped[str] = mapped_column(Uuid, primary_key=True, default=uuid4)
    city_id: Mapped[str] = mapped_column(Uuid, ForeignKey("cities.id"), nullable=False)
    observed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    ingested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    temperature_c: Mapped[float | None] = mapped_column(Float, nullable=True)
    feels_like_c: Mapped[float | None] = mapped_column(Float, nullable=True)
    rain_mm: Mapped[float | None] = mapped_column(Float, nullable=True)
    rain_probability: Mapped[float | None] = mapped_column(Float, nullable=True)
    wind_speed_kmh: Mapped[float | None] = mapped_column(Float, nullable=True)
    wind_gust_kmh: Mapped[float | None] = mapped_column(Float, nullable=True)
    wind_direction: Mapped[str | None] = mapped_column(String(16), nullable=True)
    weather_code: Mapped[str | None] = mapped_column(String(32), nullable=True)
    warning_level: Mapped[str | None] = mapped_column(String(32), nullable=True)
    source_name: Mapped[str] = mapped_column(String(64), nullable=False)
    source_payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)


class AirQualitySnapshot(Base):
    __tablename__ = "air_quality_snapshots"

    id: Mapped[str] = mapped_column(Uuid, primary_key=True, default=uuid4)
    city_id: Mapped[str] = mapped_column(Uuid, ForeignKey("cities.id"), nullable=False)
    observed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    ingested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    aqi_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    aqi_label: Mapped[str | None] = mapped_column(String(32), nullable=True)
    pm25: Mapped[float | None] = mapped_column(Float, nullable=True)
    pm10: Mapped[float | None] = mapped_column(Float, nullable=True)
    no2: Mapped[float | None] = mapped_column(Float, nullable=True)
    o3: Mapped[float | None] = mapped_column(Float, nullable=True)
    so2: Mapped[float | None] = mapped_column(Float, nullable=True)
    main_pollutant: Mapped[str | None] = mapped_column(String(32), nullable=True)
    trend_label: Mapped[str | None] = mapped_column(String(32), nullable=True)
    source_name: Mapped[str] = mapped_column(String(64), nullable=False)
    source_payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)


class WaterSnapshot(Base):
    __tablename__ = "water_snapshots"

    id: Mapped[str] = mapped_column(Uuid, primary_key=True, default=uuid4)
    city_id: Mapped[str] = mapped_column(Uuid, ForeignKey("cities.id"), nullable=False)
    station_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    station_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    observed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    ingested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    water_level_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    trend_label: Mapped[str | None] = mapped_column(String(32), nullable=True)
    risk_label: Mapped[str | None] = mapped_column(String(32), nullable=True)
    source_name: Mapped[str] = mapped_column(String(64), nullable=False)
    source_payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)


class DashboardSnapshot(Base):
    __tablename__ = "dashboard_snapshots"

    id: Mapped[str] = mapped_column(Uuid, primary_key=True, default=uuid4)
    city_id: Mapped[str] = mapped_column(Uuid, ForeignKey("cities.id"), nullable=False)
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    state_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    weather_snapshot_id: Mapped[str | None] = mapped_column(
        Uuid,
        ForeignKey("weather_snapshots.id"),
        nullable=True,
    )
    air_quality_snapshot_id: Mapped[str | None] = mapped_column(
        Uuid,
        ForeignKey("air_quality_snapshots.id"),
        nullable=True,
    )
    water_snapshot_id: Mapped[str | None] = mapped_column(
        Uuid,
        ForeignKey("water_snapshots.id"),
        nullable=True,
    )
    cycle_comfort_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cycle_comfort_label: Mapped[str | None] = mapped_column(String(32), nullable=True)
    best_outdoor_window: Mapped[str | None] = mapped_column(String(64), nullable=True)
    worst_outdoor_window: Mapped[str | None] = mapped_column(String(64), nullable=True)
    summary_payload: Mapped[dict] = mapped_column(JSON, nullable=False)
