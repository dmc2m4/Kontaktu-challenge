export default function ContactLoading() {
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
