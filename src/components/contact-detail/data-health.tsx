import type { ContactDetail } from "@/lib/contacts/contact-types";

function Badge({ children, complete }: { children: React.ReactNode; complete: boolean }) {
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-label-sm ${complete ? "border-secondary-fixed bg-secondary-fixed/45 text-on-secondary-fixed-variant" : "border-warning-amber/30 bg-warning-amber-subtle"}`}>{children}</span>;
}

export default function DataHealth({ contact }: { contact: ContactDetail }) {
  const complete = contact.dataHealth.contactMethodAvailable && contact.dataHealth.intentAvailable;
  return (
    <section className="rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-card">
      <div className="mb-space-md flex items-center justify-between"><h2 className="font-heading text-headline-sm">Salud del dato</h2><Badge complete={complete}>{complete ? "Completo" : "Incompleto"}</Badge></div>
      <ul className="space-y-space-sm text-body-sm">
        <li><span className={contact.dataHealth.contactMethodAvailable ? "text-success-emerald" : "text-warning-amber"}>{contact.dataHealth.contactMethodAvailable ? "●" : "○"}</span> {contact.dataHealth.contactMethodAvailable ? "Método de contacto utilizable" : "Falta un método de contacto utilizable"}</li>
        <li><span className={contact.dataHealth.intentAvailable ? "text-success-emerald" : "text-warning-amber"}>{contact.dataHealth.intentAvailable ? "●" : "○"}</span> {contact.dataHealth.intentAvailable ? "Hay información de intención inmobiliaria" : "Falta información de intención inmobiliaria"}</li>
      </ul>
    </section>
  );
}
