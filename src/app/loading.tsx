export default function Loading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1440px] px-margin py-space-xl sm:px-margin-tablet lg:px-margin-desktop">
      <div aria-live="polite" className="space-y-space-lg">
        <p className="text-label-sm uppercase text-on-surface-variant">
          Kontaktu / Contactos
        </p>
        <div className="h-9 w-56 animate-pulse rounded-md bg-surface-container-high" />
        <div className="space-y-space-sm">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-xl border border-border-subtle bg-surface-card"
            />
          ))}
        </div>
        <span className="sr-only">Cargando contactos</span>
      </div>
    </main>
  );
}
