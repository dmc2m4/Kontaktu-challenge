import type { ContactDetail } from "@/lib/contacts/contact-types";

export default function ContactActions({ contact }: { contact: ContactDetail }) {
  return (
    <section className="rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-card" aria-label="Acciones de contacto">
      <div className="flex flex-wrap gap-space-sm">
        <button type="button" disabled className="min-h-10 rounded-md bg-primary-container px-space-lg text-label-md text-on-primary disabled:cursor-not-allowed disabled:opacity-55">{contact.restrictions.callAllowed ? "Llamar ahora" : "Llamada bloqueada"}</button>
        <button type="button" disabled={!contact.restrictions.whatsappAvailable} className="min-h-10 rounded-md border border-secondary-fixed bg-secondary-fixed/40 px-space-lg text-label-md text-on-secondary-fixed-variant disabled:cursor-not-allowed disabled:opacity-55">{contact.restrictions.whatsappAvailable ? "WhatsApp disponible" : "WhatsApp bloqueado"}</button>
      </div>
    </section>
  );
}
