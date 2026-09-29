import Link from "next/link";
import {
  formatContactDate,
  formatContactTime,
  parseContactDate,
} from "@/lib/contacts/date-time";
import {
  formatQualificationValue,
  formatSourceTimestamp,
} from "@/lib/contacts/contact-normalization";
import type {
  ContactDetail,
  NormalizedInteraction,
  QualificationFact,
  QualificationGroup,
} from "@/lib/contacts/contact-types";

const GROUPS: Array<{ id: QualificationGroup; title: string }> = [
  { id: "purchase", title: "Compra" },
  { id: "rental", title: "Alquiler" },
  { id: "common", title: "Datos comunes" },
  { id: "unclassified", title: "Sin clasificar" },
];

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-space-md">
      <p className="text-label-sm uppercase text-on-surface-variant">
        {eyebrow}
      </p>
      <h2 className="mt-space-xs font-heading text-headline-sm">{title}</h2>
    </div>
  );
}

function IdentityHeader({ contact }: { contact: ContactDetail }) {
  const createdAt = formatContactDate(contact.createdAt);

  return (
    <section className="rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-card">
      <div className="flex flex-wrap items-start gap-space-md">
        {contact.initials && (
          <span
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-fixed font-heading text-headline-sm text-on-primary-fixed"
          >
            {contact.initials}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-space-sm">
            <h1 className="break-words font-heading text-headline-lg-mobile text-on-surface sm:text-headline-lg">
              {contact.displayName}
            </h1>
            {contact.isTest && (
              <span className="rounded-full bg-warning-amber-subtle px-space-sm py-space-xs text-label-sm text-on-surface">
                Test
              </span>
            )}
            {contact.organizationMismatch && (
              <span className="rounded-full bg-tertiary-container/30 px-space-sm py-space-xs text-label-sm text-on-tertiary-container">
                Organización distinta
              </span>
            )}
          </div>
          <div className="mt-space-sm flex flex-wrap items-center gap-space-sm">
            <span className="rounded-full bg-surface-subtle px-space-sm py-space-xs text-label-sm text-on-surface-variant">
              {contact.source.label}
            </span>
            {contact.organizationMismatch && contact.organizationId && (
              <span className="text-body-sm text-on-surface-variant">
                {contact.organizationId} ≠ {contact.exportOrganizationId}
              </span>
            )}
          </div>
        </div>
      </div>

      <dl className="mt-space-lg grid gap-space-md border-t border-border-subtle pt-space-md sm:grid-cols-2">
        <div>
          <dt className="text-label-sm uppercase text-on-surface-variant">
            Teléfono
          </dt>
          <dd className="mt-space-xs break-all font-medium tabular-nums text-body-md">
            {contact.phone.displayValue ?? "No consta"}
            {contact.phone.malformed && (
              <span className="ml-space-sm text-label-sm text-danger-rose">
                Formato no válido
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-label-sm uppercase text-on-surface-variant">
            Email
          </dt>
          <dd className="mt-space-xs break-all font-medium text-body-md">
            {contact.email.displayValue ?? "No consta"}
            {contact.email.malformed && (
              <span className="ml-space-sm text-label-sm text-danger-rose">
                Formato no válido
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-label-sm uppercase text-on-surface-variant">
            Fecha de alta
          </dt>
          <dd className="mt-space-xs font-medium tabular-nums text-body-md">
            {createdAt ?? "No consta"}
          </dd>
        </div>
        <div>
          <dt className="text-label-sm uppercase text-on-surface-variant">
            Estado de contacto
          </dt>
          <dd className="mt-space-xs font-medium text-body-md">
            {contact.restrictions.callConsent === "granted"
              ? "Consentimiento para llamada registrado"
              : contact.restrictions.callConsent === "denied"
                ? "Llamadas no autorizadas"
                : "Consentimiento para llamada no consta"}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export function ContactActionStatus({ contact }: { contact: ContactDetail }) {
  return (
    <section
      aria-labelledby="contact-actions-heading"
      className="rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-card"
    >
      <SectionHeading eyebrow="Canales" title="Estado de contacto" />
      <h3 className="sr-only" id="contact-actions-heading">
        Estado de los canales de contacto
      </h3>
      <div className="grid gap-space-sm sm:grid-cols-2 lg:grid-cols-1">
        <div
          className="rounded-md bg-danger-rose-subtle p-space-md"
          role="status"
        >
          <p className="text-label-sm uppercase text-danger-rose">Llamadas</p>
          <p className="mt-space-xs font-semibold text-body-md">
            {contact.restrictions.callAllowed
              ? "Consentimiento registrado"
              : "Bloqueadas"}
          </p>
          {!contact.restrictions.callAllowed && (
            <ul className="mt-space-xs space-y-space-xs text-body-sm text-on-surface-variant">
              {contact.restrictions.callReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}
          {contact.restrictions.noCallPreference && (
            <p className="mt-space-sm text-label-sm text-danger-rose">
              Preferencia explícita: no llamar
            </p>
          )}
        </div>
        <div
          className="rounded-md bg-secondary-fixed/40 p-space-md"
          role="status"
        >
          <p className="text-label-sm uppercase text-on-secondary-fixed-variant">
            WhatsApp
          </p>
          <p className="mt-space-xs font-semibold text-body-md">
            {contact.restrictions.whatsappAvailable
              ? "Sin restricción registrada"
              : "Bloqueado"}
          </p>
          {!contact.restrictions.whatsappAvailable && (
            <ul className="mt-space-xs space-y-space-xs text-body-sm text-on-surface-variant">
              {contact.restrictions.whatsappReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {contact.restrictions.preferences.length > 0 && (
        <div className="mt-space-md border-t border-border-subtle pt-space-md">
          <p className="text-label-sm uppercase text-on-surface-variant">
            Preferencias registradas
          </p>
          <ul className="mt-space-xs space-y-space-xs text-body-sm">
            {contact.restrictions.preferences.map((preference) => (
              <li key={preference}>{preference}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function DataHealth({ contact }: { contact: ContactDetail }) {
  return (
    <section
      aria-labelledby="data-health-title"
      className="rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-card"
    >
      <SectionHeading eyebrow="Completitud" title="Salud del dato" />
      <h3 className="sr-only" id="data-health-title">
        Salud del dato
      </h3>
      <ul className="space-y-space-sm">
        <li className="flex items-start gap-space-sm text-body-sm">
          <span
            aria-hidden="true"
            className={
              contact.dataHealth.contactMethodAvailable
                ? "text-success-emerald"
                : "text-warning-amber"
            }
          >
            {contact.dataHealth.contactMethodAvailable ? "●" : "○"}
          </span>
          <span>
            {contact.dataHealth.contactMethodAvailable
              ? "Tiene una vía de contacto con formato utilizable"
              : "Falta una vía de contacto con formato utilizable"}
          </span>
        </li>
        <li className="flex items-start gap-space-sm text-body-sm">
          <span
            aria-hidden="true"
            className={
              contact.dataHealth.intentAvailable
                ? "text-success-emerald"
                : "text-warning-amber"
            }
          >
            {contact.dataHealth.intentAvailable ? "●" : "○"}
          </span>
          <span>
            {contact.dataHealth.intentAvailable
              ? "Hay información sobre su intención inmobiliaria"
              : "Falta información sobre su intención inmobiliaria"}
          </span>
        </li>
      </ul>
    </section>
  );
}

function BeforeCallSummary({ contact }: { contact: ContactDetail }) {
  const facts = contact.qualificationFacts.filter(
    (fact) =>
      fact.hasValue && fact.status !== "empty" && fact.status !== "null",
  );

  return (
    <section
      aria-labelledby="before-call-title"
      className="rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-card"
    >
      <SectionHeading eyebrow="Preparación" title="Antes de contactar" />
      <h3 className="sr-only" id="before-call-title">
        Resumen antes de contactar
      </h3>
      {contact.handoff.requested && (
        <div className="rounded-md bg-warning-amber-subtle p-space-md">
          <p className="text-label-sm uppercase text-on-surface">
            Seguimiento humano solicitado
          </p>
          {contact.handoff.reason && (
            <p className="mt-space-xs text-body-sm">{contact.handoff.reason}</p>
          )}
        </div>
      )}
      {facts.length > 0 ? (
        <ul className="space-y-space-sm">
          {facts.slice(0, 5).map((fact) => (
            <li
              className="flex items-start justify-between gap-space-sm text-body-sm"
              key={fact.id}
            >
              <span className="text-on-surface-variant">{fact.label}</span>
              <span className="max-w-[65%] text-right font-medium">
                {formatQualificationValue(fact.originalValue, fact.hasValue)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body-sm text-on-surface-variant">
          Aún no hay información de cualificación registrada.
        </p>
      )}
      {contact.latestInteraction && (
        <div className="mt-space-md border-t border-border-subtle pt-space-md">
          <p className="text-label-sm uppercase text-on-surface-variant">
            Última interacción
          </p>
          <p className="mt-space-xs text-body-sm">
            {contact.latestInteraction.channel.label}
            {formatContactDate(contact.latestInteraction.createdAt) &&
              ` · ${formatContactDate(contact.latestInteraction.createdAt)}`}
          </p>
        </div>
      )}
      {contact.recommendation && (
        <div className="mt-space-md rounded-md bg-primary-fixed/50 p-space-md">
          <p className="text-label-sm uppercase text-on-primary-fixed-variant">
            Sugerencia
          </p>
          <p className="mt-space-xs text-body-sm">{contact.recommendation}</p>
        </div>
      )}
    </section>
  );
}

function QualificationFactRow({ fact }: { fact: QualificationFact }) {
  const sourceLabel = fact.humanEdited
    ? "Editado por el equipo"
    : fact.source === "explicit"
      ? "Dicho en conversación"
      : (fact.source ?? "Procedencia no disponible");
  const timestamp = formatSourceTimestamp(fact.sourceTimestamp);

  return (
    <div className="grid gap-space-sm border-t border-border-subtle py-space-md sm:grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.3fr)]">
      <dt className="text-body-sm font-medium text-on-surface-variant">
        {fact.label}
        {fact.conflict && (
          <span className="ml-space-xs text-warning-amber">· Discrepancia</span>
        )}
      </dt>
      <dd className="min-w-0">
        <p className="break-words whitespace-pre-wrap text-body-md">
          {formatQualificationValue(fact.originalValue, fact.hasValue)}
        </p>
        <div className="mt-space-xs flex flex-wrap gap-x-space-sm gap-y-space-xs text-label-sm text-on-surface-variant">
          <span>{sourceLabel}</span>
          {timestamp && (
            <time
              dateTime={
                fact.sourceTimestamp.kind === "instant"
                  ? new Date(fact.sourceTimestamp.timestamp ?? 0).toISOString()
                  : undefined
              }
            >
              {timestamp}
            </time>
          )}
          {fact.sourceRef && <span>Ref. {fact.sourceRef}</span>}
          {fact.status === "unrecognized" && (
            <span>Campo no reconocido · {fact.originalFieldName}</span>
          )}
          {fact.status === "malformed" && (
            <span>Valor no interpretable · {fact.originalFieldName}</span>
          )}
          {fact.status === "null" && <span>Valor nulo</span>}
          {fact.status === "empty" && <span>Valor vacío</span>}
        </div>
      </dd>
    </div>
  );
}

function QualificationSection({ contact }: { contact: ContactDetail }) {
  if (contact.qualificationFacts.length === 0) {
    return (
      <section className="rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-card">
        <SectionHeading eyebrow="Preferencias" title="Cualificación" />
        <p className="text-body-sm text-on-surface-variant">
          No hay datos de cualificación disponibles.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-card">
      <SectionHeading eyebrow="Preferencias" title="Cualificación" />
      <div className="space-y-space-lg">
        {GROUPS.map(({ id, title }) => {
          const facts = contact.qualificationFacts.filter(
            (fact) => fact.group === id,
          );
          if (facts.length === 0) return null;
          return (
            <section aria-labelledby={`qualification-${id}`} key={id}>
              <h3
                className="mb-space-sm text-label-sm uppercase text-on-surface-variant"
                id={`qualification-${id}`}
              >
                {title}
              </h3>
              <dl>
                {facts.map((fact) => (
                  <QualificationFactRow fact={fact} key={fact.id} />
                ))}
              </dl>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function isVoiceInteraction(interaction: NormalizedInteraction): boolean {
  return interaction.channel.label === "Phone call";
}

function InteractionItem({
  interaction,
}: {
  interaction: NormalizedInteraction;
}) {
  const time = formatContactTime(interaction.createdAt);
  const metadata = interaction.metadata;
  const formName =
    typeof metadata === "object" &&
    metadata !== null &&
    "form" in metadata &&
    typeof metadata.form === "string"
      ? metadata.form
      : null;
  const propertyReference =
    typeof metadata === "object" &&
    metadata !== null &&
    "property_ref" in metadata &&
    typeof metadata.property_ref === "string"
      ? metadata.property_ref
      : null;

  return (
    <li className="border-t border-border-subtle py-space-md">
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex flex-wrap items-center gap-space-sm">
          <span className="rounded-full bg-surface-subtle px-space-sm py-space-xs text-label-sm">
            {interaction.channel.label}
          </span>
          {interaction.direction && (
            <span className="text-label-sm text-on-surface-variant">
              {interaction.direction === "inbound" ? "Entrante" : "Saliente"}
            </span>
          )}
        </div>
        {time && (
          <time className="tabular-nums text-label-sm text-on-surface-variant">
            {time}
          </time>
        )}
      </div>
      {interaction.content ? (
        <p className="mt-space-sm whitespace-pre-wrap break-words text-body-md">
          {interaction.content}
        </p>
      ) : (
        <p className="mt-space-sm text-body-sm text-on-surface-variant">
          Contenido no disponible
        </p>
      )}
      {(formName || propertyReference) && (
        <p className="mt-space-sm text-label-sm text-on-surface-variant">
          {[formName, propertyReference].filter(Boolean).join(" · ")}
        </p>
      )}
      {isVoiceInteraction(interaction) && interaction.transcript && (
        <details className="mt-space-md rounded-md border border-border-subtle bg-surface-subtle px-space-md py-space-sm">
          <summary className="cursor-pointer py-space-xs text-label-md focus-visible:outline-2 focus-visible:outline-primary">
            Ver transcripción
          </summary>
          <p className="mt-space-sm whitespace-pre-wrap break-words border-t border-border-subtle pt-space-sm text-body-sm text-on-surface-variant">
            {interaction.transcript}
          </p>
        </details>
      )}
    </li>
  );
}

export function InteractionTimeline({ contact }: { contact: ContactDetail }) {
  const datedGroups = new Map<string, NormalizedInteraction[]>();
  const undated: NormalizedInteraction[] = [];

  for (const interaction of contact.interactions) {
    const dateKey = interaction.createdAt.dateKey;
    if (!dateKey) {
      undated.push(interaction);
      continue;
    }
    datedGroups.set(dateKey, [
      ...(datedGroups.get(dateKey) ?? []),
      interaction,
    ]);
  }

  const dateKeys = [...datedGroups.keys()].sort((left, right) =>
    right.localeCompare(left),
  );

  return (
    <section className="rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-card">
      <SectionHeading eyebrow="Actividad" title="Interacciones" />
      {contact.interactions.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant">
          No hay interacciones registradas.
        </p>
      ) : (
        <div className="space-y-space-lg">
          {dateKeys.map((dateKey) => {
            const entries = datedGroups.get(dateKey) ?? [];
            const timedEntries = entries.filter(
              (item) => item.createdAt.kind === "instant",
            );
            const dateOnlyEntries = entries.filter(
              (item) => item.createdAt.kind === "date-only",
            );
            const dateLabel =
              formatContactDate(parseContactDate(dateKey)) ?? dateKey;

            return (
              <section aria-labelledby={`timeline-${dateKey}`} key={dateKey}>
                <h3
                  className="mb-space-sm text-label-sm uppercase text-on-surface-variant"
                  id={`timeline-${dateKey}`}
                >
                  {dateLabel}
                </h3>
                {timedEntries.length > 0 && (
                  <ol className="pl-space-sm">
                    {timedEntries.map((interaction, index) => (
                      <InteractionItem
                        interaction={interaction}
                        key={
                          interaction.id ??
                          `${interaction.channel.label}-${index}`
                        }
                      />
                    ))}
                  </ol>
                )}
                {dateOnlyEntries.length > 0 && (
                  <div className="mt-space-md rounded-md bg-surface-subtle px-space-md">
                    <p className="pt-space-sm text-label-sm text-on-surface-variant">
                      Hora no disponible
                    </p>
                    <ol className="pl-space-sm">
                      {dateOnlyEntries.map((interaction, index) => (
                        <InteractionItem
                          interaction={interaction}
                          key={interaction.id ?? `date-only-${index}`}
                        />
                      ))}
                    </ol>
                  </div>
                )}
              </section>
            );
          })}
          {undated.length > 0 && (
            <section aria-labelledby="timeline-undated">
              <h3
                className="mb-space-sm text-label-sm uppercase text-on-surface-variant"
                id="timeline-undated"
              >
                Fecha no disponible
              </h3>
              <ol className="pl-space-sm">
                {undated.map((interaction, index) => (
                  <InteractionItem
                    interaction={interaction}
                    key={interaction.id ?? `undated-${index}`}
                  />
                ))}
              </ol>
            </section>
          )}
        </div>
      )}
    </section>
  );
}

export default function ContactDetailView({
  contact,
}: {
  contact: ContactDetail;
}) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1440px] px-margin py-space-lg sm:px-margin-tablet lg:px-margin-desktop">
      <nav aria-label="Navegación" className="mb-space-md">
        <Link
          className="inline-flex min-h-10 items-center rounded-md text-label-md text-on-surface-variant hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
          href="/"
        >
          ← Todos los contactos
        </Link>
      </nav>
      <div className="space-y-space-lg">
        <IdentityHeader contact={contact} />
        <div className="grid items-start gap-space-lg lg:grid-cols-[minmax(0,1.8fr)_minmax(18rem,1fr)]">
          <div className="min-w-0 space-y-space-lg">
            <QualificationSection contact={contact} />
            <InteractionTimeline contact={contact} />
          </div>
          <aside
            aria-label="Preparación de contacto"
            className="space-y-space-lg lg:sticky lg:top-space-lg"
          >
            <ContactActionStatus contact={contact} />
            <DataHealth contact={contact} />
            <BeforeCallSummary contact={contact} />
          </aside>
        </div>
      </div>
    </main>
  );
}
