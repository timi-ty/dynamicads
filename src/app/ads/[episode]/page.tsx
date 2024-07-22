import { api } from "~/trpc/server";
import AdMarkers from "./_components/AdMarkers";
import VideoPlayer from "./_components/VideoPlayer";
import { Suspense } from "react";
import Image from "next/image";
import Inspector from "./_components/Inspector";
import { EpisodeVideoContextProvider } from "./_context/EpisodeVideoContext";
import Link from "next/link";

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

  if (data ? data.error : false)
    return (
      <div className="flex h-full flex-row items-center justify-center text-zinc-500">
        <span>An error occured.</span>
      </div>
    );

  if (data?.episode)
    return (
      <div>
        <Link href={"/"} className="link text-sm text-zinc-500">
          {"<-"} Ads
        </Link>
        <div className="mt-4 max-w-xl text-3xl">{data.episode.name}</div>
        <div className="mt-4 text-zinc-500">
          <span>
            Episode {data.episode.id} • {data.episode.createdAt.toDateString()}
          </span>
        </div>
        <EpisodeVideoContextProvider episode={data.episode}>
          <div className="mt-8 flex min-h-96 flex-col gap-8 lg:flex-row">
            <AdMarkers className="min-w-[400px] flex-grow lg:max-w-[412px]" />
            <VideoPlayer className="lg:max-w-[788px]" />
          </div>
          <Inspector className="mt-8" />
        </EpisodeVideoContextProvider>
      </div>
    );

  return (
    <div className="flex h-full flex-row items-center justify-center text-zinc-500">
      <span>Not an episode.</span>
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
