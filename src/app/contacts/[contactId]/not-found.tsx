import Link from "next/link";

export default function ContactNotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-margin py-space-xl sm:px-margin-tablet">
      <section className="w-full rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-card">
        <p className="text-label-sm uppercase text-on-surface-variant">
          Contacto
        </p>
        <h1 className="mt-space-sm font-heading text-headline-md">
          No encontramos este contacto
        </h1>
        <Link
          className="mt-space-lg inline-flex min-h-11 items-center rounded-md border border-border-subtle px-space-lg text-label-md hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-primary"
          href="/"
        >
          Volver al listado
        </Link>
      </section>
    </main>
  );
}
