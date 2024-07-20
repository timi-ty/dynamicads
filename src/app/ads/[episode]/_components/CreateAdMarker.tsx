"use client";

import Image from "next/image";
import { useContext, useState } from "react";
import { api } from "~/trpc/react";
import { type AdMarkerType } from "~/utils/types";
import ConfigureAdMarkerModalGroup, {
  type ConfigureAdMarkerStatus,
} from "./ConfigureAdMarker";
import EpisodeVideoContext from "../_context/EpisodeVideoContext";
import useGlobalActionStack from "~/app/_hooks/useGlobalActionStack";

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
  const deleteMarker = api.marker.delete.useMutation();
  const videoContext = useContext(EpisodeVideoContext);
  const { doAction } = useGlobalActionStack();

  function handleFinish(markerType: AdMarkerType) {
    async function primary() {
      setStatus("Finishing");
      const { marker, error } = await createMarker.mutateAsync({
        // No need to wrap in try block for actions.
        type: markerType,
        value: Math.floor(videoContext.getScrubberTime() * 1000), // Marker values are stored in millis
        episodeId: episodeId,
      });
      if (error ?? !marker) {
        setStatus("Error");
        return null; // Failed to create marker, this situation is not reversible.
      }
      setStatus("Done");
      void queryUtils.marker.getAll.invalidate();

      return { markerId: marker.id };
    }
    async function revert(params?: { markerId: number }) {
      if (!params) return; // Did not get the needed parameters, can't revert.

      /* This is better implemented as a soft delete. Deleting as a reversal of a creation means the data cannot be truly recovered.
      Due to this, the redo stack must be invalidated*/
      await deleteMarker.mutateAsync(
        { markerId: params.markerId },
        {
          onSettled: () => {
            void queryUtils.marker.getAll.invalidate();
          },
        },
      );
      return null; // Deleting this maker is non-reversible as it would take on a new id if it gets recreated.
    }
    void doAction(primary, revert);
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
