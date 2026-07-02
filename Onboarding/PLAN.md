# Dutch Weather & Climate Intelligence Dashboard — MVP Spec

## 1. Product Overview

### 1.1 Working Name

**Dutch Weather Intelligence**

A web dashboard that aggregates Dutch weather, water, and air-quality data into a practical daily briefing, with an AI layer that explains what matters, why it matters, and what the user should watch.

### 1.2 Core Thesis

The MVP should not compete with general weather apps. It should interpret Dutch environmental conditions in a decision-friendly way.

The product answers questions like:

* Is today good for cycling or commuting?
* When is the best outdoor window?
* Why does the weather feel bad today?
* Are wind, rain, water, or air quality creating practical risk?
* What changed since the last forecast?
* What should I watch over the next 24 hours?

### 1.3 MVP Goal

Build a focused daily intelligence dashboard for Dutch urban users, starting with Amsterdam, Utrecht, and Rotterdam.

The MVP should combine:

* Weather observations and forecasts
* Rain timing
* Wind and gust conditions
* Air-quality signals
* Nearby water-level trend where available
* AI-generated plain-English briefing
* AI Q&A over the current dashboard state

### 1.4 Target Users

Primary users:

* Cyclists
* Commuters
* Urban residents
* People planning outdoor activities

Secondary future users:

* Homeowners in water-sensitive areas
* Municipal planners
* Elderly-care providers
* Farmers and growers
* Energy users with solar panels
* Climate adaptation researchers

### 1.5 MVP Positioning

The product is not a raw forecast provider.

It is an **interpretation layer** over trusted Dutch weather and environmental data.

Example output:

> Cycling is acceptable before 14:00, but deteriorates later because rain probability rises while gusts increase from the southwest. The worst window is 16:00–18:00.

---

## 2. MVP Scope

### 2.1 Included in MVP

The MVP includes:

1. **Location-based daily dashboard**

   * Start with Amsterdam, Utrecht, and Rotterdam.
   * User can select one of these cities.

2. **Current conditions panel**

   * Temperature
   * Rain status
   * Wind speed
   * Wind gusts
   * Wind direction
   * Weather warning status, if available
   * Air-quality summary

3. **Next 24-hour outlook**

   * Rain timing
   * Temperature trend
   * Wind/gust trend
   * Best outdoor windows
   * Worst outdoor windows

4. **Cycle comfort score**

   * Simple score from 0–100.
   * Based on rain intensity/probability, wind speed, gusts, temperature, and time of day.

5. **Air-quality card**

   * PM2.5
   * PM10
   * NO₂
   * Ozone, if available
   * Plain-language category: good, moderate, poor, unhealthy

6. **Water signal card**

   * Nearby water level where available
   * Rising/falling/stable trend
   * No flood prediction in MVP
   * Plain-language explanation only

7. **AI daily briefing**

   * “What matters today”
   * “Best time to go outside”
   * “Main risks”
   * “What changed” if prior snapshot exists

8. **Ask the Dashboard**

   * User can ask natural-language questions about current dashboard data.
   * The model may only answer using retrieved structured data and generated summaries.

### 2.2 Excluded from MVP

The MVP excludes:

* Full Netherlands coverage
* User accounts
* Push notifications
* Long-term climate scenario explorer
* Flood prediction
* Medical advice
* Trading/energy-market optimization
* Automated emergency alerts
* Highly granular postal-code risk modelling
* Direct LLM access to raw NetCDF/GRIB files

---

## 3. Key User Stories

### 3.1 Daily Briefing

As a Dutch urban resident, I want a short weather intelligence briefing so I know what matters today without reading multiple apps.

Acceptance criteria:

* User selects a city.
* Dashboard shows current conditions and 24-hour outlook.
* AI generates a short briefing based only on available data.
* Briefing includes main risk, best window, and practical recommendation.

### 3.2 Cycling Decision

As a cyclist, I want to know whether cycling is comfortable today and when conditions are worst.

Acceptance criteria:

* Dashboard shows a cycle comfort score.
* Score is broken down by rain, wind, gusts, and temperature.
* AI explains the score in plain English.
* The explanation must cite the underlying values used internally by the system.

### 3.3 Air Quality Awareness

As a user sensitive to air quality, I want a simple explanation of current air conditions.

