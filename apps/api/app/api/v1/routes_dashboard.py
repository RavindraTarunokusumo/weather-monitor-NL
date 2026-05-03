"""Seeded dashboard routes."""

from __future__ import annotations

from collections.abc import Generator
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import City, DashboardSnapshot, SourceRun
from app.db.session import get_session_factory
from app.schemas.dashboard import CityOption, DashboardResponse, SourceStatusResponse

router = APIRouter(prefix="/api/v1", tags=["dashboard"])


def get_request_session(request: Request) -> Generator[Session, None, None]:
    session_factory = get_session_factory(request.app.state.settings.database_url)
    session = session_factory()
    try:
        yield session
    finally:
        session.close()


SessionDep = Annotated[Session, Depends(get_request_session)]


@router.get("/cities", response_model=list[CityOption])
def list_cities(session: SessionDep) -> list[CityOption]:
    cities = session.scalars(
        select(City).where(City.is_active.is_(True)).order_by(City.slug)
    ).all()
    return [
        CityOption(
            slug=city.slug,
            name=city.name,
            country_code=city.country_code,
            timezone=city.timezone,
            is_active=city.is_active,
        )
        for city in cities
    ]


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    session: SessionDep,
    city: str = Query(..., min_length=1),
) -> DashboardResponse:
    city_record = session.scalar(
        select(City).where(City.slug == city, City.is_active.is_(True))
    )
    if city_record is None:
        raise HTTPException(status_code=404, detail="Unsupported city")

    snapshot = session.scalar(
        select(DashboardSnapshot)
        .where(DashboardSnapshot.city_id == city_record.id)
        .order_by(DashboardSnapshot.generated_at.desc())
    )
    if snapshot is None:
        raise HTTPException(status_code=404, detail="Dashboard unavailable")

    summary = snapshot.summary_payload
    return DashboardResponse(
        city=CityOption(
            slug=city_record.slug,
            name=city_record.name,
            country_code=city_record.country_code,
            timezone=city_record.timezone,
            is_active=city_record.is_active,
        ),
        generated_at=snapshot.generated_at,
        source_freshness=summary["source_freshness"],
        current=summary["current"],
        next_24h=summary["next_24h"],
        cycle_comfort=summary["cycle_comfort"],
        air_quality=summary["air_quality"],
        water_signal=summary["water_signal"],
    )


@router.get("/source-status", response_model=SourceStatusResponse)
def get_source_status(session: SessionDep) -> SourceStatusResponse:
    source_runs = session.scalars(
        select(SourceRun).order_by(SourceRun.source_name)
    ).all()
    return SourceStatusResponse(
        sources=[
            {
                "source_name": source_run.source_name,
                "job_type": source_run.job_type,
                "status": source_run.status,
                "started_at": source_run.started_at,
                "finished_at": source_run.finished_at,
                "records_fetched": source_run.records_fetched,
                "records_stored": source_run.records_stored,
                "error_message": source_run.error_message,
                "metadata": source_run.run_metadata,
            }
            for source_run in source_runs
        ]
    )
