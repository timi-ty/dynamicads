import Image from "next/image";
import { useState, type FormEvent } from "react";
import ModalOverlay from "~/app/_generic_components/ModalOverlay";
import { type AdMarkerType } from "~/utils/types";

export type ConfigureAdMarkerStatus =
  | "Done"
  | "Configuring"
  | "Error"
  | "Finishing";

export default function ConfigureAdMarkerModalGroup({
  status,
  handleFinish,
  handleDismiss,
}: Readonly<{
  status: ConfigureAdMarkerStatus;
  handleFinish: (markerType: AdMarkerType) => void;
  handleDismiss: () => void;
}>) {
  const [markerType, setMarkerType] = useState<AdMarkerType>("Auto");

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    handleFinish(markerType);
  }

  if (status === "Finishing")
    return (
      <ModalOverlay>
        <div className="flex flex-row items-center justify-center gap-2">
          <span>Creating Ad Marker</span>
          <Image src="/spinner.svg" alt={status} width={32} height={32} />
        </div>
      </ModalOverlay>
    );

  if (status === "Configuring")
    return (
      <ModalOverlay>
        <div className="w-[462px]">
          <button onClick={handleDismiss} className="absolute right-4 top-4">
            <Image src="/ic_x.svg" alt="close" width={16} height={16} />
          </button>
          <div className="flex flex-col gap-2">
            <span className="text-zinc-800">Create ad marker</span>
            <span className="text-sm font-semibold text-zinc-500">
              Insert a new ad marker into this episode
            </span>
          </div>
          <form
            onSubmit={handleSubmit}
            className="mt-6 flex w-full flex-col gap-4"
          >
            <label className="flex w-full flex-row items-center justify-between rounded-lg border p-4 pb-3 pt-3 shadow-sm">
              <div className="flex flex-row gap-4">
                <Image
                  src="/ic_circle-dashed.svg"
                  alt="close"
                  width={40}
                  height={40}
                />
                <div className="flex flex-col gap-2">
                  <span className="text-zinc-800">Auto</span>
                  <span className="text-sm font-semibold text-zinc-500">
                    Automatic ad insertions
                  </span>
                </div>
              </div>
              <input
                type="radio"
                value="Auto"
                checked={markerType === "Auto"}
                onChange={() => setMarkerType("Auto")}
                className="size-4"
              />
            </label>
            <label className="flex w-full flex-row items-center justify-between rounded-lg border p-4 pb-3 pt-3 shadow-sm">
              <div className="flex flex-row gap-4">
                <Image
                  src="/ic_locate-fixed.svg"
                  alt="close"
                  width={40}
                  height={40}
                />
                <div className="flex flex-col gap-2">
                  <span className="text-zinc-800">Static</span>
                  <span className="text-sm font-semibold text-zinc-500">
                    A marker for a specific ad that you select
                  </span>
                </div>
              </div>
              <input
                type="radio"
                value="Static"
                checked={markerType === "Static"}
                onChange={() => setMarkerType("Static")}
                className="size-4"
              />
            </label>
            <label className="flex w-full flex-row items-center justify-between rounded-lg border p-4 pb-3 pt-3 shadow-sm">
              <div className="flex flex-row gap-4">
                <Image
                  src="/ic_test-tubes.svg"
                  alt="close"
                  width={40}
                  height={40}
                />
                <div className="flex flex-col gap-2">
                  <span className="text-zinc-800">A/B test</span>
                  <span className="text-sm font-semibold text-zinc-500">
                    Compare the performance of multiple ads
                  </span>
                </div>
              </div>
              <input
                type="radio"
                value="A/B"
                checked={markerType === "A/B"}
                onChange={() => setMarkerType("A/B")}
                className="size-4"
              />
            </label>
            <div className="mt-2 flex flex-row items-center justify-end gap-4">
              <button
                type="button"
                className="rounded-md border p-4 pb-2 pt-2 text-sm font-medium text-zinc-900 shadow-sm"
                onClick={handleDismiss}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-zinc-900 p-4 pb-2 pt-2 text-sm font-medium text-zinc-50"
              >
                Select marker
              </button>
            </div>
          </form>
        </div>
      </ModalOverlay>
    );

  if (status === "Error")
    return (
      <ModalOverlay>
        <div className="flex flex-col gap-8">
          <span>Something went wrong.</span>
          <button
            type="button"
            className="w-full rounded-md bg-zinc-900 p-4 pb-3 pt-3 text-sm font-medium text-zinc-50"
            onClick={handleDismiss}
          >
            Dismiss
          </button>
        </div>
      </ModalOverlay>
    );

  return <></>;
}
