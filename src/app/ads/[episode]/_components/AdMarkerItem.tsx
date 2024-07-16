"use client";

import Image from "next/image";
import { useState } from "react";
import { api } from "~/trpc/react";
import { millisecondsToHHMMSS } from "~/utils/format";
import { AdMarkerType } from "~/utils/types";
import ConfigureAdMarkerModalGroup, {
  ConfigureAdMarkerStatus,
} from "./ConfigureAdMarker";
import useGlobalActionStack from "~/app/_hooks/useGlobalActionStack";

export default function AdMarkerItem({
  id,
  index,
  value,
  type,
}: Readonly<{ id: number; index: number; type: AdMarkerType; value: number }>) {
  const queryUtils = api.useUtils();
  const deleteMarker = api.marker.delete.useMutation();
  const createMarker = api.marker.create.useMutation();

  const [status, setStatus] = useState<ConfigureAdMarkerStatus>("Done");
  const editMarker = api.marker.update.useMutation();

  const { doAction } = useGlobalActionStack();

  function handleEdit(markerType: AdMarkerType) {
    async function primary() {
      setStatus("Finishing");
      const { updatedMarker } = await editMarker.mutateAsync({
        type: markerType,
        markerId: id,
      });
      if (editMarker.error || !updatedMarker) {
        setStatus("Error");
        return null; // Nothing to revert.
      }
      setStatus("Done");
      queryUtils.marker.getAll.invalidate();

      return { oldType: type, markerId: id };
    }
    async function revert(params?: {
      oldType: AdMarkerType;
      markerId: number;
    }) {
      if (!params) return;

      await editMarker.mutateAsync(
        { type: params.oldType, markerId: id },
        {
          onSuccess: () => {
            setStatus("Done");
            queryUtils.marker.getAll.invalidate();
          },
        },
      );
    }
    doAction(primary, revert);
  }

  function handleDismiss() {
    setStatus("Done");
  }

  function handleDelete() {
    async function primary() {
      const { deletedMarker } = await deleteMarker.mutateAsync({
        markerId: id,
      });
      if (deleteMarker.error || !deletedMarker) return null; // Nothing to revert.
      queryUtils.marker.getAll.invalidate();

      return {
        deletedMarkerType: deletedMarker.type as AdMarkerType,
        deletedMarkerEpisodeId: deletedMarker.episodeId,
        deletedMarkerValue: deletedMarker.value,
      };
    }
    async function revert(params?: {
      deletedMarkerType: AdMarkerType;
      deletedMarkerEpisodeId: number;
      deletedMarkerValue: number;
    }) {
      if (!params) return null;

      const { marker } = await createMarker.mutateAsync({
        /* This is better implemented as a soft delete. Having to create a new marker for the effect of reversing a delete causes an 
        edge case for the undo stack.  Due to this edge case, we have to invalidate the redo stack everytime we undo a delete.*/
        type: params.deletedMarkerType,
        value: params.deletedMarkerValue,
        episodeId: params.deletedMarkerEpisodeId,
      });
      if (createMarker.error || !marker) return null;
      queryUtils.marker.getAll.invalidate();
      return null; // Returning null here invalidates the redo stack. Cannot redo the delete.
    }
    doAction(primary, revert);
  }

  return (
    <div className="flex flex-row items-center justify-between gap-4">
      <div>{index}</div>
      <div className="flex flex-grow flex-row items-center justify-between rounded-lg border p-4 pb-3 pt-3 font-semibold shadow">
        <div className="flex flex-row items-center gap-4">
          <span className="text-zinc-800">{millisecondsToHHMMSS(value)}</span>
          <span
            className={`rounded-lg p-2.5 pb-1 pt-1 text-xs ${type === "Static" ? "bg-blue-200 text-blue-800" : type === "A/B" ? "bg-orange-200 text-orange-800" : "bg-green-200 text-green-800"}`}
          >
            {type}
          </span>
        </div>
        <div className="flex flex-row gap-4">
          <button
            className="rounded-md border bg-white p-3 pb-2 pt-2 text-sm text-zinc-900"
            onClick={() => setStatus("Configuring")}
          >
            Edit
          </button>
          <button
            onClick={!deleteMarker.isPending ? handleDelete : () => {}}
            className={`${deleteMarker.isPending ? "opacity-20" : ""}`}
          >
            <Image
              src="/ic_trash.svg"
              alt="trash"
              width={36}
              height={36}
              className="rounded-md bg-red-300 p-2.5"
            />
          </button>
        </div>
      </div>
      <ConfigureAdMarkerModalGroup
        status={status}
        handleFinish={handleEdit}
        handleDismiss={handleDismiss}
      />
    </div>
  );
}
