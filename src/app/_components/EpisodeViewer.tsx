import AdMarkers from "./AdMarkers";
import VideoPlayer from "./VideoPlayer";

export default function EpisodeViewer({
  className,
}: Readonly<{ className?: string }>) {
  return (
    <main className={className}>
      <div className="p-16">
        <span className="text-sm text-zinc-500">{"<-"} Ads</span>
        <div className="mt-4 max-w-[616px] text-3xl">
          The Longevity Expert: The Truth About Ozempic, The Magic Weight Loss
          Drug & The Link Between Milk & Cancer!
        </div>
        <span className="mt-4 text-zinc-500">Episode 503 • 12 April 2024</span>
        <div className="mt-8 flex flex-row gap-8">
          <AdMarkers />
          <VideoPlayer />
        </div>
      </div>
    </main>
  );
}
