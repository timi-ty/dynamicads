"use client";

import Image from "next/image";
import { useContext, useState } from "react";
import { api } from "~/trpc/react";
import { AdMarkerType } from "~/utils/types";
import ConfigureAdMarkerModalGroup, {
  ConfigureAdMarkerStatus,
} from "./ConfigureAdMarker";
import EpisodeVideoContext from "../_context/EpisodeVideoContext";

export default function CreateAdMarkerButtons({
  episodeId,
  className,
  disabled,
}: Readonly<{
  episodeId: number;
  className?: string;
  disabled?: boolean;
}>) {
  const [status, setStatus] = useState<ConfigureAdMarkerStatus>("Done");
  const queryUtils = api.useUtils();
  const createMarker = api.marker.create.useMutation();
  const videoContext = useContext(EpisodeVideoContext);

  function handleFinish(markerType: AdMarkerType) {
    setStatus("Finishing");
    createMarker.mutate(
      {
        type: markerType,
        value: Math.floor(videoContext.controls.videoTime * 1000), // Marker values are stored in millis
        episodeId: episodeId,
      },
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
      <div
        className={`flex flex-col gap-4 ${disabled ? "pointer-events-none opacity-30" : ""}`}
      >
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
          onClick={() => handleFinish("Auto")}
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
