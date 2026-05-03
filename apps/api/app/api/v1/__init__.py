"""API v1 router exports."""

from fastapi import APIRouter

from app.api.v1.routes_dashboard import router as dashboard_router

router = APIRouter()
router.include_router(dashboard_router)
