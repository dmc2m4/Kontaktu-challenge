import type { ContactDetail } from "@/lib/contacts/contact-types";

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-label-sm ${className}`}>{children}</span>;
}

export default function ContactHeader({ contact }: { contact: ContactDetail }) {
  const created = contact.createdAt;
  return (
    <section className="overflow-hidden rounded-xl border border-border-subtle bg-surface-card shadow-card">
      <div className="flex flex-col gap-space-lg p-space-lg">
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
              {created && <span>Creado el {created.displayValue}</span>}
            </div>
            {(contact.phone.malformed || contact.email.malformed) && <p className="mt-space-sm text-label-sm text-danger-rose">El dato de contacto conserva su valor original, pero no es utilizable.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
