"""Deterministic seed data for the dashboard foundation."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

SEED_GENERATED_AT = datetime(2026, 5, 3, 6, 0, tzinfo=UTC)


def _freshness_entry(
    source_name: str,
    observed_at: datetime,
    ingested_at: datetime,
    status: str,
) -> dict[str, str]:
    return {
        "source_name": source_name,
        "status": status,
        "observed_at": observed_at.isoformat(),
        "ingested_at": ingested_at.isoformat(),
    }


def build_seed_payloads() -> list[dict[str, object]]:
    generated_at = SEED_GENERATED_AT
    weather_observed_at = generated_at - timedelta(minutes=30)
    air_observed_at = generated_at - timedelta(minutes=55)
    water_observed_at = generated_at - timedelta(minutes=75)

    return [
        {
            "city": {
                "slug": "amsterdam",
                "name": "Amsterdam",
                "country_code": "NL",
                "latitude": 52.3676,
                "longitude": 4.9041,
                "timezone": "Europe/Amsterdam",
            },
            "weather": {
                "observed_at": weather_observed_at,
                "ingested_at": generated_at,
                "temperature_c": 16.4,
                "feels_like_c": 15.8,
                "rain_mm": 0.6,
                "rain_probability": 35.0,
                "wind_speed_kmh": 19.0,
                "wind_gust_kmh": 28.0,
                "wind_direction": "SW",
                "weather_code": "partly_cloudy",
                "warning_level": "none",
                "source_name": "knmi",
            },
            "air_quality": {
                "observed_at": air_observed_at,
                "ingested_at": generated_at,
                "aqi_value": 41.0,
                "aqi_label": "good",
                "pm25": 9.1,
                "pm10": 14.8,
                "no2": 18.3,
                "o3": 44.0,
                "so2": 2.1,
                "main_pollutant": "pm10",
                "trend_label": "steady",
                "source_name": "luchtmeetnet",
            },
            "water": {
                "station_id": "ams-water-01",
                "station_name": "Amsterdam Binnenwater",
                "observed_at": water_observed_at,
                "ingested_at": generated_at,
                "water_level_cm": 24.0,
                "trend_label": "stable",
                "risk_label": "low",
                "source_name": "rijkswaterstaat",
            },
            "dashboard": {
                "generated_at": generated_at,
                "cycle_comfort_score": 73,
                "cycle_comfort_label": "good",
                "best_outdoor_window": "13:00-16:00",
                "worst_outdoor_window": "20:00-22:00",
                "summary_payload": {
                    "city_slug": "amsterdam",
                    "source_freshness": [
                        _freshness_entry(
                            "knmi", weather_observed_at, generated_at, "fresh"
                        ),
                        _freshness_entry(
                            "luchtmeetnet", air_observed_at, generated_at, "fresh"
                        ),
                        _freshness_entry(
                            "rijkswaterstaat", water_observed_at, generated_at, "fresh"
                        ),
                    ],
                    "current": {
                        "temperature_c": 16.4,
                        "feels_like_c": 15.8,
                        "condition": "Partly cloudy",
                        "wind_speed_kmh": 19.0,
                        "rain_probability": 35.0,
                    },
                    "next_24h": {
                        "summary": (
                            "Dry late morning, breezier evening, light showers"
                            " after sunset."
                        ),
                        "periods": [
                            {
                                "label": "Morning",
                                "temperature_c": 15.0,
                                "rain_probability": 20.0,
                            },
                            {
                                "label": "Afternoon",
                                "temperature_c": 18.0,
                                "rain_probability": 15.0,
                            },
                            {
                                "label": "Evening",
                                "temperature_c": 13.0,
                                "rain_probability": 55.0,
                            },
                        ],
                    },
                    "cycle_comfort": {
                        "score": 73,
                        "label": "good",
                        "best_window": "13:00-16:00",
                        "worst_window": "20:00-22:00",
                    },
                    "air_quality": {
                        "aqi_value": 41.0,
                        "label": "good",
                        "main_pollutant": "pm10",
                        "trend": "steady",
                    },
                    "water_signal": {
                        "level_cm": 24.0,
                        "trend": "stable",
                        "risk": "low",
                    },
                },
            },
        },
        {
            "city": {
                "slug": "utrecht",
                "name": "Utrecht",
                "country_code": "NL",
                "latitude": 52.0907,
                "longitude": 5.1214,
                "timezone": "Europe/Amsterdam",
            },
            "weather": {
                "observed_at": weather_observed_at,
                "ingested_at": generated_at,
                "temperature_c": 17.1,
                "feels_like_c": 16.7,
                "rain_mm": 0.2,
                "rain_probability": 25.0,
                "wind_speed_kmh": 15.0,
                "wind_gust_kmh": 23.0,
                "wind_direction": "W",
                "weather_code": "bright",
                "warning_level": "none",
                "source_name": "knmi",
            },
            "air_quality": {
                "observed_at": air_observed_at,
                "ingested_at": generated_at,
                "aqi_value": 46.0,
                "aqi_label": "good",
                "pm25": 10.2,
                "pm10": 15.1,
                "no2": 15.4,
                "o3": 39.5,
                "so2": 1.9,
                "main_pollutant": "pm25",
                "trend_label": "improving",
                "source_name": "luchtmeetnet",
            },
            "water": {
                "station_id": "utr-water-01",
                "station_name": "Utrecht Kromme Rijn",
                "observed_at": water_observed_at,
                "ingested_at": generated_at,
                "water_level_cm": 19.0,
                "trend_label": "falling",
                "risk_label": "low",
                "source_name": "rijkswaterstaat",
            },
            "dashboard": {
                "generated_at": generated_at,
                "cycle_comfort_score": 78,
                "cycle_comfort_label": "good",
                "best_outdoor_window": "11:00-15:00",
                "worst_outdoor_window": "21:00-23:00",
                "summary_payload": {
                    "city_slug": "utrecht",
                    "source_freshness": [
                        _freshness_entry(
                            "knmi", weather_observed_at, generated_at, "fresh"
                        ),
                        _freshness_entry(
                            "luchtmeetnet", air_observed_at, generated_at, "fresh"
                        ),
                        _freshness_entry(
                            "rijkswaterstaat", water_observed_at, generated_at, "fresh"
                        ),
                    ],
                    "current": {
                        "temperature_c": 17.1,
                        "feels_like_c": 16.7,
                        "condition": "Bright",
                        "wind_speed_kmh": 15.0,
                        "rain_probability": 25.0,
                    },
                    "next_24h": {
                        "summary": (
                            "Comfortable midday with light wind, drizzle possible"
                            " late evening."
                        ),
                        "periods": [
                            {
                                "label": "Morning",
                                "temperature_c": 14.0,
                                "rain_probability": 18.0,
                            },
                            {
                                "label": "Afternoon",
                                "temperature_c": 19.0,
                                "rain_probability": 12.0,
                            },
                            {
                                "label": "Evening",
                                "temperature_c": 12.0,
                                "rain_probability": 48.0,
                            },
                        ],
                    },
                    "cycle_comfort": {
                        "score": 78,
                        "label": "good",
                        "best_window": "11:00-15:00",
                        "worst_window": "21:00-23:00",
                    },
                    "air_quality": {
                        "aqi_value": 46.0,
                        "label": "good",
                        "main_pollutant": "pm25",
                        "trend": "improving",
                    },
                    "water_signal": {
                        "level_cm": 19.0,
                        "trend": "falling",
                        "risk": "low",
                    },
                },
            },
        },
        {
            "city": {
                "slug": "rotterdam",
                "name": "Rotterdam",
                "country_code": "NL",
                "latitude": 51.9244,
                "longitude": 4.4777,
                "timezone": "Europe/Amsterdam",
            },
            "weather": {
                "observed_at": weather_observed_at,
                "ingested_at": generated_at,
                "temperature_c": 15.2,
                "feels_like_c": 14.5,
                "rain_mm": 0.8,
                "rain_probability": 42.0,
                "wind_speed_kmh": 24.0,
                "wind_gust_kmh": 34.0,
                "wind_direction": "SW",
                "weather_code": "windy",
                "warning_level": "none",
                "source_name": "knmi",
            },
            "air_quality": {
                "observed_at": air_observed_at,
                "ingested_at": generated_at,
                "aqi_value": 52.0,
                "aqi_label": "moderate",
                "pm25": 12.7,
                "pm10": 19.2,
                "no2": 24.6,
                "o3": 35.3,
                "so2": 3.0,
                "main_pollutant": "no2",
                "trend_label": "steady",
                "source_name": "luchtmeetnet",
            },
            "water": {
                "station_id": "rot-water-01",
                "station_name": "Rotterdam Nieuwe Maas",
                "observed_at": water_observed_at,
                "ingested_at": generated_at,
                "water_level_cm": 31.0,
                "trend_label": "rising",
                "risk_label": "watch",
                "source_name": "rijkswaterstaat",
            },
            "dashboard": {
                "generated_at": generated_at,
                "cycle_comfort_score": 62,
                "cycle_comfort_label": "mixed",
                "best_outdoor_window": "12:00-14:00",
                "worst_outdoor_window": "18:00-22:00",
                "summary_payload": {
                    "city_slug": "rotterdam",
                    "source_freshness": [
                        _freshness_entry(
                            "knmi", weather_observed_at, generated_at, "fresh"
                        ),
                        _freshness_entry(
                            "luchtmeetnet", air_observed_at, generated_at, "fresh"
                        ),
                        _freshness_entry(
                            "rijkswaterstaat", water_observed_at, generated_at, "fresh"
                        ),
                    ],
                    "current": {
                        "temperature_c": 15.2,
                        "feels_like_c": 14.5,
                        "condition": "Windy",
                        "wind_speed_kmh": 24.0,
                        "rain_probability": 42.0,
                    },
                    "next_24h": {
                        "summary": (
                            "Breezy harbor conditions with a damp evening commute"
                            " window."
                        ),
                        "periods": [
                            {
                                "label": "Morning",
                                "temperature_c": 13.0,
                                "rain_probability": 28.0,
                            },
                            {
                                "label": "Afternoon",
                                "temperature_c": 16.0,
                                "rain_probability": 22.0,
                            },
                            {
                                "label": "Evening",
                                "temperature_c": 11.0,
                                "rain_probability": 60.0,
                            },
                        ],
                    },
                    "cycle_comfort": {
                        "score": 62,
                        "label": "mixed",
                        "best_window": "12:00-14:00",
                        "worst_window": "18:00-22:00",
                    },
                    "air_quality": {
                        "aqi_value": 52.0,
                        "label": "moderate",
                        "main_pollutant": "no2",
                        "trend": "steady",
                    },
                    "water_signal": {
                        "level_cm": 31.0,
                        "trend": "rising",
                        "risk": "watch",
                    },
                },
            },
        },
    ]
