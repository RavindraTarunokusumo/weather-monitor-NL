"""Shared fixture validation for the seeded dashboard contract."""

import json
from pathlib import Path

from app.core.config import Settings
from app.main import create_app
from app.tests.support import seed_database
from fastapi.testclient import TestClient


def test_amsterdam_fixture_matches_seeded_dashboard_response(tmp_path) -> None:
    database_url = seed_database(tmp_path)

    with TestClient(create_app(Settings(database_url=database_url))) as client:
        response = client.get("/api/v1/dashboard", params={"city": "amsterdam"})

    fixture_path = (
        Path(__file__).resolve().parents[4]
        / "packages"
        / "shared"
        / "fixtures"
        / "dashboard-amsterdam.json"
    )
    fixture_payload = json.loads(fixture_path.read_text(encoding="utf-8"))

    assert response.status_code == 200
    assert response.json() == fixture_payload
