"""Response models for seeded dashboard routes."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class CityOption(BaseModel):
    slug: str
    name: str
    country_code: str
    timezone: str
    is_active: bool


class SourceFreshness(BaseModel):
    source_name: str
    status: str
    observed_at: datetime
    ingested_at: datetime


class CurrentWeather(BaseModel):
    temperature_c: float | None = None
    feels_like_c: float | None = None
    condition: str | None = None
    wind_speed_kmh: float | None = None
    rain_probability: float | None = None


class OutlookPeriod(BaseModel):
    label: str
    temperature_c: float | None = None
    rain_probability: float | None = None


class Outlook24h(BaseModel):
    summary: str | None = None
    periods: list[OutlookPeriod] = Field(default_factory=list)


class CycleComfort(BaseModel):
    score: int | None = None
    label: str | None = None
    best_window: str | None = None
    worst_window: str | None = None


class AirQuality(BaseModel):
    aqi_value: float | None = None
    label: str | None = None
    main_pollutant: str | None = None
    trend: str | None = None


class WaterSignal(BaseModel):
    level_cm: float | None = None
    trend: str | None = None
    risk: str | None = None


class DashboardResponse(BaseModel):
    city: CityOption
    generated_at: datetime
    source_freshness: list[SourceFreshness]
    current: CurrentWeather | None = None
    next_24h: Outlook24h | None = None
    cycle_comfort: CycleComfort | None = None
    air_quality: AirQuality | None = None
    water_signal: WaterSignal | None = None


class SourceStatusRecord(BaseModel):
    source_name: str
    job_type: str
    status: str
    started_at: datetime
    finished_at: datetime | None = None
    records_fetched: int
    records_stored: int
    error_message: str | None = None
    metadata: dict | None = None


class SourceStatusResponse(BaseModel):
    sources: list[SourceStatusRecord]
