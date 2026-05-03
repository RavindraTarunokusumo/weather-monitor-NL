const developmentSteps = [
  "Start PostgreSQL with Docker Compose.",
  "Run the FastAPI backend with the local health route.",
  "Run the Next.js frontend and keep it pointed at the API contract.",
];

const runtimeFacts = [
  {
    label: "Backend contract",
    value: "GET /health returns service status and version only.",
  },
  {
    label: "Database",
    value: "PostgreSQL is the local persistence target from the start.",
  },
  {
    label: "Frontend policy",
    value: "The browser app talks to the backend, not weather providers directly.",
  },
];

const healthResponse = `{
  "status": "ok",
  "service": "dutch-weather-api",
  "version": "0.1.0"
}`;

const commands = [
  "docker compose -f infra/docker/docker-compose.yml up -d postgres",
  "cd apps/api && uv run fastapi dev app/main.py",
  "cd apps/web && npm run dev",
];

export default function Home() {
  return (
    <main className="page">
      <section className="hero-shell">
        <div className="hero-copy">
          <span className="eyebrow">Project scaffold</span>
          <h1>Dutch Weather Intelligence</h1>
          <p className="lede">
            A local-first foundation for Dutch weather, water, and air-quality intelligence.
            The backend owns the source contract, the frontend stays focused on presentation,
            and local development stays reproducible.
          </p>

          <div className="step-list" aria-label="Local development steps">
            {developmentSteps.map((step, index) => (
              <div key={step} className="step-item">
                <span className="step-index">{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="status-panel" aria-label="Health endpoint preview">
          <div className="panel-label">Backend contract preview</div>
          <pre className="code-block">
            <code>{healthResponse}</code>
          </pre>
          <p className="panel-note">
            This is the first endpoint in the scaffold. It stays intentionally small so the
            local runtime can be verified before real data ingestion arrives.
          </p>
        </aside>
      </section>

      <section className="card-grid" aria-label="Scaffold summary">
        {runtimeFacts.map((fact) => (
          <article key={fact.label} className="info-card">
            <span className="card-kicker">{fact.label}</span>
            <p>{fact.value}</p>
          </article>
        ))}
      </section>

      <section className="command-shell" aria-label="Useful commands">
        <div>
          <span className="card-kicker">Local commands</span>
          <h2>Start the scaffold from a fresh clone</h2>
        </div>
        <div className="command-list">
          {commands.map((command) => (
            <pre key={command} className="command-item">
              <code>{command}</code>
            </pre>
          ))}
        </div>
      </section>
    </main>
  );
}
