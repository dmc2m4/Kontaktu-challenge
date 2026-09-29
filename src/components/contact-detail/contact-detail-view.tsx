import Image from "next/image";
import Link from "next/link";
import type { ContactDetail, ContactListItem } from "@/lib/contacts/contact-types";
import BeforeCallSummary from "./before-call-summary";
import ContactActions from "./contact-actions";
import ContactHeader from "./contact-header";
import ContactRestrictions from "./contact-restrictions";
import DataHealth from "./data-health";
import InteractionTimeline from "./interaction-timeline";

export { default as ContactActionStatus } from "./contact-restrictions";
export { default as InteractionTimeline } from "./interaction-timeline";
import QualificationSection from "./qualification-section";

function ContactSidebar({ contacts, activeId }: { contacts: ContactListItem[]; activeId: string }) {
  return (
    <aside className="hidden w-80 shrink-0 border-r border-border-subtle bg-surface-card lg:flex lg:flex-col">
      <div className="border-b border-border-subtle p-space-md">
        <div className="flex items-center justify-between">
          <h2 className="text-label-sm uppercase tracking-wide text-on-surface-variant">Contactos entrantes</h2>
          <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-label-sm">{contacts.length}</span>
        </div>
        <p className="mt-0.5 text-label-sm text-on-surface-variant">Registros disponibles para revisión</p>
      </div>
      <nav aria-label="Contactos" className="min-h-0 flex-1 overflow-y-auto">
        <ul className="divide-y divide-border-subtle">
          {contacts.map((contact) => (
            <li key={contact.id}>
              <Link
                href={`/contacts/${encodeURIComponent(contact.id)}`}
                className={`block border-l-4 p-space-md transition hover:bg-surface-canvas focus-visible:outline-2 focus-visible:outline-primary ${contact.id === activeId ? "border-primary bg-primary-fixed/25" : "border-transparent"}`}
              >
                <div className="flex items-center justify-between gap-space-sm">
                  <span className="truncate text-body-sm font-semibold">{contact.displayName}</span>
                  {contact.isTest && <span className="text-label-sm text-warning-amber">Test</span>}
                </div>
                <div className="mt-space-xs text-label-sm text-on-surface-variant">{contact.source.label}{contact.organizationMismatch ? " · Org. distinta" : ""}</div>
                {contact.latestInteraction?.summary && <p className="mt-space-xs line-clamp-2 text-body-sm text-on-surface-variant">{contact.latestInteraction.summary}</p>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-border-subtle bg-surface-subtle p-space-md text-label-sm text-on-surface-variant">Motor de cualificación · <span className="font-semibold text-success-emerald">Operativo</span></div>
    </aside>
  );
}

function ContactTopBar({ contact }: { contact: ContactDetail }) {
  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-border-subtle bg-surface-card/95 px-gutter backdrop-blur sm:px-gutter-desktop">
      <div className="flex min-w-0 items-center gap-space-lg">
        <Link href="/" className="flex shrink-0 items-center gap-space-sm rounded-md focus-visible:outline-2 focus-visible:outline-primary" aria-label="Kontaktu AI">
          <Image
            src="/images/kontaktu-ai-logo.svg"
            alt="Kontaktu AI"
            width={132}
            height={37}
            priority
            className="h-auto w-[132px]"
          />
          <span className="hidden rounded border border-primary-fixed bg-primary-fixed px-1.5 py-0.5 text-label-sm text-primary sm:inline">CRM</span>
        </Link>
        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-space-sm border-l border-border-subtle pl-space-lg text-label-sm text-on-surface-variant md:flex">
          <span>Contactos</span><span>/</span><span className="truncate font-semibold text-primary">{contact.displayName}</span>
        </nav>
      </div>
      <div className="flex size-8 items-center justify-center rounded-full bg-surface-subtle text-label-md">DM</div>
    </header>
  );
}

export default function ContactDetailView({ contact, contacts = [] }: { contact: ContactDetail; contacts?: ContactListItem[] }) {
  return (
    <div className="min-h-screen bg-surface-canvas text-on-surface">
      <ContactTopBar contact={contact} />
      <div className="mx-auto flex w-full max-w-[1600px]">
        <ContactSidebar contacts={contacts} activeId={contact.id} />
        <main className="min-w-0 flex-1 p-gutter sm:p-gutter-desktop">
          <div className="mx-auto max-w-5xl space-y-space-lg">
            <ContactHeader contact={contact} />
            <ContactActions contact={contact} />
            <div className="grid items-start gap-space-lg lg:grid-cols-12">
              <div className="min-w-0 space-y-space-lg lg:col-span-7">
                <QualificationSection contact={contact} />
                <InteractionTimeline contact={contact} />
              </div>
              <aside aria-label="Resumen del contacto" className="space-y-space-lg lg:sticky lg:top-20 lg:col-span-5">
                <ContactRestrictions contact={contact} />
                <DataHealth contact={contact} />
                <BeforeCallSummary contact={contact} />
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
