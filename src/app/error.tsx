"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-margin py-space-xl sm:px-margin-tablet">
      <section className="w-full rounded-xl border border-border-subtle bg-surface-card p-space-lg shadow-card">
        <p className="text-label-sm uppercase text-danger-rose">Error</p>
        <h1 className="mt-space-sm font-heading text-headline-md">
          No pudimos cargar esta vista
        </h1>
        <p className="mt-space-sm text-body-md text-on-surface-variant">
          Inténtalo de nuevo. No se han incluido datos personales en el mensaje.
        </p>
        <button
          className="mt-space-lg min-h-11 rounded-md bg-primary-container px-space-lg text-body-md font-semibold text-on-primary-container hover:brightness-95 focus-visible:outline-2 focus-visible:outline-primary"
          onClick={reset}
          type="button"
        >
          Reintentar
        </button>
      </section>
    </main>
  );
}
