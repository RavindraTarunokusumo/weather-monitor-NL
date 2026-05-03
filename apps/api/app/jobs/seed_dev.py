"""Seed deterministic development data for the dashboard foundation."""

from __future__ import annotations

import argparse
import hashlib
import json

from sqlalchemy import delete

from app.db.models import (
    AirQualitySnapshot,
    City,
    DashboardSnapshot,
    SourceRun,
    WaterSnapshot,
    WeatherSnapshot,
)
from app.db.session import get_session_factory
from app.services.dashboard_seed import build_seed_payloads


def _state_hash(payload: dict[str, object]) -> str:
    encoded = json.dumps(payload, sort_keys=True).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def seed_development_data(database_url: str | None = None) -> None:
    session_factory = get_session_factory(database_url)
    seed_payloads = build_seed_payloads()

    with session_factory.begin() as session:
        session.execute(delete(DashboardSnapshot))
        session.execute(delete(WaterSnapshot))
        session.execute(delete(AirQualitySnapshot))
        session.execute(delete(WeatherSnapshot))
        session.execute(delete(SourceRun))
        session.execute(delete(City))

        source_runs = [
            SourceRun(
                source_name="knmi",
                job_type="seed_weather",
                status="success",
                started_at=seed_payloads[0]["dashboard"]["generated_at"],
                finished_at=seed_payloads[0]["dashboard"]["generated_at"],
                records_fetched=len(seed_payloads),
                records_stored=len(seed_payloads),
                run_metadata={"mode": "seed"},
            ),
            SourceRun(
                source_name="luchtmeetnet",
                job_type="seed_air_quality",
                status="success",
                started_at=seed_payloads[0]["dashboard"]["generated_at"],
                finished_at=seed_payloads[0]["dashboard"]["generated_at"],
                records_fetched=len(seed_payloads),
                records_stored=len(seed_payloads),
                run_metadata={"mode": "seed"},
            ),
            SourceRun(
                source_name="rijkswaterstaat",
                job_type="seed_water",
                status="success",
                started_at=seed_payloads[0]["dashboard"]["generated_at"],
                finished_at=seed_payloads[0]["dashboard"]["generated_at"],
                records_fetched=len(seed_payloads),
                records_stored=len(seed_payloads),
                run_metadata={"mode": "seed"},
            ),
        ]
        session.add_all(source_runs)

        for seed_payload in seed_payloads:
            city = City(
                created_at=seed_payload["dashboard"]["generated_at"],
                **seed_payload["city"],
            )
            session.add(city)
            session.flush()

            weather_snapshot = WeatherSnapshot(
                city_id=city.id, **seed_payload["weather"]
            )
            air_quality_snapshot = AirQualitySnapshot(
                city_id=city.id, **seed_payload["air_quality"]
            )
            water_snapshot = WaterSnapshot(city_id=city.id, **seed_payload["water"])
            session.add_all([weather_snapshot, air_quality_snapshot, water_snapshot])
            session.flush()

            dashboard_payload = seed_payload["dashboard"]
            session.add(
                DashboardSnapshot(
                    city_id=city.id,
                    generated_at=dashboard_payload["generated_at"],
                    state_hash=_state_hash(dashboard_payload["summary_payload"]),
                    weather_snapshot_id=weather_snapshot.id,
                    air_quality_snapshot_id=air_quality_snapshot.id,
                    water_snapshot_id=water_snapshot.id,
                    cycle_comfort_score=dashboard_payload["cycle_comfort_score"],
                    cycle_comfort_label=dashboard_payload["cycle_comfort_label"],
                    best_outdoor_window=dashboard_payload["best_outdoor_window"],
                    worst_outdoor_window=dashboard_payload["worst_outdoor_window"],
                    summary_payload=dashboard_payload["summary_payload"],
                )
            )


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed dashboard foundation data.")
    parser.add_argument("--database-url", dest="database_url", default=None)
    args = parser.parse_args()
    seed_development_data(args.database_url)


if __name__ == "__main__":
    main()
