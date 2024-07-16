"use client";

import Image from "next/image";
import { useState } from "react";
import { api } from "~/trpc/react";
import { millisecondsToHHMMSS } from "~/utils/format";
import { AdMarkerType } from "~/utils/types";
import ConfigureAdMarkerModalGroup, {
  ConfigureAdMarkerStatus,
} from "./ConfigureAdMarker";

export default function AdMarkerItem({
  id,
  index,
  value,
  type,
}: Readonly<{ id: number; index: number; type: AdMarkerType; value: number }>) {
  const queryUtils = api.useUtils();
  const deleteMarker = api.marker.delete.useMutation();

  const [status, setStatus] = useState<ConfigureAdMarkerStatus>("Done");
  const editMarker = api.marker.update.useMutation();

  function handleFinish(markerType: AdMarkerType) {
    setStatus("Finishing");
    editMarker.mutate(
      { type: markerType, markerId: id },
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

  function handleDeleteMarker() {
    deleteMarker.mutate(
      { markerId: id },
      {
        onSettled: () => {
          queryUtils.marker.getAll.invalidate();
        },
      },
    );
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
            onClick={!deleteMarker.isPending ? handleDeleteMarker : () => {}}
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
        handleFinish={handleFinish}
        handleDismiss={handleDismiss}
      />
    </div>
  );
}
