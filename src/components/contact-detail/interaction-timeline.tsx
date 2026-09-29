import { formatContactDate, parseContactDate } from "@/lib/contacts/date-time";
import type { ContactDetail, NormalizedInteraction } from "@/lib/contacts/contact-types";
import InteractionItem from "./interaction-item";

export default function InteractionTimeline({ contact }: { contact: ContactDetail }) {
  const dated = new Map<string, NormalizedInteraction[]>();
  const undated: NormalizedInteraction[] = [];
  for (const interaction of contact.interactions) {
    const key = interaction.createdAt.dateKey;
    if (key) dated.set(key, [...(dated.get(key) ?? []), interaction]);
    else undated.push(interaction);
  }
  const keys = [...dated.keys()].sort((a, b) => b.localeCompare(a));

  return (
    <section className="rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-card">
      <div className="flex items-center justify-between border-b border-border-subtle pb-space-md"><h2 className="font-heading text-headline-sm">Línea de tiempo de interacciones</h2><span className="rounded-full border border-border-subtle bg-surface-subtle px-2 py-0.5 text-label-sm text-on-surface-variant">{contact.interactions.length} eventos</span></div>
      {contact.interactions.length === 0 ? <p className="pt-space-lg text-body-sm text-on-surface-variant">No hay interacciones registradas.</p> : <div className="space-y-space-lg pt-space-md">
        {keys.map((key) => {
          const entries = dated.get(key) ?? [];
          const timed = entries.filter((item) => item.createdAt.kind === "instant");
          const dateOnly = entries.filter((item) => item.createdAt.kind === "date-only");
          return <section key={key} aria-labelledby={`timeline-${key}`}>
            <h3 id={`timeline-${key}`} className="mb-space-sm text-label-sm uppercase text-on-surface-variant">{formatContactDate(parseContactDate(key)) ?? key}</h3>
            {timed.length > 0 && <ol>{timed.map((item, index) => <InteractionItem interaction={item} key={item.id ?? `timed-${index}`} />)}</ol>}
            {dateOnly.length > 0 && <div className="rounded-md bg-surface-subtle px-space-md"><p className="pt-space-sm text-label-sm text-on-surface-variant">Hora no disponible</p><ol>{dateOnly.map((item, index) => <InteractionItem interaction={item} key={item.id ?? `date-${index}`} />)}</ol></div>}
          </section>;
        })}
        {undated.length > 0 && <section aria-labelledby="timeline-undated"><h3 id="timeline-undated" className="mb-space-sm text-label-sm uppercase text-on-surface-variant">Fecha no disponible</h3><ol>{undated.map((item, index) => <InteractionItem interaction={item} key={item.id ?? `undated-${index}`} />)}</ol></section>}
      </div>}
    </section>
  );
}
