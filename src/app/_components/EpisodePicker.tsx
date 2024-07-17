"use client";

import Image from "next/image";
import withDropdown from "../_generic_components/withDrodpdown";
import { api } from "~/trpc/react";
import Link from "next/link";
import usePickedEpisodeId from "../_hooks/usePickedEpisodeId";

export default function EpisodePicker({
  className,
}: Readonly<{ className?: string }>) {
  const { data, error } = api.episode.getAll.useQuery();
  const [pickedEpisodeId, setPickedEpisodeId] = usePickedEpisodeId();

  if (error ?? data?.error)
    return <EpisodeItemEmpty className={className} hasError={true} />;

  if (data?.episodes && data.episodes.length > 0)
    return (
      <EpisodeDropdown
        className={className}
        items={data.episodes}
        pickedItemId={pickedEpisodeId}
        onSelectItem={(item) => {
          // We could navigate here with a next router but we use a Link instead in the EpisodeItem.
          setPickedEpisodeId(item.id);
        }}
      />
    );

  return <EpisodeItemEmpty className={className} />;
}

function EpisodeDropdownItem({
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
      href={isPicker ? "" : link} // We don't want the picker to do the link action.
      type="button"
      className={`flex w-64 flex-row items-center justify-between rounded-md bg-zinc-50 p-4 pb-3 pt-3 text-sm font-medium ${isSelected ? "border-2 border-zinc-900" : "border"} ${isPicker && isExpanded ? "shadow" : ""}`}
    >
      <div className="flex flex-row items-center">
        <Image
          src={"/placeholder_episode-thumbnail.png"}
          alt="profile"
          width={32}
          height={32}
          className="flex-shrink-0"
        />
        <span className="line-clamp-2 pe-8 ps-8 text-zinc-500">
          {data.name}
        </span>
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

function EpisodeItemEmpty({
  className,
  hasError,
}: Readonly<{ className?: string; hasError?: boolean }>) {
  return (
    <div className={className}>
      <span className="flex w-64 flex-row items-center justify-between rounded-md border p-4 pb-3 pt-3 text-sm font-medium">
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
    </div>
  );
}

const EpisodeDropdown = withDropdown(EpisodeDropdownItem);
