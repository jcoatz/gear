export default function BagsLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-g-page">
      <div className="h-14 border-b border-g-border bg-g-card" />
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-g-raised" />
            <div className="space-y-1.5">
              <div className="h-7 w-24 rounded-lg bg-g-raised" />
              <div className="h-3 w-56 rounded bg-g-raised" />
            </div>
          </div>
          <div className="h-9 w-24 rounded-lg bg-g-raised" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-g-border bg-g-card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-g-raised" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-5 w-2/3 rounded bg-g-raised" />
                  <div className="h-3 w-1/3 rounded bg-g-raised" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-5 w-12 rounded-full bg-g-raised" />
                <div className="h-5 w-20 rounded-full bg-g-raised" />
                <div className="h-5 w-16 rounded-full bg-g-raised" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
