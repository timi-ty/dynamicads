"use client";

import Image from "next/image";
import withDropdown from "../_generic_components/withDrodpdown";

function EpisodeItem({ name }: Readonly<{ name: string }>) {
  return (
    <button
      type="button"
      className="mt-4 flex w-64 flex-row items-center justify-between rounded-md border p-4 pb-3 pt-3 text-sm font-medium"
    >
      <Image
        src={"/placeholder_episode-thumbnail.png"}
        alt="profile"
        width={32}
        height={32}
      />
      <span className="text-zinc-500">{name}</span>
      <Image
        src={"ic_chevron-down.svg"}
        alt="settings"
        width={16}
        height={16}
      />
    </button>
  );
}

const EpisodeDropdown = withDropdown(EpisodeItem);

export default function EpisodePicker() {
  return (
    <EpisodeDropdown
      items={[
        {
          name: "Episode 1",
        },
        {
          name: "Episode 2",
        },
        {
          name: "Episode 3",
        },
      ]}
    />
  );
}
