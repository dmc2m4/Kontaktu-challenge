import Link from "next/link";
import { formatContactDate, formatContactTime, parseContactDate } from "@/lib/contacts/date-time";
import { formatQualificationValue } from "@/lib/contacts/contact-normalization";
import type { ReactNode } from "react";
import type { ContactDetail, ContactListItem, NormalizedInteraction, QualificationFact, QualificationGroup } from "@/lib/contacts/contact-types";

const GROUPS: Array<{ id: QualificationGroup; title: string; tone: string }> = [
  { id: "purchase", title: "Criterios de compra", tone: "text-primary" },
  { id: "rental", title: "Interés de alquiler", tone: "text-tertiary" },
  { id: "common", title: "Datos comunes", tone: "text-on-surface-variant" },
  { id: "unclassified", title: "Datos descubiertos dinámicamente", tone: "text-tertiary" },
];

function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-label-sm ${className}`}>{children}</span>;
}

function displayValue(fact: QualificationFact) {
  const value = fact.originalValue;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    const min = typeof record.min === "number" ? record.min : null;
    const max = typeof record.max === "number" ? record.max : null;
    if (min !== null || max !== null) {
      const money = (n: number) => `${new Intl.NumberFormat("es-ES").format(n)} €`;
      if (min !== null && max !== null) return `${money(min)} – ${money(max)}`;
      if (max !== null) return `Hasta ${money(max)}`;
      return `Desde ${money(min as number)}`;
    }
  }
  return formatQualificationValue(value, fact.hasValue);
}

function ContactHeader({ contact }: { contact: ContactDetail }) {
  const created = formatContactDate(contact.createdAt);
  return <section className="overflow-hidden rounded-xl border border-border-subtle bg-surface-card shadow-card">
    <div className="flex flex-col gap-space-lg p-space-lg lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-space-md">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-container to-warning-amber text-xl font-bold text-on-primary">{contact.initials ?? "?"}</div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-space-sm">
            <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg">{contact.displayName}</h1>
            <Badge className="border-secondary-fixed bg-secondary-fixed/45 text-on-secondary-fixed-variant">● {contact.source.label}</Badge>
            {contact.isTest && <Badge className="border-warning-amber/30 bg-warning-amber-subtle">Test</Badge>}
            {contact.organizationMismatch && <Badge className="border-tertiary-fixed bg-tertiary-fixed/40 text-on-tertiary-container">Organización distinta</Badge>}
          </div>
          <div className="mt-space-sm flex flex-wrap gap-x-space-lg gap-y-space-xs text-body-sm text-on-surface-variant">
            {contact.phone.displayValue && <span className="font-medium">☎ {contact.phone.displayValue}</span>}
            {contact.email.displayValue && <span className="break-all">✉ {contact.email.displayValue}</span>}
            {created && <span>Creado el {created}</span>}
          </div>
          {(contact.phone.malformed || contact.email.malformed) && <p className="mt-space-sm text-label-sm text-danger-rose">El dato de contacto conserva su valor original, pero no es utilizable.</p>}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-space-sm border-t border-border-subtle pt-space-md lg:border-t-0 lg:pt-0">
        <button type="button" disabled className="min-h-10 rounded-md bg-primary-container px-space-lg text-label-md text-on-primary disabled:cursor-not-allowed disabled:opacity-55">{contact.restrictions.callAllowed ? "Llamar ahora" : "Llamada bloqueada"}</button>
        <button type="button" disabled={!contact.restrictions.whatsappAvailable} className="min-h-10 rounded-md border border-secondary-fixed bg-secondary-fixed/40 px-space-lg text-label-md text-on-secondary-fixed-variant disabled:cursor-not-allowed disabled:opacity-55">{contact.restrictions.whatsappAvailable ? "WhatsApp disponible" : "WhatsApp bloqueado"}</button>
      </div>
    </div>
    <div className="border-t border-border-subtle bg-warning-amber-subtle/70 px-space-lg py-space-md text-body-sm">
      <span className="font-semibold">Resumen previo para el agente: </span>
      <span className="text-on-surface-variant">{contact.handoff.requested ? contact.handoff.reason ?? "Se ha solicitado seguimiento humano." : contact.recommendation ?? "Revisar la información registrada antes de contactar."}</span>
      {contact.recommendation && <Badge className="ml-space-sm border-warning-amber/30 bg-surface-card">Recomendación del sistema</Badge>}
    </div>
  </section>;
}

export function ContactActionStatus({ contact }: { contact: ContactDetail }) {
  return <section className="rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-card" aria-labelledby="contact-actions-heading">
    <h2 id="contact-actions-heading" className="mb-space-md font-heading text-headline-sm">Restricciones y canales</h2>
    <div className="grid gap-space-sm sm:grid-cols-2 lg:grid-cols-1">
      <div className="rounded-md bg-danger-rose-subtle p-space-md" role="status">
        <p className="text-label-sm uppercase text-danger-rose">Llamadas</p>
        <p className="mt-space-xs font-semibold">{contact.restrictions.callAllowed ? "Consentimiento registrado" : "Bloqueadas"}</p>
        {!contact.restrictions.callAllowed && <ul className="mt-space-xs space-y-space-xs text-body-sm text-on-surface-variant">{contact.restrictions.callReasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>}
      </div>
      <div className="rounded-md bg-secondary-fixed/35 p-space-md" role="status">
        <p className="text-label-sm uppercase text-on-secondary-fixed-variant">WhatsApp</p>
        <p className="mt-space-xs font-semibold">{contact.restrictions.whatsappAvailable ? "Disponible" : "Bloqueado"}</p>
        {!contact.restrictions.whatsappAvailable && <ul className="mt-space-xs space-y-space-xs text-body-sm text-on-surface-variant">{contact.restrictions.whatsappReasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>}
      </div>
    </div>
    {contact.restrictions.preferences.length > 0 && <div className="mt-space-md border-t border-border-subtle pt-space-md"><p className="text-label-sm uppercase text-on-surface-variant">Preferencias registradas</p><ul className="mt-space-xs space-y-space-xs text-body-sm">{contact.restrictions.preferences.map((item) => <li key={item}>• {item}</li>)}</ul></div>}
  </section>;
}

function DataHealth({ contact }: { contact: ContactDetail }) {
  const complete = contact.dataHealth.contactMethodAvailable && contact.dataHealth.intentAvailable;
  return <section className="rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-card">
    <div className="mb-space-md flex items-center justify-between"><h2 className="font-heading text-headline-sm">Salud del dato</h2><Badge className={complete ? "border-secondary-fixed bg-secondary-fixed/45 text-on-secondary-fixed-variant" : "border-warning-amber/30 bg-warning-amber-subtle"}>{complete ? "Completo" : "Incompleto"}</Badge></div>
    <ul className="space-y-space-sm text-body-sm">
      <li><span className={contact.dataHealth.contactMethodAvailable ? "text-success-emerald" : "text-warning-amber"}>{contact.dataHealth.contactMethodAvailable ? "●" : "○"}</span> {contact.dataHealth.contactMethodAvailable ? "Método de contacto utilizable" : "Falta un método de contacto utilizable"}</li>
      <li><span className={contact.dataHealth.intentAvailable ? "text-success-emerald" : "text-warning-amber"}>{contact.dataHealth.intentAvailable ? "●" : "○"}</span> {contact.dataHealth.intentAvailable ? "Hay información de intención inmobiliaria" : "Falta información de intención inmobiliaria"}</li>
    </ul>
  </section>;
}

function BeforeCallSummary({ contact }: { contact: ContactDetail }) {
  const facts = contact.qualificationFacts.filter((fact) => fact.hasValue && fact.status !== "empty" && fact.status !== "null").slice(0, 5);
  return <section className="rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-card">
    <h2 className="mb-space-md font-heading text-headline-sm">Antes de contactar</h2>
    {contact.handoff.requested && <div className="mb-space-md rounded-md bg-warning-amber-subtle p-space-md text-body-sm"><strong>Seguimiento humano solicitado.</strong>{contact.handoff.reason && <p className="mt-space-xs">{contact.handoff.reason}</p>}</div>}
    {facts.length ? <ul className="space-y-space-sm text-body-sm">{facts.map((fact) => <li key={fact.id} className="flex justify-between gap-space-sm"><span className="text-on-surface-variant">{fact.label}</span><span className="max-w-[62%] text-right font-medium">{displayValue(fact)}</span></li>)}</ul> : <p className="text-body-sm text-on-surface-variant">Aún no hay información de cualificación registrada.</p>}
    {contact.latestInteraction && <div className="mt-space-md border-t border-border-subtle pt-space-md"><p className="text-label-sm uppercase text-on-surface-variant">Última interacción</p><p className="mt-space-xs text-body-sm">{contact.latestInteraction.channel.label} · {formatContactDate(contact.latestInteraction.createdAt) ?? "Fecha no disponible"}</p></div>}
    {contact.recommendation && <div className="mt-space-md rounded-md bg-primary-fixed/50 p-space-md"><p className="text-label-sm uppercase text-on-primary-fixed-variant">Recomendación</p><p className="mt-space-xs text-body-sm">{contact.recommendation}</p></div>}
  </section>;
}

function QualificationFactCard({ fact }: { fact: QualificationFact }) {
  const human = fact.humanEdited || fact.source?.toLowerCase() === "manual";
  const timestamp = fact.sourceTimestamp.kind === "instant" || fact.sourceTimestamp.kind === "date-only" ? formatContactDate(fact.sourceTimestamp) : null;
  return <article className={`rounded-md border p-space-md ${human ? "border-secondary-fixed bg-secondary-fixed/10" : "border-border-subtle bg-surface-card"}`}>
    <div className="flex items-start justify-between gap-space-sm"><span className="text-label-sm uppercase text-on-surface-variant">{fact.label}</span><Badge className={human ? "border-secondary-fixed bg-secondary-fixed/45 text-on-secondary-fixed-variant" : "border-tertiary-fixed bg-tertiary-fixed/50 text-on-tertiary-container"}>{human ? "Verificado por humano" : "Extraído por IA"}</Badge></div>
    <p className="mt-space-sm break-words text-body-md font-semibold">{displayValue(fact)}</p>
    <div className="mt-space-md border-t border-border-subtle pt-space-sm text-label-sm text-on-surface-variant"><span>{fact.source === "explicit" ? "Indicado por el contacto" : fact.source ?? "Procedencia no disponible"}</span>{timestamp && <span className="float-right">{timestamp}</span>}{fact.conflict && <p className="mt-space-xs clear-both font-semibold text-warning-amber">Discrepancia: se conservan valores distintos.</p>}{fact.status === "unrecognized" && <p className="mt-space-xs">Campo no reconocido · {fact.originalFieldName}</p>}{fact.status === "malformed" && <p className="mt-space-xs text-danger-rose">Valor no interpretable · {fact.originalFieldName}</p>}{fact.status === "null" && <p className="mt-space-xs">Valor nulo conservado</p>}{fact.status === "empty" && <p className="mt-space-xs">Valor vacío conservado</p>}</div>
  </article>;
}

function QualificationSection({ contact }: { contact: ContactDetail }) {
  return <section className="rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-card">
    <div className="flex flex-wrap items-start justify-between gap-space-md border-b border-border-subtle pb-space-md"><div><div className="flex flex-wrap items-center gap-space-sm"><h2 className="font-heading text-headline-sm">Perfil de cualificación</h2><Badge className="border-border-subtle bg-surface-subtle text-on-surface-variant">Esquema dinámico</Badge></div><p className="mt-space-xs text-body-sm text-on-surface-variant">Datos extraídos con trazabilidad y correcciones humanas visibles.</p></div><div className="text-label-sm"><span className="text-tertiary">● IA</span> <span className="ml-space-sm text-success-emerald">● Humano</span></div></div>
    <div className="mt-space-lg space-y-space-xl">{contact.qualificationFacts.length === 0 ? <p className="text-body-sm text-on-surface-variant">No hay datos de cualificación disponibles.</p> : GROUPS.map(({ id, title, tone }) => { const facts = contact.qualificationFacts.filter((fact) => fact.group === id); if (!facts.length) return null; return <section key={id} aria-labelledby={`qualification-${id}`}><div className="mb-space-sm flex items-center justify-between"><h3 id={`qualification-${id}`} className={`text-label-sm uppercase ${tone}`}>{title}</h3><span className="text-label-sm text-on-surface-variant">{facts.length} {facts.length === 1 ? "atributo" : "atributos"}</span></div><div className="grid gap-space-sm md:grid-cols-2">{facts.map((fact) => <QualificationFactCard fact={fact} key={fact.id} />)}</div></section>; })}</div>
  </section>;
}

function InteractionItem({ interaction }: { interaction: NormalizedInteraction }) {
  const time = formatContactTime(interaction.createdAt);
  const isVoice = interaction.channel.label === "Phone call";
  return <li className="border-t border-border-subtle py-space-md"><div className="flex gap-space-sm"><div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-primary">{isVoice ? "☎" : interaction.channel.label === "WhatsApp" ? "◌" : "▤"}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-space-sm"><h4 className="text-body-sm font-semibold">{interaction.channel.label}</h4>{interaction.direction && <span className="text-label-sm text-on-surface-variant">{interaction.direction === "inbound" ? "Entrante" : "Saliente"}</span>}<span className="text-label-sm text-on-surface-variant">{time ?? "Hora no disponible"}</span></div><p className="mt-space-xs whitespace-pre-wrap break-words text-body-sm text-on-surface-variant">{interaction.content ?? "Contenido no disponible"}</p>{isVoice && interaction.transcript && <details className="mt-space-sm rounded-md border border-border-subtle bg-surface-subtle px-space-md py-space-sm"><summary className="cursor-pointer text-label-md focus-visible:outline-2 focus-visible:outline-primary">Ver transcripción</summary><p className="mt-space-sm whitespace-pre-wrap break-words border-t border-border-subtle pt-space-sm text-body-sm text-on-surface-variant">{interaction.transcript}</p></details>}</div></div></li>;
}

export function InteractionTimeline({ contact }: { contact: ContactDetail }) {
  const dated = new Map<string, NormalizedInteraction[]>();
  const undated: NormalizedInteraction[] = [];
  for (const interaction of contact.interactions) { const key = interaction.createdAt.dateKey; if (key) dated.set(key, [...(dated.get(key) ?? []), interaction]); else undated.push(interaction); }
  const keys = [...dated.keys()].sort((a, b) => b.localeCompare(a));
  return <section className="rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-card">
    <div className="flex items-center justify-between border-b border-border-subtle pb-space-md"><h2 className="font-heading text-headline-sm">Línea de tiempo de interacciones</h2><Badge className="border-border-subtle bg-surface-subtle text-on-surface-variant">{contact.interactions.length} eventos</Badge></div>
    {contact.interactions.length === 0 ? <p className="pt-space-lg text-body-sm text-on-surface-variant">No hay interacciones registradas.</p> : <div className="space-y-space-lg pt-space-md">{keys.map((key) => { const entries = dated.get(key) ?? []; const timed = entries.filter((item) => item.createdAt.kind === "instant"); const dateOnly = entries.filter((item) => item.createdAt.kind === "date-only"); return <section key={key} aria-labelledby={`timeline-${key}`}><h3 id={`timeline-${key}`} className="mb-space-sm text-label-sm uppercase text-on-surface-variant">{formatContactDate(parseContactDate(key)) ?? key}</h3>{timed.length > 0 && <ol>{timed.map((item, index) => <InteractionItem interaction={item} key={item.id ?? `timed-${index}`} />)}</ol>}{dateOnly.length > 0 && <div className="rounded-md bg-surface-subtle px-space-md"><p className="pt-space-sm text-label-sm text-on-surface-variant">Hora no disponible</p><ol>{dateOnly.map((item, index) => <InteractionItem interaction={item} key={item.id ?? `date-${index}`} />)}</ol></div>}</section>; })}{undated.length > 0 && <section aria-labelledby="timeline-undated"><h3 id="timeline-undated" className="mb-space-sm text-label-sm uppercase text-on-surface-variant">Fecha no disponible</h3><ol>{undated.map((item, index) => <InteractionItem interaction={item} key={item.id ?? `undated-${index}`} />)}</ol></section>}</div>}
  </section>;
}

function Sidebar({ contacts, activeId }: { contacts: ContactListItem[]; activeId: string }) {
  return <aside className="hidden w-80 shrink-0 border-r border-border-subtle bg-surface-card lg:flex lg:flex-col">
    <div className="border-b border-border-subtle p-space-md"><div className="flex items-center justify-between"><h2 className="text-label-sm uppercase tracking-wide text-on-surface-variant">Contactos entrantes</h2><span className="rounded-full bg-surface-subtle px-2 py-0.5 text-label-sm">{contacts.length}</span></div><p className="mt-0.5 text-label-sm text-on-surface-variant">Registros disponibles para revisión</p></div>
    <nav aria-label="Contactos" className="min-h-0 flex-1 overflow-y-auto"><ul className="divide-y divide-border-subtle">{contacts.map((contact) => <li key={contact.id}><Link href={`/contacts/${encodeURIComponent(contact.id)}`} className={`block border-l-4 p-space-md transition hover:bg-surface-canvas focus-visible:outline-2 focus-visible:outline-primary ${contact.id === activeId ? "border-primary bg-primary-fixed/25" : "border-transparent"}`}><div className="flex items-center justify-between gap-space-sm"><span className="truncate text-body-sm font-semibold">{contact.displayName}</span>{contact.isTest && <span className="text-label-sm text-warning-amber">Test</span>}</div><div className="mt-space-xs text-label-sm text-on-surface-variant">{contact.source.label}{contact.organizationMismatch ? " · Org. distinta" : ""}</div>{contact.latestInteraction?.summary && <p className="mt-space-xs line-clamp-2 text-body-sm text-on-surface-variant">{contact.latestInteraction.summary}</p>}</Link></li>)}</ul></nav>
    <div className="border-t border-border-subtle bg-surface-subtle p-space-md text-label-sm text-on-surface-variant">Motor de cualificación · <span className="font-semibold text-success-emerald">Operativo</span></div>
  </aside>;
}

export default function ContactDetailView({ contact, contacts = [] }: { contact: ContactDetail; contacts?: ContactListItem[] }) {
  return <div className="min-h-screen bg-surface-canvas text-on-surface">
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-border-subtle bg-surface-card/95 px-gutter backdrop-blur sm:px-gutter-desktop">
      <div className="flex min-w-0 items-center gap-space-lg"><Link href="/" className="flex shrink-0 items-center gap-space-sm rounded-md focus-visible:outline-2 focus-visible:outline-primary"><span className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-primary-container to-primary text-lg font-bold text-on-primary">K</span><span className="font-heading text-headline-sm">kontaktu</span><span className="hidden rounded border border-primary-fixed bg-primary-fixed px-1.5 py-0.5 text-label-sm text-primary sm:inline">CRM</span></Link><nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-space-sm border-l border-border-subtle pl-space-lg text-label-sm text-on-surface-variant md:flex"><span>Contactos</span><span>/</span><span className="truncate font-semibold text-primary">{contact.displayName}</span></nav></div>
      <div className="flex size-8 items-center justify-center rounded-full bg-surface-subtle text-label-md">DM</div>
    </header>
    <div className="mx-auto flex w-full max-w-[1600px]"><Sidebar contacts={contacts} activeId={contact.id} /><main className="min-w-0 flex-1 p-gutter sm:p-gutter-desktop"><div className="mx-auto max-w-5xl space-y-space-lg"><ContactHeader contact={contact} /><div className="grid items-start gap-space-lg lg:grid-cols-12"><div className="min-w-0 space-y-space-lg lg:col-span-7"><QualificationSection contact={contact} /><InteractionTimeline contact={contact} /></div><aside aria-label="Resumen del contacto" className="space-y-space-lg lg:sticky lg:top-20 lg:col-span-5"><ContactActionStatus contact={contact} /><DataHealth contact={contact} /><BeforeCallSummary contact={contact} /></aside></div></div></main></div>
  </div>;
}
