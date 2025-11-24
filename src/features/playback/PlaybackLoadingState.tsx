/**
 * PlaybackLoadingState Component
 * 
 * Displays a polished loading state while playback initializes.
 * Shows animated skeleton loaders for game view, charts, and feed.
 */

export function PlaybackLoadingState() {
  return (
    <div className="w-full h-screen bg-background-primary flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
        {/* Game view skeleton */}
        <div className="flex-[3] min-w-0 min-h-[400px] lg:min-h-0">
          <div className="w-full h-full bg-background-secondary rounded-lg border border-decay-gray animate-pulse flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4 animate-pulse-subtle">🧟</div>
              <div className="text-ghost-dim text-lg">Preparing playback...</div>
            </div>
          </div>
        </div>

        {/* Right column skeleton */}
        <div className="flex-[2] min-w-0 flex flex-col gap-4">
          {/* Charts skeleton */}
          <div className="flex-[5] min-h-0 flex flex-col md:flex-row lg:flex-col gap-4">
            <div className="flex-1 min-h-[250px] md:min-h-0">
              <div className="w-full h-full bg-background-secondary rounded-lg border border-decay-gray animate-pulse" />
            </div>
            <div className="flex-1 min-h-[250px] md:min-h-0">
              <div className="w-full h-full bg-background-secondary rounded-lg border border-decay-gray animate-pulse" />
            </div>
          </div>

          {/* Feed skeleton */}
          <div className="flex-[3] bg-background-secondary rounded-lg border border-decay-gray p-4 min-h-0">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-background-tertiary rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls skeleton */}
      <div className="p-4 bg-background-secondary border-t border-decay-gray">
        <div className="h-32 bg-background-tertiary rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