Acceptance criteria:

* Dashboard shows air-quality category.
* Dashboard shows the pollutant most responsible for the category.
* AI explains whether conditions are improving, worsening, or stable when trend data exists.

### 3.4 Water Awareness

As a user in a low-lying Dutch city, I want to know whether nearby water levels are unusual or changing.

Acceptance criteria:

* Dashboard shows nearest relevant water-level station if available.
* System shows trend as rising, falling, or stable.
* AI explains the signal without making unsupported flood claims.

### 3.5 Ask the Dashboard

As a user, I want to ask questions like “Should I cycle at 17:00?” or “Why is today bad?”

Acceptance criteria:

* AI answers using only normalized dashboard data.
* If data is missing, AI states what is unavailable.
* AI does not invent measurements, warnings, station names, or forecasts.

---

## 4. Data Sources

### 4.1 Primary Sources

#### KNMI

Purpose:

* Weather observations
* Forecast products
* Weather warnings where available
* Historical weather and climate data in later phases

Usage in MVP:

* Current weather
* Forecast windows
* Rain, temperature, wind, gusts
* Warning status

#### Rijkswaterstaat Waterinfo

Purpose:

* Water levels
* River/canal measurements
* Discharge and related water data where relevant

Usage in MVP:

* Nearby water-level signal
* Trend: rising, falling, stable
* Basic context only

#### Luchtmeetnet / RIVM

Purpose:

* Dutch air-quality measurements

Usage in MVP:

* PM2.5
* PM10
* NO₂
* Ozone where available
* Air-quality category

### 4.2 Future Sources

Potential later additions:

* Copernicus Climate Data Store
* KNMI climate scenarios
* AHN elevation data
* Municipal open data
* Pollen feeds
* Public transport disruptions
* Road weather and traffic data
* Energy production/solar irradiance datasets

---

## 5. AI Layer

### 5.1 AI Role

The AI does not create forecasts.

The AI explains, summarizes, compares, and translates structured environmental data into user-friendly decisions.

### 5.2 AI Capabilities in MVP

1. **Daily briefing generation**

   * Converts structured dashboard state into concise natural language.

2. **Risk explanation**

   * Explains why a score or category is high/low.

3. **Question answering**

   * Answers questions about the current city, current day, and next 24 hours.

4. **Change detection summary**

   * If previous snapshots exist, explains what changed since the last update.

5. **Missing-data handling**

   * Explicitly states when data is unavailable.

### 5.3 AI Guardrails

The model must not:

* Invent weather measurements
* Invent KNMI warnings
* Invent station data
* Make emergency-level claims without source support
* Provide medical advice
* Claim flood risk beyond the system’s available data
* Present model interpretation as official government advice

The model should:

* Use only retrieved normalized data
* Mention uncertainty when relevant
* Prefer practical explanations over technical jargon
* Keep recommendations modest and conditional

### 5.4 AI Input Format

The LLM should receive a compact JSON summary, not raw source files.

Example:

```json
{
  "city": "Amsterdam",
  "timestamp_utc": "2026-05-01T08:00:00Z",
  "current": {
    "temperature_c": 12.4,
    "rain_status": "light_rain",
    "wind_speed_mps": 7.1,
    "wind_gust_mps": 12.8,
    "wind_direction": "SW"
  },
  "next_24h": {
    "rainiest_window": "16:00-18:00",
    "windiest_window": "15:00-19:00",
    "best_outdoor_window": "10:00-13:00",
    "worst_outdoor_window": "16:00-18:00"
  },
  "cycle_comfort": {
    "score": 54,
    "category": "mixed",
    "drivers": ["afternoon rain", "southwest gusts"]
  },
  "air_quality": {
    "category": "moderate",
    "main_pollutant": "NO2",
    "trend": "stable"
  },
  "water": {
    "station": "nearest_available_station",
    "trend": "rising",
    "risk_label": "watch"
  }
}
```

---

## 6. Scoring Logic

### 6.1 Cycle Comfort Score

Score range: 0–100.

Initial factors:

* Rain probability/intensity
* Wind speed
* Wind gusts
* Temperature
* Daylight or commute hour weighting

Example scoring bands:

* 80–100: Good
* 60–79: Acceptable
* 40–59: Mixed
* 20–39: Poor
* 0–19: Avoid if possible

