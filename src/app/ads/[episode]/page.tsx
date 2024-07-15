import { api } from "~/trpc/server";
import AdMarkers from "./_components/AdMarkers";
import VideoPlayer from "./_components/VideoPlayer";
import { Suspense } from "react";
import Image from "next/image";
import Inspector from "./_components/Inspector";
import { VideoContextProvider } from "./_context/VideoContext";

export default function EpisodePage({
  params,
}: Readonly<{ params: { episode: string } }>) {
  return (
    <Suspense fallback={<Loader />}>
      <EpisodeViewer episodeId={parseInt(params.episode)} />
    </Suspense>
  );
}

async function EpisodeViewer({ episodeId }: Readonly<{ episodeId: number }>) {
  const data = await api.episode.get({ id: episodeId });

  if (!data || (data && data.error))
    return (
      <div className="flex h-full flex-row items-center justify-center text-zinc-500">
        <span>An error occured.</span>
      </div>
    );

  if (data && data.episode)
    return (
      <div className="min-w-[1232px]">
        <span className="text-sm text-zinc-500">{"<-"} Ads</span>
        <div className="mt-4 max-w-[616px] text-3xl">{data.episode.name}</div>
        <div className="mt-4 text-zinc-500">
          <span>
            Episode {data.episode.id} • {data.episode.createdAt.toDateString()}
          </span>
        </div>
        <VideoContextProvider>
          <div className="mt-8 flex flex-row gap-8">
            <span>
              <AdMarkers episodeId={data.episode.id} />
            </span>
            <span>
              <VideoPlayer videoUrl={data.episode.fileUrl} />
            </span>
          </div>
          <Inspector className="mt-8" />
        </VideoContextProvider>
      </div>
    );

  return (
    <div className="flex h-full flex-row items-center justify-center text-zinc-500">
      <span>No episode.</span>
    </div>
  );
}

function Loader() {
  return (
    <div className="flex h-full flex-row items-center justify-center gap-2 text-zinc-500">
      <span>Loading Episode</span>
      <Image
        src="/spinner.svg"
        alt={"loading episode"}
        width={32}
        height={32}
      />
    </div>
  );
}
