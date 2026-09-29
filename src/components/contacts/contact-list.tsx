"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchContactList } from "@/lib/contacts/contact-client";
import { formatContactDate } from "@/lib/contacts/date-time";
import type { ContactListItem } from "@/lib/contacts/contact-types";

type ListState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "empty" }
  | { status: "ready"; contacts: ContactListItem[] };

function ContactListSkeleton() {
  return (
    <div aria-hidden="true" className="divide-y divide-border-subtle">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          className="flex min-h-20 animate-pulse items-center gap-space-md px-space-lg py-space-md"
          key={index}
        >
          <div className="size-11 rounded-full bg-surface-container-high" />
          <div className="min-w-0 flex-1 space-y-space-sm">
            <div className="h-4 w-40 rounded bg-surface-container-high" />
            <div className="h-3 w-64 max-w-full rounded bg-surface-container-high" />
          </div>
          <div className="hidden h-4 w-24 rounded bg-surface-container-high sm:block" />
        </div>
      ))}
    </div>
  );
}

function ContactRow({ contact }: { contact: ContactListItem }) {
  const latestDate = contact.latestInteraction
    ? formatContactDate(contact.latestInteraction.createdAt)
    : null;

  return (
    <li>
      <Link
        className="group grid min-h-24 grid-cols-[auto_minmax(0,1fr)] items-center gap-space-md px-space-md py-space-md transition-colors hover:bg-surface-subtle focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-primary sm:grid-cols-[auto_minmax(0,1.5fr)_minmax(12rem,1fr)] sm:px-space-lg"
        href={`/contacts/${encodeURIComponent(contact.id)}`}
      >
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-label-md text-on-primary-fixed"
        >
          {contact.initials}
        </span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-space-sm">
            <span className="truncate font-semibold text-body-md text-on-surface group-hover:text-primary">
              {contact.displayName}
            </span>
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
          </span>
          <span className="mt-space-xs block truncate text-body-sm text-on-surface-variant">
            {contact.source.label}
            {contact.latestInteraction &&
              ` · ${contact.latestInteraction.channel.label}`}
          </span>
          {contact.latestInteraction?.summary && (
            <span className="mt-space-xs block truncate text-body-sm text-on-surface-variant">
              {contact.latestInteraction.summary}
            </span>
          )}
        </span>
        <span className="col-start-2 flex items-center justify-between gap-space-sm text-body-sm text-on-surface-variant sm:col-start-auto sm:block sm:text-right">
          <span className="sm:block">
            {latestDate ??
              (contact.latestInteraction
                ? "Fecha no disponible"
                : "Sin interacciones")}
          </span>
          {contact.organizationMismatch && contact.organizationId && (
            <span className="sm:mt-space-xs sm:block">
              {contact.organizationId} ≠ {contact.exportOrganizationId}
            </span>
          )}
        </span>
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
        if (!controller.signal.aborted) setState({ status: "error" });
      });

    return () => controller.abort();
  }, [attempt]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1440px] px-margin py-space-xl sm:px-margin-tablet lg:px-margin-desktop">
      <header className="mb-space-xl flex flex-wrap items-end justify-between gap-space-md border-b border-border-subtle pb-space-lg">
        <div>
          <p className="text-label-sm uppercase text-on-surface-variant">
            Kontaktu / CRM
          </p>
          <h1 className="mt-space-xs font-heading text-headline-lg-mobile text-on-surface sm:text-headline-lg">
            Contactos
          </h1>
        </div>
        {state.status === "ready" && (
          <p className="text-body-sm text-on-surface-variant">
            {state.contacts.length} registros
          </p>
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
            <h2 className="font-heading text-headline-sm">
              No pudimos cargar los contactos
            </h2>
            <p className="mt-space-sm text-body-md">
              Comprueba la conexión e inténtalo de nuevo.
            </p>
            <button
              className="mt-space-md min-h-11 rounded-md border border-border-strong bg-surface-card px-space-lg text-label-md hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-primary"
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
          <p className="rounded-xl border border-border-subtle bg-surface-card p-space-lg text-body-md text-on-surface-variant">
            No hay contactos disponibles.
          </p>
        )}
        {state.status === "ready" && (
          <ul className="divide-y divide-border-subtle overflow-hidden rounded-xl border border-border-subtle bg-surface-card shadow-card">
            {state.contacts.map((contact) => (
              <ContactRow contact={contact} key={contact.id} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
