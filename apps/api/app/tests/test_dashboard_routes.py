"""Route coverage for the seeded dashboard API."""

from app.core.config import Settings
from app.main import create_app
from app.tests.support import seed_database
from fastapi.testclient import TestClient


def test_cities_returns_seeded_supported_cities(tmp_path) -> None:
    database_url = seed_database(tmp_path)

    with TestClient(create_app(Settings(database_url=database_url))) as client:
        response = client.get("/api/v1/cities")

    assert response.status_code == 200
    assert [city["slug"] for city in response.json()] == [
        "amsterdam",
        "rotterdam",
        "utrecht",
    ]


def test_dashboard_returns_seeded_amsterdam_snapshot(tmp_path) -> None:
    database_url = seed_database(tmp_path)

    with TestClient(create_app(Settings(database_url=database_url))) as client:
        response = client.get("/api/v1/dashboard", params={"city": "amsterdam"})

    assert response.status_code == 200
    payload = response.json()
    assert payload["city"]["slug"] == "amsterdam"
    assert payload["current"]["temperature_c"] == 16.4
    assert len(payload["source_freshness"]) == 3
    assert payload["cycle_comfort"]["label"] == "good"


def test_dashboard_rejects_unsupported_city(tmp_path) -> None:
    database_url = seed_database(tmp_path)

    with TestClient(create_app(Settings(database_url=database_url))) as client:
        response = client.get("/api/v1/dashboard", params={"city": "the-hague"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Unsupported city"


def test_source_status_returns_seeded_source_runs(tmp_path) -> None:
    database_url = seed_database(tmp_path)

    with TestClient(create_app(Settings(database_url=database_url))) as client:
        response = client.get("/api/v1/source-status")

    assert response.status_code == 200
    payload = response.json()
    assert [source["source_name"] for source in payload["sources"]] == [
        "knmi",
        "luchtmeetnet",
        "rijkswaterstaat",
    ]