The score should be deterministic and explainable. The LLM explains the score but does not calculate it independently.

### 6.2 Air Quality Category

Use source-provided categories where available. Otherwise calculate from pollutant thresholds using a documented method.

Categories:

* Good
* Moderate
* Poor
* Unhealthy
* Unknown

### 6.3 Water Trend

Initial trend logic:

* Rising: latest value meaningfully above recent rolling baseline
* Falling: latest value meaningfully below recent rolling baseline
* Stable: change below threshold
* Unknown: insufficient data

MVP should avoid flood prediction. Use language like “water level is rising” rather than “flood risk is high.”

---

## 7. System Architecture

### 7.1 High-Level Architecture

```text
External Data Sources
  ├─ KNMI
  ├─ Rijkswaterstaat Waterinfo
  └─ Luchtmeetnet / RIVM

Ingestion Layer
  ├─ Scheduled source adapters
  ├─ API/file fetchers
  ├─ Raw response cache
  └─ Validation checks

Storage Layer
  ├─ Postgres
  ├─ TimescaleDB extension for time series
  ├─ PostGIS extension for geospatial queries
  └─ Object storage for large raw files

Processing Layer
  ├─ Normalization
  ├─ Location/station matching
  ├─ Trend calculation
  ├─ Cycle comfort scoring
  ├─ Air-quality categorization
  └─ Dashboard summary generation

AI Layer
  ├─ Briefing generator
  ├─ Ask-the-dashboard Q&A
  ├─ Change summary generator
  └─ Guardrail validator

API Layer
  ├─ City dashboard endpoint
  ├─ 24-hour outlook endpoint
  ├─ AI briefing endpoint
  └─ AI Q&A endpoint

Frontend
  ├─ Dashboard cards
  ├─ Timeline charts
  ├─ Map panel
  ├─ AI briefing panel
  └─ Ask-the-dashboard input
```

### 7.2 Recommended Stack

Frontend:

* Next.js
* TypeScript
* Tailwind CSS
* Recharts or ECharts
* MapLibre or Leaflet for maps

Backend:

* Python FastAPI
* Pydantic for data models
* Celery, Dramatiq, or APScheduler for jobs
* HTTPX for API calls

Storage:

* PostgreSQL
* TimescaleDB
* PostGIS
* S3-compatible object storage for raw files

AI:

* LLM API for briefing and Q&A
* Structured JSON input only
* Function/tool calling optional, but not required for MVP
* Prompt templates versioned in repository

Observability:

* Structured logs
* Source freshness checks
* Failed ingestion alerts
* Data availability dashboard

### 7.3 Deployment Options

Simple MVP deployment:

* Frontend: Vercel or similar
* Backend: small VPS, Fly.io, Render, Railway, or AWS Lightsail
* Database: managed PostgreSQL if possible
* Cron/scheduled jobs: backend worker or managed scheduler

More robust deployment:

* AWS ECS/Fargate or EC2
* RDS PostgreSQL
* S3
* CloudWatch
* EventBridge Scheduler

---

## 8. Backend API Draft

### 8.1 Get Dashboard

```http
GET /api/v1/dashboard?city=amsterdam
```

Returns normalized dashboard state.

### 8.2 Get AI Briefing

```http
GET /api/v1/briefing?city=amsterdam
```

Returns generated daily briefing.

### 8.3 Ask Dashboard

```http
POST /api/v1/ask
```

Request:

```json
{
  "city": "amsterdam",
  "question": "Should I cycle at 17:00?"
}
```

Response:

```json
{
  "answer": "Cycling at 17:00 looks poor because this overlaps with the highest rain and gust window.",
  "used_data": [
    "cycle_comfort",
    "next_24h.rainiest_window",
    "next_24h.windiest_window"
  ],
  "confidence": "medium"
}
```

### 8.4 Get Source Status

```http
GET /api/v1/source-status
```

Returns source freshness and ingestion health.

---

## 9. Frontend MVP Layout

### 9.1 Main Page

Sections:

1. City selector
2. AI daily briefing
3. Current conditions cards
4. 24-hour weather timeline
5. Cycle comfort card
6. Air quality card
7. Water signal card
8. Ask-the-dashboard chat box
9. Source freshness footer

### 9.2 Card Examples

#### AI Daily Briefing

