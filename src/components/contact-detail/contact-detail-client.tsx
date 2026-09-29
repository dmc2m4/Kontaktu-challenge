"use client";

import { useEffect, useState } from "react";
import { fetchContactDetail } from "@/lib/contacts/contact-client";
import type { ContactDetail } from "@/lib/contacts/contact-types";
import ContactDetailView from "./contact-detail-view";

type DetailState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "not-found" }
  | { status: "ready"; contact: ContactDetail };

export default function ContactDetailClient({
  contactId,
}: {
  contactId: string;
}) {
  const [state, setState] = useState<DetailState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchContactDetail(contactId, controller.signal)
      .then((contact) =>
        setState(
          contact ? { status: "ready", contact } : { status: "not-found" },
        ),
      )
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "error" });
      });

    return () => controller.abort();
  }, [attempt, contactId]);

  if (state.status === "loading") {
    return (
      <main
        aria-live="polite"
        className="mx-auto min-h-screen w-full max-w-[1440px] space-y-space-lg px-margin py-space-lg sm:px-margin-tablet lg:px-margin-desktop"
      >
        <div className="h-10 w-48 animate-pulse rounded-md bg-surface-container-high" />
        <div className="h-48 animate-pulse rounded-xl border border-border-subtle bg-surface-card" />
        <div className="grid gap-space-lg lg:grid-cols-[minmax(0,1.8fr)_minmax(18rem,1fr)]">
          <div className="h-80 animate-pulse rounded-xl border border-border-subtle bg-surface-card" />
          <div className="h-64 animate-pulse rounded-xl border border-border-subtle bg-surface-card" />
        </div>
        <span className="sr-only">Cargando ficha de contacto</span>
      </main>
    );
  }

  if (state.status === "not-found") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-margin py-space-xl sm:px-margin-tablet">
        <section
          aria-live="polite"
          className="w-full rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-card"
        >
          <p className="text-label-sm uppercase text-on-surface-variant">
            Contacto
          </p>
          <h1 className="mt-space-sm font-heading text-headline-md">
            No encontramos este contacto
          </h1>
          <a
            className="mt-space-lg inline-flex min-h-11 items-center rounded-md border border-border-subtle px-space-lg text-label-md hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-primary"
            href="/"
          >
            Volver al listado
          </a>
        </section>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-margin py-space-xl sm:px-margin-tablet">
        <section
          aria-live="assertive"
          className="w-full rounded-xl border border-danger-rose/30 bg-danger-rose-subtle p-space-lg"
        >
          <p className="text-label-sm uppercase text-danger-rose">
            Error de carga
          </p>
          <h1 className="mt-space-sm font-heading text-headline-md">
            No pudimos cargar la ficha
          </h1>
          <p className="mt-space-sm text-body-md">
            Inténtalo de nuevo. No se han incluido datos personales en este
            mensaje.
          </p>
          <button
            className="mt-space-lg min-h-11 rounded-md border border-border-strong bg-surface-card px-space-lg text-label-md hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-primary"
            onClick={() => {
              setState({ status: "loading" });
              setAttempt((current) => current + 1);
            }}
            type="button"
          >
            Reintentar
          </button>
        </section>
      </main>
    );
  }

  return <ContactDetailView contact={state.contact} />;
}
