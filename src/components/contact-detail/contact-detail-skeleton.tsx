export default function ContactDetailSkeleton() {
  return (
    <main aria-live="polite" className="min-h-screen bg-surface-canvas p-gutter sm:p-gutter-desktop">
      <div className="mx-auto max-w-[1600px] space-y-space-lg">
        <div className="h-16 animate-pulse rounded-xl bg-surface-card" />
        <div className="grid gap-space-lg lg:grid-cols-[20rem_minmax(0,1fr)]">
          <div className="hidden h-[calc(100vh-8rem)] animate-pulse rounded-xl bg-surface-card lg:block" />
          <div className="space-y-space-lg">
            <div className="h-48 animate-pulse rounded-xl bg-surface-card" />
            <div className="h-96 animate-pulse rounded-xl bg-surface-card" />
          </div>
        </div>
      </div>
      <span className="sr-only">Cargando ficha de contacto</span>
    </main>
  );
}
