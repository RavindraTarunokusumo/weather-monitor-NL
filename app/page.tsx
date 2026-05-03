import { headers } from "next/headers";

export const dynamic = "force-dynamic";

type DashboardResponse = {
  city: {
    slug: string;
    name: string;
    timezone: string;
  };
  generated_at: string;
  briefing: string | null;
  current: {
    temperature_c: number | null;
    feels_like_c: number | null;
    rain_mm: number | null;
    rain_probability: number | null;
    wind_speed_kmh: number | null;
    wind_gust_kmh: number | null;
    wind_direction: string | null;
    warning_level: string | null;
  };
  cycle_comfort: {
    score: number | null;
    label: string | null;
    best_outdoor_window: string | null;
    worst_outdoor_window: string | null;
  };
  air_quality: {
    aqi_value: number | null;
    label: string | null;
    main_pollutant: string | null;
    trend: string | null;
  };
  water_signal: {
    station_name: string | null;
    water_level_cm: number | null;
    trend: string | null;
    risk_label: string | null;
  };
  source_freshness: Array<{
    source: string;
    updated_at: string | null;
  }>;
};

async function getDashboard(): Promise<DashboardResponse> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = process.env.VERCEL === "1" ? "https" : "http";
  const response = await fetch(`${protocol}://${host}/api/dashboard?city=amsterdam`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Dashboard API returned ${response.status}`);
  }

  return response.json();
}

function formatDate(value: string | null) {
  if (!value) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-NL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Amsterdam",
  }).format(new Date(value));
}

function formatPercent(value: number | null) {
  return value === null ? "unknown rain chance" : `${Math.round(value * 100)}% rain chance`;
}

export default async function Home() {
  let dashboard: DashboardResponse;

  try {
    dashboard = await getDashboard();
  } catch (error) {
    return (
      <main className="page-shell">
        <div className="error-box">
          <p className="eyebrow">Dashboard unavailable</p>
          <h1>Amsterdam data could not be loaded</h1>
          <p className="subtitle">
            Start PostgreSQL, run the Prisma migration and seed command, then refresh this page.
          </p>
          <p className="metric-detail">{error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Seeded dashboard</p>
          <h1>{dashboard.city.name}</h1>
          <p className="subtitle">
            Database-backed mock weather, air-quality, and water signals served through Next.js
            Route Handlers.
          </p>
        </div>
        <div className="generated">
          <strong>Generated</strong>
          <br />
          {formatDate(dashboard.generated_at)}
        </div>
      </header>

      <section className="briefing" aria-label="Daily briefing">
        <p>{dashboard.briefing ?? "No briefing is available for this dashboard snapshot."}</p>
      </section>

      <section className="card-grid" aria-label="Amsterdam dashboard metrics">
        <article className="metric-card">
          <h2>Current weather</h2>
          <p className="metric-value">
            {dashboard.current.temperature_c ?? "?"}
            {dashboard.current.temperature_c === null ? "" : "°C"}
          </p>
          <p className="metric-detail">
            Feels like {dashboard.current.feels_like_c ?? "?"}°C, {formatPercent(dashboard.current.rain_probability)}.
            Wind {dashboard.current.wind_speed_kmh ?? "?"} km/h {dashboard.current.wind_direction ?? ""}.
          </p>
        </article>

        <article className="metric-card">
          <h2>Cycle comfort</h2>
          <p className="metric-value">{dashboard.cycle_comfort.score ?? "?"}</p>
          <p className="metric-detail">
            {dashboard.cycle_comfort.label ?? "unknown"} conditions. Best window{" "}
            {dashboard.cycle_comfort.best_outdoor_window ?? "unknown"}.
          </p>
        </article>

        <article className="metric-card">
          <h2>Air quality</h2>
          <p className="metric-value">{dashboard.air_quality.label ?? "Unknown"}</p>
          <p className="metric-detail">
            AQI {dashboard.air_quality.aqi_value ?? "?"}, main pollutant{" "}
            {dashboard.air_quality.main_pollutant ?? "unknown"}, trend{" "}
            {dashboard.air_quality.trend ?? "unknown"}.
          </p>
        </article>

        <article className="metric-card">
          <h2>Water signal</h2>
          <p className="metric-value">{dashboard.water_signal.risk_label ?? "Unknown"}</p>
          <p className="metric-detail">
            {dashboard.water_signal.station_name ?? "No station"}:{" "}
            {dashboard.water_signal.water_level_cm ?? "?"} cm, trend{" "}
            {dashboard.water_signal.trend ?? "unknown"}.
          </p>
        </article>
      </section>

      <section className="freshness" aria-label="Source freshness">
        <h2>Source freshness</h2>
        <div className="freshness-list">
          {dashboard.source_freshness.map((item) => (
            <div key={item.source} className="freshness-item">
              <strong>{item.source}</strong>
              <span>{formatDate(item.updated_at)}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
