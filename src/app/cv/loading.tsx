export default function CvLoading() {
  return (
    <div className="min-h-screen bg-canvas py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-6 flex items-center justify-between border-2 border-borderline bg-surface p-4">
          <div className="h-4 w-32 animate-pulse bg-ink/15" />
          <div className="h-9 w-36 animate-pulse border-2 border-borderline bg-ink/20" />
        </div>
        <div className="space-y-6 border-2 border-borderline bg-surface p-5 shadow-brutal sm:p-10">
          <div className="space-y-3 border-b-2 border-borderline pb-6">
            <div className="h-8 w-64 animate-pulse bg-ink/15" />
            <div className="h-4 w-40 animate-pulse bg-ink/10" />
            <div className="h-3 w-full max-w-lg animate-pulse bg-ink/10" />
          </div>
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="space-y-2.5">
              <div className="h-4 w-36 animate-pulse bg-ink/15" />
              <div className="h-4 w-full animate-pulse bg-ink/10" />
              <div className="h-4 w-5/6 animate-pulse bg-ink/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
