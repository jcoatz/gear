export default function GearLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-g-page">
      {/* Nav skeleton */}
      <div className="h-14 border-b border-g-border bg-g-card" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-g-raised" />
            <div className="h-7 w-32 rounded-lg bg-g-raised" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 rounded-lg bg-g-raised" />
            <div className="h-9 w-28 rounded-lg bg-g-raised" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-g-border bg-g-card px-4 py-3">
              <div className="h-9 w-9 rounded-lg bg-g-raised" />
              <div className="space-y-1.5">
                <div className="h-6 w-12 rounded bg-g-raised" />
                <div className="h-3 w-16 rounded bg-g-raised" />
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar skeleton */}
        <div className="flex gap-3">
          <div className="h-9 flex-1 rounded-lg bg-g-raised" />
          <div className="h-9 w-28 rounded-lg bg-g-raised" />
          <div className="h-9 w-20 rounded-lg bg-g-raised" />
        </div>

        {/* Card grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-g-border bg-g-card p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-g-raised" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-g-raised" />
                  <div className="h-3 w-1/2 rounded bg-g-raised" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded-full bg-g-raised" />
                <div className="h-5 w-12 rounded-full bg-g-raised" />
              </div>
              <div className="flex gap-3">
                <div className="h-4 w-16 rounded bg-g-raised" />
                <div className="h-4 w-12 rounded bg-g-raised" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
