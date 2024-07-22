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
  const recoverMarker = api.marker.recover.useMutation();
  const videoContext = useContext(EpisodeVideoContext);
  const { doAction } = useGlobalActionStack();

  function handleCreate(markerType: AdMarkerType) {
    async function primary(params?: { deletedMarkerId: number }) {
      if (params) {
        /* If we have primary params, that means we are calling primary as a redo action. 
           In this particular case, the redo action is different from the original action.*/
        const { recoveredMarker } = await recoverMarker.mutateAsync({
          markerId: params.deletedMarkerId,
        });
        if (recoverMarker.error ?? !recoveredMarker) return null; // Nothing to undo.
        void queryUtils.marker.getAll.invalidate();

        return { markerId: recoveredMarker.id };
      }

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

      const { deletedMarker } = await deleteMarker.mutateAsync({
        markerId: params.markerId,
      });
      if (deleteMarker.error ?? !deletedMarker) return null; // Nothing to redo.
      void queryUtils.marker.getAll.invalidate();

      return { deletedMarkerId: deletedMarker.id };
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
          onClick={() => handleCreate("Auto")}
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
        handleFinish={handleCreate}
        handleDismiss={handleDismiss}
      />
    </div>
  );
}
