"use client";

import Image from "next/image";
import CreateAdMarkerButtons from "./CreateAdMarker";
import { type AdMarkerType } from "~/utils/types";
import AdMarkerItem from "./AdMarkerItem";
import { api } from "~/trpc/react";
import { useContext } from "react";
import EpisodeVideoContext from "../_context/EpisodeVideoContext";

export default function AdMarkers({
  className,
}: Readonly<{
  className?: string;
}>) {
  // We wrap the AdMarkersCard because it returns different layouts based on loading conditions but they all need to have a consistent parent.
  return (
    <div className={className}>
      <AdMarkersCard />
    </div>
  );
}

function AdMarkersCard() {
  const { controls, episode } = useContext(EpisodeVideoContext);
  const { data, error } = api.marker.getAll.useQuery({ episodeId: episode.id });

  const hasError = error ?? data?.error; // To be used for truthy or falsy value

  if (!hasError && !data) return <Loader />;

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border bg-white pb-8 pt-8 shadow">
      <div>
        <div className="flex flex-row justify-between pe-8 ps-8">
          <span className="text-zinc-800">Ad markers</span>
          <span className="text-zinc-500">
            {data?.markers?.length ?? 0} markers
          </span>
        </div>
        <div className="mt-4 flex max-h-[326px] flex-col gap-4 overflow-auto pe-8 ps-8">
          {data?.markers?.map((marker, i) => (
            <AdMarkerItem
              key={marker.id}
              id={marker.id}
              index={i + 1}
              type={marker.type as AdMarkerType}
              value={marker.value}
            />
          ))}
        </div>
      </div>

      {!hasError && data?.markers?.length === 0 && (
        <span className="flex flex-grow flex-col items-center justify-center text-zinc-500">
          Create a marker to see it here.
        </span>
      )}
      {hasError && (
        <span className="flex flex-grow flex-col items-center justify-center text-zinc-500">
          An error occured.
        </span>
      )}
      {!hasError && (
        <CreateAdMarkerButtons
          className="mt-4 pe-8 ps-8"
          episodeId={episode.id}
          disabled={!controls.isReady}
        />
      )}
    </div>
  );
}

function Loader() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-12 rounded-2xl border bg-white p-8 text-zinc-500 shadow">
      <span>Loading Markers</span>
      <Image
        src="/spinner.svg"
        alt={"loading episode"}
        width={32}
        height={32}
      />
    </div>
  );
}
