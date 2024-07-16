"use client";

import { millisecondsToHHMMSS } from "~/utils/format";
import Image from "next/image";
import { ChangeEvent, useContext, useState } from "react";
import EpisodeVideoContext from "../_context/EpisodeVideoContext";
import Scrubber, { ScrubberLoader } from "./Scrubber";

export default function Inspector({
  className,
}: Readonly<{
  className?: string;
}>) {
  // This min is a magic value selected for a 17s video to just fit the scrubber within its container.
  // Zoom levels below this will make the timestamp have too little space for text.
  const minZoomIndex = -0.28;
  const maxZoomIndex = 1;
  const [zoomIndex, setZoomIndex] = useState(0);
  const videoContext = useContext(EpisodeVideoContext);

  return (
    <div className={className}>
      <div className="flex min-h-[358px] min-w-[1232px] flex-col justify-between rounded-2xl border bg-white p-8 shadow">
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
  const videoTime = videoContext.controls.videoTime;

  return (
    <div className="flex flex-row items-center justify-between text-zinc-500">
      <div className="flex flex-row items-center gap-12 text-sm">
        <button className="flex flex-row items-center gap-3" type="button">
          <Image
            src="/ic_arrow-anticlockwise.svg"
            alt="undo"
            width={32}
            height={32}
            className="rounded-full border p-2"
          />
          <span>Undo</span>
        </button>
        <button className="flex flex-row items-center gap-3" type="button">
          <Image
            src="/ic_arrow-clockwise.svg"
            alt="redo"
            width={32}
            height={32}
            className="rounded-full border p-2"
          />
          <span>Redo</span>
        </button>
      </div>
      <span className="rounded-md border p-3 pb-2 pt-2">
        {millisecondsToHHMMSS(videoTime * 1000)}
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
        />
      </button>
      <input
        type="range"
        min={(zoomOpts?.minZoomIndex || 0) * 100}
        max={(zoomOpts?.maxZoomIndex || 1) * 100}
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
        />
      </button>
    </div>
  );
}

function zoomFromIndex(zoomIndex: number) {
  return Math.pow(10, zoomIndex);
}
