import Link from "next/link";
import type { ReactNode } from "react";
import { formatContactDate, formatContactTime } from "@/lib/contacts/date-time";
import type { ContactListItem } from "@/lib/contacts/contact-types";

function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "blue" | "warning" }) {
  const styles = {
    neutral: "border-border-subtle bg-surface-subtle text-on-surface-variant",
    blue: "border-tertiary-fixed bg-tertiary-fixed/50 text-on-tertiary-container",
    warning: "border-warning-amber/30 bg-warning-amber-subtle text-on-surface",
  };
  return <span className={`inline-flex items-center rounded-full border px-space-sm py-space-xs text-label-sm ${styles[tone]}`}>{children}</span>;
}

export default function ContactListRow({ contact }: { contact: ContactListItem }) {
  const latestDate = contact.latestInteraction ? formatContactDate(contact.latestInteraction.createdAt) : null;
  const latestTime = contact.latestInteraction ? formatContactTime(contact.latestInteraction.createdAt) : null;

  return (
    <li>
      <Link
        className="group block border-b border-border-subtle p-space-lg transition-colors last:border-b-0 hover:bg-surface-canvas focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-primary"
        href={`/contacts/${encodeURIComponent(contact.id)}`}
      >
        <article className="grid gap-space-md sm:grid-cols-[auto_minmax(0,1fr)_12rem] sm:items-center">
          <div aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-label-md text-on-primary-fixed">{contact.initials}</div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-space-sm">
              <h2 className="truncate font-heading text-headline-sm text-on-surface group-hover:text-primary">{contact.displayName}</h2>
              {contact.isTest && <Badge tone="warning">Test</Badge>}
              {contact.organizationMismatch && <Badge tone="blue">Organización distinta</Badge>}
            </div>
            <div className="mt-space-xs flex flex-wrap items-center gap-x-space-sm gap-y-space-xs text-body-sm text-on-surface-variant">
              <span>{contact.source.label}</span>
              {contact.latestInteraction && <><span aria-hidden="true">·</span><span>{contact.latestInteraction.channel.label}</span>{contact.latestInteraction.direction && <><span aria-hidden="true">·</span><span>{contact.latestInteraction.direction === "inbound" ? "Entrante" : "Saliente"}</span></>}</>}
            </div>
            {contact.latestInteraction?.summary && <p className="mt-space-sm line-clamp-2 text-body-sm text-on-surface-variant">{contact.latestInteraction.summary}</p>}
            {contact.organizationMismatch && <p className="mt-space-sm text-label-sm text-tertiary">Organización registrada: {contact.organizationId ?? "desconocida"} · Exportación: {contact.exportOrganizationId ?? "desconocida"}</p>}
          </div>
          <div className="flex items-center justify-between gap-space-md text-body-sm text-on-surface-variant sm:block sm:text-right">
            <div>
              <p className="font-medium text-on-surface">{latestDate ?? "Sin fecha"}</p>
              {latestTime && <p className="mt-space-xs text-label-sm">{latestTime}</p>}
            </div>
            <span aria-hidden="true" className="text-lg text-on-surface-variant transition-transform group-hover:translate-x-0.5 group-hover:text-primary">→</span>
          </div>
        </article>
      </Link>
    </li>
  );
}
