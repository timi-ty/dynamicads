"use client";

import { millisecondsToHHMMSS } from "~/utils/format";
import Image from "next/image";
import { type ChangeEvent, useContext, useState } from "react";
import EpisodeVideoContext from "../_context/EpisodeVideoContext";
import Scrubber, { ScrubberLoader } from "./Scrubber";
import useGlobalActionStack from "~/app/_hooks/useGlobalActionStack";

export default function Inspector({
  className,
}: Readonly<{
  className?: string;
}>) {
  const minZoomIndex = 0;
  const maxZoomIndex = 1;
  const [zoomIndex, setZoomIndex] = useState(0.5);
  const videoContext = useContext(EpisodeVideoContext);

  return (
    <div className={className}>
      <div className="flex min-h-[358px] flex-col justify-between rounded-2xl border bg-white p-8 shadow">
        <Controls
          zoomIndex={zoomIndex}
          setZoomIndex={(index) => setZoomIndex(index)}
          zoomOpts={{ minZoomIndex, maxZoomIndex }}
        />
        {videoContext.controls.isReady ? (
          <Scrubber zoom={zoomFromIndex(zoomIndex)} />
        ) : (
          <ScrubberLoader />
        )}
      </div>
    </div>
  );
}

function Controls({
  zoomIndex,
  setZoomIndex,
  zoomOpts,
}: Readonly<{
  zoomIndex: number;
  setZoomIndex: (index: number) => void;
  zoomOpts?: { minZoomIndex?: number; maxZoomIndex?: number };
}>) {
  const videoContext = useContext(EpisodeVideoContext);
  const { canUndo, canRedo, undoAction, redoAction } = useGlobalActionStack();

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-4 text-zinc-500 md:flex-row">
      <div className="flex flex-row items-center gap-12 text-sm">
        <button
          className={`group flex flex-row items-center gap-3 ${canUndo ? "" : "opacity-60"}`}
          type="button"
          disabled={!canUndo}
          onClick={undoAction}
        >
          <Image
            src="/ic_arrow-anticlockwise.svg"
            alt="undo"
            width={32}
            height={32}
            className={`rounded-full border p-2 ${canUndo ? "group-active:bg-zinc-100" : ""}`}
          />
          <span className={`${canUndo ? "group-active:text-zinc-900" : ""}`}>
            Undo
          </span>
        </button>
        <button
          className={`group flex flex-row items-center gap-3 ${canRedo ? "" : "opacity-60"}`}
          type="button"
          disabled={!canRedo}
          onClick={redoAction}
        >
          <Image
            src="/ic_arrow-clockwise.svg"
            alt="redo"
            width={32}
            height={32}
            className={`rounded-full border p-2 ${canRedo ? "group-active:bg-zinc-100" : ""}`}
          />
          <span className={`${canRedo ? "group-active:text-zinc-900" : ""}`}>
            Redo
          </span>
        </button>
      </div>
      <span className="rounded-md border p-3 pb-2 pt-2">
        {millisecondsToHHMMSS(videoContext.getScrubberTime() * 1000)}
      </span>
      <ZoomSlider
        zoomIndex={zoomIndex}
        setZoomIndex={setZoomIndex}
        zoomOpts={zoomOpts}
      />
    </div>
  );
}

function ZoomSlider({
  zoomIndex,
  setZoomIndex,
  zoomOpts,
}: Readonly<{
  zoomIndex: number;
  setZoomIndex: (index: number) => void;
  zoomOpts?: { minZoomIndex?: number; maxZoomIndex?: number };
}>) {
  function handleSliderChange(ev: ChangeEvent<HTMLInputElement>) {
    // Remap the slider values back to min/max zoomIndex.
    const newValue = parseFloat(ev.target.value) * 0.01;
    setZoomIndex(newValue);
  }

  return (
    <div className="flex w-[288px] flex-row items-center justify-between gap-6">
      <button className="flex-shrink-0">
        <Image
          src="/ic_magnifying-glass-minus.svg"
          alt="zoom out"
          width={20}
          height={20}
          onClick={() =>
            setZoomIndex(
              Math.max(zoomIndex - 0.2, zoomOpts?.minZoomIndex ?? -1),
            )
          }
        />
      </button>
      <input
        type="range"
        min={(zoomOpts?.minZoomIndex ?? 0) * 100}
        max={(zoomOpts?.maxZoomIndex ?? 1) * 100}
        value={zoomIndex * 100}
        className="slider"
        onChange={handleSliderChange}
      />
      <button className="flex-shrink-0">
        <Image
          src="/ic_magnifying-glass-plus.svg"
          alt="zoom out"
          width={20}
          height={20}
          onClick={() =>
            setZoomIndex(Math.min(zoomIndex + 0.2, zoomOpts?.maxZoomIndex ?? 1))
          }
        />
      </button>
    </div>
  );
}

function zoomFromIndex(zoomIndex: number) {
  return Math.pow(10, zoomIndex);
}
