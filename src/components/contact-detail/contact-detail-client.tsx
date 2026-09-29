"use client";

import { useEffect, useState } from "react";
import { fetchContactDetail, fetchContactList } from "@/lib/contacts/contact-client";
import type { ContactDetail, ContactListItem } from "@/lib/contacts/contact-types";
import ContactDetailSkeleton from "./contact-detail-skeleton";
import ContactDetailView from "./contact-detail-view";

type DetailState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "not-found" }
  | { status: "ready"; contact: ContactDetail; contacts: ContactListItem[] };

export default function ContactDetailClient({ contactId }: { contactId: string }) {
  const [state, setState] = useState<DetailState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      fetchContactDetail(contactId, controller.signal),
      fetchContactList(controller.signal),
    ])
      .then(([contact, contacts]) => {
        setState(contact ? { status: "ready", contact, contacts } : { status: "not-found" });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "error" });
      });

    return () => controller.abort();
  }, [attempt, contactId]);

  if (state.status === "loading") {\n    return <ContactDetailSkeleton />;\n  }
  if (state.status === "not-found") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-canvas p-gutter">
        <section aria-live="polite" className="w-full max-w-xl rounded-xl border border-border-subtle bg-surface-card p-space-xl shadow-card">
          <p className="text-label-sm uppercase text-on-surface-variant">Contacto</p>
          <h1 className="mt-space-sm font-heading text-headline-md">No encontramos este contacto</h1>
          <a className="mt-space-lg inline-flex min-h-11 items-center rounded-md border border-border-subtle px-space-lg text-label-md hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-primary" href="/">Volver al listado</a>
        </section>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-canvas p-gutter">
        <section aria-live="assertive" className="w-full max-w-xl rounded-xl border border-danger-rose/30 bg-danger-rose-subtle p-space-xl">
          <p className="text-label-sm uppercase text-danger-rose">Error de carga</p>
          <h1 className="mt-space-sm font-heading text-headline-md">No pudimos cargar la ficha</h1>
          <p className="mt-space-sm text-body-md">Inténtalo de nuevo. No se han incluido datos personales en este mensaje.</p>
          <button className="mt-space-lg min-h-11 rounded-md border border-border-strong bg-surface-card px-space-lg text-label-md hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-primary" onClick={() => { setState({ status: "loading" }); setAttempt((current) => current + 1); }} type="button">Reintentar</button>
        </section>
      </main>
    );
  }

  return <ContactDetailView contact={state.contact} contacts={state.contacts} />;
}
