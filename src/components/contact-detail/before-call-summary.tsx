import { formatContactDate } from "@/lib/contacts/date-time";
import { formatQualificationValue } from "@/lib/contacts/contact-normalization";
import type { ContactDetail, QualificationFact } from "@/lib/contacts/contact-types";

function displayValue(fact: QualificationFact) {
  const value = fact.originalValue;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    const min = typeof record.min === "number" ? record.min : null;
    const max = typeof record.max === "number" ? record.max : null;
    const money = (n: number) => `${new Intl.NumberFormat("es-ES").format(n)} €`;
    if (min !== null || max !== null) {
      if (min !== null && max !== null) return `${money(min)} – ${money(max)}`;
      if (max !== null) return `Hasta ${money(max)}`;
      return `Desde ${money(min as number)}`;
    }
  }
  return formatQualificationValue(value, fact.hasValue);
}

export default function BeforeCallSummary({ contact }: { contact: ContactDetail }) {
  const facts = contact.qualificationFacts.filter((fact) => fact.hasValue && fact.status !== "empty" && fact.status !== "null").slice(0, 5);
  return (
    <section className="rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-card">
      <h2 className="mb-space-md font-heading text-headline-sm">Antes de contactar</h2>
      {contact.handoff.requested && <div className="mb-space-md rounded-md bg-warning-amber-subtle p-space-md text-body-sm"><strong>Seguimiento humano solicitado.</strong>{contact.handoff.reason && <p className="mt-space-xs">{contact.handoff.reason}</p>}</div>}
      {facts.length ? <ul className="space-y-space-sm text-body-sm">{facts.map((fact) => <li key={fact.id} className="flex justify-between gap-space-sm"><span className="text-on-surface-variant">{fact.label}</span><span className="max-w-[62%] text-right font-medium">{displayValue(fact)}</span></li>)}</ul> : <p className="text-body-sm text-on-surface-variant">Aún no hay información de cualificación registrada.</p>}
      {contact.latestInteraction && <div className="mt-space-md border-t border-border-subtle pt-space-md"><p className="text-label-sm uppercase text-on-surface-variant">Última interacción</p><p className="mt-space-xs text-body-sm">{contact.latestInteraction.channel.label} · {formatContactDate(contact.latestInteraction.createdAt) ?? "Fecha no disponible"}</p></div>}
      {contact.recommendation && <div className="mt-space-md rounded-md bg-primary-fixed/50 p-space-md"><p className="text-label-sm uppercase text-on-primary-fixed-variant">Recomendación</p><p className="mt-space-xs text-body-sm">{contact.recommendation}</p></div>}
    </section>
  );
}
