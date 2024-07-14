"use client";

import Image from "next/image";
import { useState } from "react";
import { api } from "~/trpc/react";
import { AdMarkerType } from "~/utils/types";
import ConfigureAdMarkerModalGroup, {
  ConfigureAdMarkerStatus,
} from "./ConfigureAdMarker";

export default function CreateAdMarkerButtons({
  episodeId,
  currentScrubberPos,
  className,
}: Readonly<{
  episodeId: number;
  currentScrubberPos: number;
  className?: string;
}>) {
  const [status, setStatus] = useState<ConfigureAdMarkerStatus>("Done");
  const queryUtils = api.useUtils();
  const createMarker = api.marker.create.useMutation();

  function handleFinish(markerType: AdMarkerType) {
    setStatus("Finishing");
    createMarker.mutate(
      { type: markerType, value: currentScrubberPos, episodeId: episodeId },
      {
        onSuccess: () => {
          setStatus("Done");
          queryUtils.marker.getAll.invalidate();
        },
        onError: () => {
          setStatus("Error");
        },
      },
    );
  }

  function handleDismiss() {
    setStatus("Done");
  }

  return (
    <div className={className}>
      <div className="flex flex-col gap-4">
        <button
          className="font-inter flex w-full flex-row items-center justify-center gap-2 rounded-md bg-zinc-900 p-4 pb-3 pt-3 text-sm font-medium text-zinc-50"
          onClick={() => {
            setStatus("Configuring");
          }}
        >
          <span>Create ad marker</span>
          <Image
            src="/ic_plus.svg"
            alt="create ad marker"
            width={16}
            height={16}
          />
        </button>
        <button
          className="font-inter flex w-full flex-row items-center justify-center gap-2 rounded-md border bg-white p-4 pb-3 pt-3 text-sm font-medium text-zinc-900"
          onClick={() => handleFinish("A/B")}
        >
          <span>Automatically place</span>
          <Image
            src="/ic_magic-wand.png"
            alt="automatically place"
            width={16}
            height={16}
          />
        </button>
      </div>
      <ConfigureAdMarkerModalGroup
        status={status}
        handleFinish={handleFinish}
        handleDismiss={handleDismiss}
      />
    </div>
  );
}
