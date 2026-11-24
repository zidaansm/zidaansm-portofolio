export default function ProjectDetailLoading() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Navbar Skeleton */}
      <div className="h-14 border-b-2 border-borderline bg-canvas sm:h-16">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 border-2 border-borderline bg-ink" />
            <div className="h-5 w-20 animate-pulse bg-ink/15" />
          </div>
          <div className="h-8 w-24 animate-pulse border-2 border-borderline/30 bg-surface" />
        </div>
      </div>

      {/* Case Study Content Skeleton */}
      <main className="py-8 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 h-4 w-40 animate-pulse bg-ink/15 sm:mb-8" />

          {/* Header */}
          <div className="border-b-2 border-borderline pb-6 sm:pb-8">
            <div className="mb-4 flex gap-2">
              <div className="h-6 w-24 animate-pulse bg-ink/20" />
              <div className="h-6 w-28 animate-pulse border border-borderline/30 bg-surface" />
              <div className="h-6 w-16 animate-pulse border border-borderline/30 bg-surface" />
            </div>
            <div className="h-10 w-4/5 animate-pulse bg-ink/15 sm:h-12" />
            <div className="mt-4 h-5 w-full animate-pulse bg-ink/10" />
            <div className="mt-2 h-5 w-3/4 animate-pulse bg-ink/10" />
          </div>

          {/* Thumbnail 16:9 Skeleton */}
          <div className="my-6 aspect-[16/9] w-full animate-pulse border-2 border-borderline bg-surface shadow-brutal sm:my-8" />

          {/* Metadata Card Skeleton */}
          <div className="my-6 border-2 border-borderline bg-surface p-4 shadow-brutal sm:my-8 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <div className="h-3 w-16 animate-pulse bg-ink/15" />
                <div className="h-4 w-32 animate-pulse bg-ink/10" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-16 animate-pulse bg-ink/15" />
                <div className="h-4 w-20 animate-pulse bg-ink/10" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-16 animate-pulse bg-ink/15" />
                <div className="h-4 w-28 animate-pulse bg-ink/10" />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-borderline/20 pt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-6 w-20 animate-pulse border border-borderline/30 bg-canvas"
                />
              ))}
            </div>
          </div>

          {/* Sections Skeleton */}
          <div className="space-y-5 sm:space-y-8">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="border-2 border-borderline bg-surface p-4 sm:p-8"
              >
                <div className="mb-4 h-6 w-56 animate-pulse bg-ink/15" />
                <div className="space-y-2.5">
                  <div className="h-4 w-full animate-pulse bg-ink/10" />
                  <div className="h-4 w-11/12 animate-pulse bg-ink/10" />
                  <div className="h-4 w-4/5 animate-pulse bg-ink/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
