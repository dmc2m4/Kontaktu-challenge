import { formatContactDate } from "@/lib/contacts/date-time";
import type { QualificationFact } from "@/lib/contacts/contact-types";
import { formatQualificationValue } from "@/lib/contacts/contact-normalization";

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

export default function QualificationFactCard({ fact }: { fact: QualificationFact }) {
  const human = fact.humanEdited || fact.source?.toLowerCase() === "manual";
  const timestamp = fact.sourceTimestamp.kind === "instant" || fact.sourceTimestamp.kind === "date-only" ? formatContactDate(fact.sourceTimestamp) : null;
  return (
    <article className={`rounded-md border p-space-md ${human ? "border-secondary-fixed bg-secondary-fixed/10" : "border-border-subtle bg-surface-card"}`}>
      <div className="flex items-start justify-between gap-space-sm"><span className="text-label-sm uppercase text-on-surface-variant">{fact.label}</span><span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-label-sm ${human ? "border-secondary-fixed bg-secondary-fixed/45 text-on-secondary-fixed-variant" : "border-tertiary-fixed bg-tertiary-fixed/50 text-on-tertiary-container"}`}>{human ? "Verificado por humano" : "Extraído por IA"}</span></div>
      <p className="mt-space-sm break-words text-body-md font-semibold">{displayValue(fact)}</p>
      <div className="mt-space-md border-t border-border-subtle pt-space-sm text-label-sm text-on-surface-variant">
        <span>{fact.source === "explicit" ? "Indicado por el contacto" : fact.source ?? "Procedencia no disponible"}</span>
        {timestamp && <span className="float-right">{timestamp}</span>}
        {fact.conflict && <p className="mt-space-xs clear-both font-semibold text-warning-amber">Discrepancia: se conservan valores distintos.</p>}
        {fact.status === "unrecognized" && <p className="mt-space-xs">Campo no reconocido · {fact.originalFieldName}</p>}
        {fact.status === "malformed" && <p className="mt-space-xs text-danger-rose">Valor no interpretable · {fact.originalFieldName}</p>}
        {fact.status === "null" && <p className="mt-space-xs">Valor nulo conservado</p>}
        {fact.status === "empty" && <p className="mt-space-xs">Valor vacío conservado</p>}
      </div>
    </article>
  );
}
