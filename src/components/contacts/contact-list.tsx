"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchContactList } from "@/lib/contacts/contact-client";
import type { ContactListItem } from "@/lib/contacts/contact-types";
import ContactListRow from "./contact-list-row";

type ListState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "empty" }
  | { status: "ready"; contacts: ContactListItem[] };

function ContactListSkeleton() {
  return (
    <div aria-hidden="true" className="divide-y divide-border-subtle">
      {Array.from({ length: 7 }, (_, index) => (
        <div key={index} className="grid min-h-24 grid-cols-[auto_minmax(0,1fr)] gap-space-md p-space-lg sm:grid-cols-[auto_minmax(0,1fr)_12rem]">
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

export default function ContactList() {
  const [state, setState] = useState<ListState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchContactList(controller.signal)
      .then((contacts) => setState(contacts.length > 0 ? { status: "ready", contacts } : { status: "empty" }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "error" });
      });
    return () => controller.abort();
  }, [attempt]);

  return (
    <div className="min-h-screen bg-surface-canvas text-on-surface">
      <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-border-subtle bg-surface-card/95 px-gutter backdrop-blur sm:px-gutter-desktop">
        <Link href="/" className="flex shrink-0 items-center gap-space-sm rounded-md focus-visible:outline-2 focus-visible:outline-primary">
          <span className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-primary-container to-primary text-lg font-bold text-on-primary">K</span>
          <span className="font-heading text-headline-sm">kontaktu</span>
          <span className="hidden rounded border border-primary-fixed bg-primary-fixed px-1.5 py-0.5 text-label-sm text-primary sm:inline">CRM</span>
        </Link>
        <div aria-label="Usuario actual" className="flex size-8 items-center justify-center rounded-full bg-surface-subtle text-label-md">DM</div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-margin py-space-xl sm:px-margin-tablet lg:px-margin-desktop">
        <div className="mx-auto max-w-6xl">
          <header className="mb-space-xl flex flex-wrap items-end justify-between gap-space-md">
            <div>
              <p className="text-label-sm uppercase tracking-wide text-on-surface-variant">Gestión de contactos</p>
              <h1 className="mt-space-xs font-heading text-headline-xl-mobile sm:text-headline-xl">Contactos</h1>
              <p className="mt-space-sm max-w-2xl text-body-md text-on-surface-variant">Revisa los registros y abre la ficha de cada contacto para consultar su cualificación, restricciones e historial.</p>
            </div>
            {state.status === "ready" && <div className="rounded-full border border-border-subtle bg-surface-card px-space-md py-space-sm text-label-md shadow-card"><span className="font-semibold">{state.contacts.length}</span> registros</div>}
          </header>

          <section aria-label="Listado de contactos">
            {state.status === "loading" && <><p aria-live="polite" className="sr-only">Cargando contactos</p><div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-card shadow-card"><ContactListSkeleton /></div></>}
            {state.status === "error" && (
              <div aria-live="assertive" className="rounded-xl border border-danger-rose/30 bg-danger-rose-subtle p-space-lg">
                <p className="text-label-sm uppercase text-danger-rose">Error de carga</p>
                <h2 className="mt-space-xs font-heading text-headline-sm">No pudimos cargar los contactos</h2>
                <p className="mt-space-sm text-body-md text-on-surface-variant">Comprueba la conexión e inténtalo de nuevo.</p>
                <button className="mt-space-md min-h-11 rounded-md bg-primary-container px-space-lg text-label-md text-on-primary hover:brightness-95 focus-visible:outline-2 focus-visible:outline-primary" onClick={() => { setState({ status: "loading" }); setAttempt((current) => current + 1); }} type="button">Reintentar</button>
              </div>
            )}
            {state.status === "empty" && <div className="rounded-xl border border-border-subtle bg-surface-card p-space-xl text-center shadow-card"><p className="font-heading text-headline-sm">No hay contactos</p><p className="mt-space-xs text-body-sm text-on-surface-variant">No hay registros disponibles para revisión.</p></div>}
            {state.status === "ready" && (
              <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-card shadow-card">
                <div className="flex items-center justify-between border-b border-border-subtle bg-surface-subtle px-space-lg py-space-md">
                  <div><p className="text-label-sm uppercase tracking-wide text-on-surface-variant">Bandeja de contactos</p><p className="mt-space-xs text-body-sm text-on-surface-variant">Selecciona un registro para abrir su ficha.</p></div>
                  <span className="hidden text-label-sm text-on-surface-variant sm:block">Última interacción</span>
                </div>
                <ul>{state.contacts.map((contact) => <ContactListRow contact={contact} key={contact.id} />)}</ul>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
