"""Health endpoint for the API scaffold."""

from fastapi import APIRouter

from app import __version__
from app.schemas.health import HealthResponse

router = APIRouter()

SERVICE_NAME = "dutch-weather-api"


@router.get("/health", response_model=HealthResponse, tags=["health"])
def get_health() -> HealthResponse:
    return HealthResponse(status="ok", service=SERVICE_NAME, version=__version__)
