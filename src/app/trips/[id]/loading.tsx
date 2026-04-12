export default function TripDetailLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-g-page">
      <div className="h-14 border-b border-g-border bg-g-card" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 animate-pulse">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-g-raised" />
          <div className="space-y-1.5">
            <div className="h-7 w-48 rounded-lg bg-g-raised" />
            <div className="h-3 w-32 rounded bg-g-raised" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-g-border bg-g-card px-4 py-3">
              <div className="h-9 w-9 rounded-lg bg-g-raised" />
              <div className="space-y-1.5">
                <div className="h-6 w-12 rounded bg-g-raised" />
                <div className="h-3 w-14 rounded bg-g-raised" />
              </div>
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Gear pool */}
          <div className="rounded-xl border border-g-border bg-g-card p-4 space-y-3">
            <div className="h-5 w-28 rounded bg-g-raised" />
            <div className="h-9 w-full rounded-lg bg-g-raised" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-g-raised/50 px-3 py-2.5">
                  <div className="h-8 w-8 rounded-lg bg-g-raised" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-2/3 rounded bg-g-raised" />
                    <div className="h-3 w-1/3 rounded bg-g-raised" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trip bag */}
          <div className="rounded-xl border border-g-border bg-g-card p-4 space-y-3">
            <div className="h-5 w-20 rounded bg-g-raised" />
            <div className="h-1.5 w-full rounded-full bg-g-raised" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-g-raised/50 px-3 py-2.5">
                  <div className="h-5 w-5 rounded-full bg-g-raised" />
                  <div className="h-8 w-8 rounded-lg bg-g-raised" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-2/3 rounded bg-g-raised" />
                    <div className="h-3 w-1/3 rounded bg-g-raised" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
