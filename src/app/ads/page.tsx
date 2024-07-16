"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import usePickedEpisodeId from "../_hooks/usePickedEpisodeId";
import { api } from "~/trpc/react";
import CreateEpisodeButton from "../_components/CreateEpisode";

export default function AdsPage() {
  const router = useRouter();
  const { data, error, isLoading } = api.episode.getAll.useQuery();
  const [pickedEpisodeId, setPickedEpisodeId] = usePickedEpisodeId();

  useEffect(() => {
    // If the ads page is showing, navigate to the picked episode.
    // If there is no valid episode, but there is data, pick the first episode on the list.

    if (error || (data && data.error)) return;

    if (data && data.episodes && data.episodes.length > 0 && data.episodes[0]) {
      const pickedEpisode = data.episodes.find(
        (episode) => episode.id === pickedEpisodeId,
      );
      if (pickedEpisode) {
        // The picked episode is valid, redirect to it.
        router.push(`/ads/${pickedEpisode.id}`);
      } else {
        // The picked episode is not valid, but there is at least one valid episode. Pick it.
        // Setting a state inside an effect that depends on the same state. But our conditions make sure the re-render is not infinite.
        setPickedEpisodeId(data.episodes[0].id);
      }
    }
  }, [pickedEpisodeId, data, error]);

  if (error || (data && data.error)) return <Error />;

  if (isLoading) return <Loader />;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-zinc-500">
      <span>No Episode here.</span>
      <CreateEpisodeButton />
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

function Error() {
  return (
    <div className="flex h-full flex-row items-center justify-center gap-2 text-zinc-500">
      <span>Error: No episodes.</span>
    </div>
  );
}
