export default function ActivitiesLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-g-page">
      <div className="h-14 border-b border-g-border bg-g-card" />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-6 animate-pulse">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-g-raised" />
          <div className="space-y-1.5">
            <div className="h-7 w-28 rounded-lg bg-g-raised" />
            <div className="h-3 w-56 rounded bg-g-raised" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-g-border bg-g-card px-4 py-3">
              <div className="h-9 w-9 rounded-lg bg-g-raised" />
              <div className="space-y-1.5">
                <div className="h-6 w-10 rounded bg-g-raised" />
                <div className="h-3 w-16 rounded bg-g-raised" />
              </div>
            </div>
          ))}
        </div>

        {/* Activity groups */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-g-border bg-g-card overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4">
              <div className="h-9 w-9 rounded-lg bg-g-raised" />
              <div className="flex-1 space-y-1.5">
                <div className="h-5 w-28 rounded bg-g-raised" />
                <div className="h-3 w-36 rounded bg-g-raised" />
              </div>
            </div>
            <div className="grid gap-2 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="rounded-xl border border-g-border bg-g-card/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-g-raised" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-24 rounded bg-g-raised" />
                      <div className="h-3 w-16 rounded bg-g-raised" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
