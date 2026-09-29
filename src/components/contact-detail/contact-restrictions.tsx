import type { ContactDetail } from "@/lib/contacts/contact-types";

export default function ContactRestrictions({ contact }: { contact: ContactDetail }) {
  return (
    <section className="rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-card" aria-labelledby="contact-restrictions-heading">
      <h2 id="contact-restrictions-heading" className="mb-space-md font-heading text-headline-sm">Restricciones y canales</h2>
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
    </section>
  );
}
