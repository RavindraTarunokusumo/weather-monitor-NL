"""Health endpoint tests."""

from app.main import create_app
from fastapi.testclient import TestClient


def test_health_returns_expected_payload() -> None:
    client = TestClient(create_app())

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "dutch-weather-api",
        "version": "0.1.0",
    }
