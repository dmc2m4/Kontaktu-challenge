"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { fetchContactList } from "@/lib/contacts/contact-client";
import { formatContactDate, formatContactTime } from "@/lib/contacts/date-time";
import type { ContactListItem } from "@/lib/contacts/contact-types";

type ListState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "empty" }
  | { status: "ready"; contacts: ContactListItem[] };

function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "orange" | "teal" | "blue" | "warning";
}) {
  const styles = {
    neutral: "border-border-subtle bg-surface-subtle text-on-surface-variant",
    orange: "border-primary-fixed bg-primary-fixed text-on-primary-fixed-variant",
    teal: "border-secondary-fixed bg-secondary-fixed/45 text-on-secondary-fixed-variant",
    blue: "border-tertiary-fixed bg-tertiary-fixed/50 text-on-tertiary-container",
    warning: "border-warning-amber/30 bg-warning-amber-subtle text-on-surface",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-space-sm py-space-xs text-label-sm ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function ContactListSkeleton() {
  return (
    <div aria-hidden="true" className="divide-y divide-border-subtle">
      {Array.from({ length: 7 }, (_, index) => (
        <div
          className="grid min-h-24 grid-cols-[auto_minmax(0,1fr)] gap-space-md p-space-lg sm:grid-cols-[auto_minmax(0,1fr)_12rem]"
          key={index}
        >
          <div className="size-11 animate-pulse rounded-full bg-surface-container-high" />
          <div className="space-y-space-sm">
            <div className="h-4 w-44 animate-pulse rounded bg-surface-container-high" />
            <div className="h-3 w-72 max-w-full animate-pulse rounded bg-surface-container-high" />
            <div className="h-3 w-56 max-w-full animate-pulse rounded bg-surface-container-high" />
          </div>
          <div className="hidden h-4 w-24 animate-pulse rounded bg-surface-container-high sm:block" />
        </div>
      ))}
    </div>
  );
}

function ContactRow({ contact }: { contact: ContactListItem }) {
  const latestDate = contact.latestInteraction
    ? formatContactDate(contact.latestInteraction.createdAt)
    : null;
  const latestTime = contact.latestInteraction
    ? formatContactTime(contact.latestInteraction.createdAt)
    : null;

  return (
    <li>
      <Link
        className="group block border-b border-border-subtle p-space-lg transition-colors last:border-b-0 hover:bg-surface-canvas focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-primary"
        href={`/contacts/${encodeURIComponent(contact.id)}`}
      >
        <article className="grid gap-space-md sm:grid-cols-[auto_minmax(0,1fr)_12rem] sm:items-center">
          <div
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-label-md text-on-primary-fixed"
          >
            {contact.initials}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-space-sm">
              <h2 className="truncate font-heading text-headline-sm text-on-surface group-hover:text-primary">
                {contact.displayName}
              </h2>
              {contact.isTest && <Badge tone="warning">Test</Badge>}
              {contact.organizationMismatch && (
                <Badge tone="blue">Organización distinta</Badge>
              )}
            </div>

            <div className="mt-space-xs flex flex-wrap items-center gap-x-space-sm gap-y-space-xs text-body-sm text-on-surface-variant">
              <span>{contact.source.label}</span>
              {contact.latestInteraction && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{contact.latestInteraction.channel.label}</span>
                  {contact.latestInteraction.direction && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>
                        {contact.latestInteraction.direction === "inbound"
                          ? "Entrante"
                          : "Saliente"}
                      </span>
                    </>
                  )}
                </>
              )}
            </div>

            {contact.latestInteraction?.summary && (
              <p className="mt-space-sm line-clamp-2 text-body-sm text-on-surface-variant">
                {contact.latestInteraction.summary}
              </p>
            )}

            {contact.organizationMismatch && (
              <p className="mt-space-sm text-label-sm text-tertiary">
                Organización registrada: {contact.organizationId ?? "desconocida"} ·
                Exportación: {contact.exportOrganizationId ?? "desconocida"}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-space-md text-body-sm text-on-surface-variant sm:block sm:text-right">
            <div>
              <p className="font-medium text-on-surface">
                {latestDate ?? "Sin fecha"}
              </p>
              {latestTime && (
                <p className="mt-space-xs text-label-sm">{latestTime}</p>
              )}
            </div>
            <span
              aria-hidden="true"
              className="text-lg text-on-surface-variant transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
            >
              →
            </span>
          </div>
        </article>
      </Link>
    </li>
  );
}

export default function ContactList() {
  const [state, setState] = useState<ListState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchContactList(controller.signal)
      .then((contacts) =>
        setState(
          contacts.length > 0
            ? { status: "ready", contacts }
            : { status: "empty" },
        ),
      )
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ status: "error" });
        }
      });

    return () => controller.abort();
  }, [attempt]);

  return (
    <div className="min-h-screen bg-surface-canvas text-on-surface">
      <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-border-subtle bg-surface-card/95 px-gutter backdrop-blur sm:px-gutter-desktop">
        <div className="flex min-w-0 items-center gap-space-lg">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-space-sm rounded-md focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-primary-container to-primary text-lg font-bold text-on-primary">
              K
            </span>
            <span className="font-heading text-headline-sm">kontaktu</span>
            <span className="hidden rounded border border-primary-fixed bg-primary-fixed px-1.5 py-0.5 text-label-sm text-primary sm:inline">
              CRM
            </span>
          </Link>

          <nav
            aria-label="Breadcrumb"
            className="hidden items-center gap-space-sm border-l border-border-subtle pl-space-lg text-label-sm text-on-surface-variant md:flex"
          >
            <span className="font-semibold text-primary">Contactos</span>
          </nav>
        </div>

        <div
          aria-label="Usuario actual"
          className="flex size-8 items-center justify-center rounded-full bg-surface-subtle text-label-md"
        >
          DM
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-margin py-space-xl sm:px-margin-tablet lg:px-margin-desktop">
        <div className="mx-auto max-w-6xl">
          <header className="mb-space-xl flex flex-wrap items-end justify-between gap-space-md">
            <div>
              <p className="text-label-sm uppercase tracking-wide text-on-surface-variant">
                Gestión de contactos
              </p>
              <h1 className="mt-space-xs font-heading text-headline-xl-mobile sm:text-headline-xl">
                Contactos
              </h1>
              <p className="mt-space-sm max-w-2xl text-body-md text-on-surface-variant">
                Revisa los registros y abre la ficha de cada contacto para
                consultar su cualificación, restricciones e historial.
              </p>
            </div>

            {state.status === "ready" && (
              <div className="rounded-full border border-border-subtle bg-surface-card px-space-md py-space-sm text-label-md shadow-card">
                <span className="font-semibold">{state.contacts.length}</span>{" "}
                registros
              </div>
            )}
          </header>

          <section aria-label="Listado de contactos">
            {state.status === "loading" && (
              <>
                <p aria-live="polite" className="sr-only">
                  Cargando contactos
                </p>
                <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-card shadow-card">
                  <ContactListSkeleton />
                </div>
              </>
            )}

            {state.status === "error" && (
              <div
                aria-live="assertive"
                className="rounded-xl border border-danger-rose/30 bg-danger-rose-subtle p-space-lg"
              >
                <p className="text-label-sm uppercase text-danger-rose">
                  Error de carga
                </p>
                <h2 className="mt-space-xs font-heading text-headline-sm">
                  No pudimos cargar los contactos
                </h2>
                <p className="mt-space-sm text-body-md text-on-surface-variant">
                  Comprueba la conexión e inténtalo de nuevo.
                </p>
                <button
                  className="mt-space-md min-h-11 rounded-md bg-primary-container px-space-lg text-label-md text-on-primary hover:brightness-95 focus-visible:outline-2 focus-visible:outline-primary"
                  onClick={() => {
                    setState({ status: "loading" });
                    setAttempt((current) => current + 1);
                  }}
                  type="button"
                >
                  Reintentar
                </button>
              </div>
            )}

            {state.status === "empty" && (
              <div className="rounded-xl border border-border-subtle bg-surface-card p-space-xl text-center shadow-card">
                <p className="font-heading text-headline-sm">No hay contactos</p>
                <p className="mt-space-xs text-body-sm text-on-surface-variant">
                  No hay registros disponibles para revisión.
                </p>
              </div>
            )}

            {state.status === "ready" && (
              <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-card shadow-card">
                <div className="flex items-center justify-between border-b border-border-subtle bg-surface-subtle px-space-lg py-space-md">
                  <div>
                    <p className="text-label-sm uppercase tracking-wide text-on-surface-variant">
                      Bandeja de contactos
                    </p>
                    <p className="mt-space-xs text-body-sm text-on-surface-variant">
                      Selecciona un registro para abrir su ficha.
                    </p>
                  </div>
                  <span className="hidden text-label-sm text-on-surface-variant sm:block">
                    Última interacción
                  </span>
                </div>

                <ul>{state.contacts.map((contact) => <ContactRow contact={contact} key={contact.id} />)}</ul>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
