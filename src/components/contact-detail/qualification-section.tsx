import type { ContactDetail, QualificationGroup } from "@/lib/contacts/contact-types";
import QualificationFactCard from "./qualification-fact";

const GROUPS: Array<{ id: QualificationGroup; title: string; tone: string }> = [
  { id: "purchase", title: "Criterios de compra", tone: "text-primary" },
  { id: "rental", title: "Interés de alquiler", tone: "text-tertiary" },
  { id: "common", title: "Datos comunes", tone: "text-on-surface-variant" },
  { id: "unclassified", title: "Datos descubiertos dinámicamente", tone: "text-tertiary" },
];

export default function QualificationSection({ contact }: { contact: ContactDetail }) {
  return (
    <section className="rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-space-md border-b border-border-subtle pb-space-md">
        <div>
          <div className="flex flex-wrap items-center gap-space-sm"><h2 className="font-heading text-headline-sm">Perfil de cualificación</h2><span className="rounded-full border border-border-subtle bg-surface-subtle px-space-sm py-space-xs text-label-sm text-on-surface-variant">Esquema dinámico</span></div>
          <p className="mt-space-xs text-body-sm text-on-surface-variant">Datos extraídos con trazabilidad y correcciones humanas visibles.</p>
        </div>
        <div className="text-label-sm"><span className="text-tertiary">● IA</span> <span className="ml-space-sm text-success-emerald">● Humano</span></div>
      </div>
      <div className="mt-space-lg space-y-space-xl">
        {contact.qualificationFacts.length === 0 ? <p className="text-body-sm text-on-surface-variant">No hay datos de cualificación disponibles.</p> : GROUPS.map(({ id, title, tone }) => {
          const facts = contact.qualificationFacts.filter((fact) => fact.group === id);
          if (!facts.length) return null;
          return <section key={id} aria-labelledby={`qualification-${id}`}><div className="mb-space-sm flex items-center justify-between"><h3 id={`qualification-${id}`} className={`text-label-sm uppercase ${tone}`}>{title}</h3><span className="text-label-sm text-on-surface-variant">{facts.length} {facts.length === 1 ? "atributo" : "atributos"}</span></div><div className="grid gap-space-sm md:grid-cols-2">{facts.map((fact) => <QualificationFactCard fact={fact} key={fact.id} />)}</div></section>;
        })}
      </div>
    </section>
  );
}