* Main takeaway
* Best outdoor window
* Worst window
* Main risk driver
* Confidence note

#### Cycle Comfort

* Score
* Category
* Best cycling window
* Worst cycling window
* Top drivers

#### Air Quality

* Category
* Main pollutant
* Trend
* Plain-language explanation

#### Water Signal

* Station name
* Current trend
* Recent change
* Caution note

---

## 10. Data Freshness Requirements

Initial MVP targets:

* Weather forecast: refresh every 1–3 hours depending on source availability
* Current observations: refresh every 10–30 minutes if supported
* Air quality: refresh hourly
* Water data: refresh every 15–60 minutes depending on source availability
* AI briefing: regenerate after dashboard summary changes meaningfully

The UI must display source freshness.

Example:

> Weather updated 23 minutes ago. Air quality updated 48 minutes ago. Water data updated 1 hour ago.

---

## 11. Reliability and Safety Requirements

### 11.1 Data Reliability

System must handle:

* Missing source data
* Delayed source data
* API failures
* Station mismatch
* Outlier values
* Partial dashboard availability

### 11.2 AI Reliability

AI responses must include:

* Grounded answer
* Data used
* Confidence label
* Missing-data disclosure when relevant

### 11.3 User Safety

The product must not be framed as an official emergency service.

Footer language:

> This dashboard summarizes public environmental data for convenience. It is not an official warning system. For severe weather or emergency guidance, consult official Dutch authorities.

---

## 12. MVP Milestones

### Milestone 1 — Static Prototype

* Design dashboard layout
* Mock city data
* Mock AI briefing
* No live data ingestion

Deliverable:

* Clickable UI prototype
* Example JSON dashboard state

### Milestone 2 — Weather Ingestion

* Connect first weather source
* Normalize current conditions and 24-hour forecast
* Populate current and outlook cards

Deliverable:

* Live weather dashboard for one city

### Milestone 3 — AI Briefing

* Generate briefing from normalized JSON
* Add guardrail prompt
* Add source freshness display

Deliverable:

* AI daily briefing based on real weather data

### Milestone 4 — Air and Water Cards

* Add air-quality source
* Add water-level source
* Add trend logic

Deliverable:

* Multi-source dashboard for one city

### Milestone 5 — Three-City MVP

* Add Amsterdam, Utrecht, Rotterdam
* Add city selector
* Add Ask-the-dashboard Q&A

Deliverable:

* Functional MVP demo

---

## 13. Success Metrics

### 13.1 Product Metrics

* User can understand the day’s main weather issue within 10 seconds.
* AI briefing is generated successfully for each supported city.
* Dashboard shows source freshness clearly.
* Ask-the-dashboard answers are grounded in available data.

### 13.2 Technical Metrics

* Ingestion success rate above 95% during normal operation.
* Dashboard API response below 500 ms excluding AI calls.
* AI briefing generation below 5 seconds.
* No hallucinated measurements in test cases.
* Graceful degradation when any source is unavailable.

### 13.3 Evaluation Metrics for AI

Use a small test set of questions:

* Should I cycle now?
* Should I cycle at 17:00?
* Why is today unpleasant?
* Is air quality bad today?
* Is water level rising?
* What changed since this morning?

Evaluate:

* Groundedness
* Helpfulness
* Refusal/missing-data behavior
* Practical clarity
* Consistency with deterministic scores

---

## 14. Open Questions

1. ~~Which exact KNMI datasets should be used first for current observations and forecasts?~~ Resolved — see `docs/specs/knmi-dataset-selection.md`.
2. What is the best station-matching method for each city?
3. Should the MVP be city-level or postal-code-level?
4. Should cycle comfort be calibrated manually or learned from user feedback later?
5. Should AI answers include citations/source labels in the UI?
6. Should historical comparison be included in MVP or saved for v2?
7. Which deployment route best matches the expected project budget and maintenance style?

---

## 15. Recommended MVP Decision

Start narrow:

* Amsterdam only for first live prototype
* Weather + AI briefing first
* Add air quality second
* Add water signal third
* Expand to Utrecht and Rotterdam after source adapters are stable

The first real demo should prove this loop:

```text
Live Dutch data → normalized dashboard state → deterministic scores → AI explanation → useful daily decision
```

That loop is the product.
