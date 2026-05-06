type Props = { briefing: string | null };

export function BriefingCard({ briefing }: Props) {
  return (
    <section className="briefing-card" aria-label="Daily briefing">
      <p className="eyebrow">Today&#39;s briefing</p>
      <p className="briefing-text">
        {briefing ?? "No briefing is available for this snapshot."}
      </p>
    </section>
  );
}
