export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-g-page">
      <div className="h-14 border-b border-g-border bg-g-card" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 animate-pulse">
        {/* Header */}
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-g-raised" />
          <div className="h-4 w-72 rounded bg-g-raised" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-g-border bg-g-card px-4 py-3">
              <div className="h-9 w-9 rounded-lg bg-g-raised" />
              <div className="space-y-1.5">
                <div className="h-6 w-10 rounded bg-g-raised" />
                <div className="h-3 w-14 rounded bg-g-raised" />
              </div>
            </div>
          ))}
        </div>

        {/* Widgets grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-g-border bg-g-card p-5 space-y-4">
              <div className="h-5 w-36 rounded bg-g-raised" />
              <div className="space-y-2">
                <div className="h-12 w-full rounded-lg bg-g-raised" />
                <div className="h-12 w-full rounded-lg bg-g-raised" />
                <div className="h-12 w-full rounded-lg bg-g-raised" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
