export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Sticky Header Skeleton */}
      <div className="h-14 border-b-2 border-borderline bg-canvas sm:h-16">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 border-2 border-borderline bg-ink" />
            <div className="h-5 w-20 animate-pulse bg-ink/15" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-16 animate-pulse border-2 border-borderline/30 bg-surface" />
            <div className="h-8 w-8 animate-pulse border-2 border-borderline/30 bg-surface" />
          </div>
        </div>
      </div>

      {/* Hero Skeleton */}
      <section className="swiss-grid-bg border-b-2 border-borderline py-10 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <div className="flex gap-2">
                <div className="h-6 w-36 animate-pulse bg-ink/20" />
                <div className="h-6 w-32 animate-pulse border border-borderline/30 bg-surface" />
              </div>
              <div className="h-12 w-4/5 animate-pulse bg-ink/15 sm:h-16" />
              <div className="h-7 w-full max-w-xl animate-pulse bg-ink/10" />
              <div className="h-20 w-full max-w-2xl animate-pulse bg-ink/10" />
              <div className="flex gap-3 pt-2">
                <div className="h-12 w-36 animate-pulse border-2 border-borderline bg-ink/20" />
                <div className="h-12 w-36 animate-pulse border-2 border-borderline/40 bg-surface" />
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="border-2 border-borderline bg-surface p-4 shadow-brutal sm:p-6">
                <div className="mb-4 h-4 w-32 animate-pulse bg-ink/15" />
                <div className="mb-4 aspect-[4/3] w-full animate-pulse border-2 border-borderline/30 bg-ink/10" />
                <div className="space-y-3">
                  <div className="h-4 w-3/4 animate-pulse bg-ink/10" />
                  <div className="h-4 w-2/3 animate-pulse bg-ink/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
