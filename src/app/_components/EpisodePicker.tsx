"use client";

import Image from "next/image";
import withDropdown from "../_generic_components/withDrodpdown";
import { api } from "~/trpc/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";

const pickedEpisodeAtom = atomWithStorage("picked_episode", 0);

export default function EpisodePicker() {
  const { data, error } = api.episode.getAll.useQuery();
  const [pickedEpisode, setPickedEpisode] = useAtom(pickedEpisodeAtom);

  if (error || (data && data.error)) return <EpisodeEmpty hasError={true} />;

  if (data && data.episodes && data.episodes.length > 0)
    return (
      <EpisodeDropdown
        items={data.episodes}
        pickedItemId={pickedEpisode}
        onSelectItem={(item) => {
          setPickedEpisode(item.id);
        }}
      />
    );

  return <EpisodeEmpty />;
}

function EpisodeItem({
  data,
  isSelected,
  isPicker,
  isExpanded,
}: Readonly<{
  data: { id: number; name: string };
  isSelected?: boolean;
  isPicker?: boolean;
  isExpanded?: boolean;
}>) {
  // We could get the current url here to decide if we want to link somewhere else like analytics per episode. For now, only ads.
  const link = `/ads/${data.id}`;
  return (
    <Link
      href={link}
      type="button"
      className={`mt-4 flex w-64 flex-row items-center justify-between rounded-md p-4 pb-3 pt-3 text-sm font-medium ${isSelected ? "border-2 border-zinc-900" : "border"} ${isPicker && isExpanded ? "shadow" : ""}`}
    >
      <div className="flex flex-row items-center">
        <Image
          src={"/placeholder_episode-thumbnail.png"}
          alt="profile"
          width={32}
          height={32}
          className="flex-shrink-0"
        />
        <span className="pe-8 ps-8 text-zinc-500">{data.name}</span>
      </div>

      {isPicker && (
        <Image
          src={"/ic_chevron-down.svg"}
          alt="settings"
          width={16}
          height={16}
        />
      )}
    </Link>
  );
}

function EpisodeEmpty({ hasError }: Readonly<{ hasError?: boolean }>) {
  return (
    <span className="mt-4 flex w-64 flex-row items-center justify-between rounded-md border p-4 pb-3 pt-3 text-sm font-medium">
      <div className="flex flex-row items-center gap-3">
        <Image
          src={"/placeholder_episode-thumbnail.png"}
          alt="profile"
          width={32}
          height={32}
        />
        <span className="text-zinc-500">
          {hasError ? "Error: No episodes" : "No Episodes Here"}
        </span>
      </div>
      <Image
        src={"/ic_chevron-down.svg"}
        alt="settings"
        width={16}
        height={16}
      />
    </span>
  );
}

const EpisodeDropdown = withDropdown(EpisodeItem);
