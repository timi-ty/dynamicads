"use client";

import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { videoLengthAtom, videoTimeAtom } from "./VideoPlayer";
import { millisecondsToHHMMSS } from "~/utils/format";
import Image from "next/image";
import { ChangeEvent, useState } from "react";

const scrubberLengthPerSecondPerZoom = 121; // px
const zoomIndexAtom = atom(0);

export default function Inspector({
  className,
}: Readonly<{
  className?: string;
}>) {
  return (
    <div className={className}>
      <div className="flex h-[358px] min-w-[1232px] flex-col justify-between rounded-2xl border p-8 shadow">
        <Controls />
        <Scrubber />
      </div>
    </div>
  );
}

function Controls() {
  const videoTime = useAtomValue(videoTimeAtom);

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
      <ZoomSlider />
    </div>
  );
}

function ZoomSlider() {
  // This min is a magic value selected to just fit the scrubber within its container.
  // Zoom levels below this will make the timestamp have too little space for text.
  const minZoomIndex = -0.28;
  const maxZoomIndex = 1;
  const [zoomIndex, setZoomIndex] = useAtom(zoomIndexAtom);

  function handleSliderChange(ev: ChangeEvent<HTMLInputElement>) {
    // Remap the slider values (-28-100) to min/max zoomIndex (-0.28-1)
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
        min={minZoomIndex * 100}
        max={maxZoomIndex * 100}
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

function Scrubber() {
  const videoLength = useAtomValue(videoLengthAtom);
  const zoomIndex = useAtomValue(zoomIndexAtom);
  const width = Math.ceil(
    scrubberLengthPerSecondPerZoom * videoLength * zoomFromIndex(zoomIndex),
  );
  const timesStamps = Array.from(
    { length: Math.ceil(videoLength) },
    (_, i) => i,
  );

  return (
    <div className="w-full overflow-x-scroll pb-8">
      <div
        className="h-[182px] overflow-hidden"
        style={{ width: `${width + 16}px` }}
      >
        <div className="h-32 w-full rounded-lg bg-zinc-900 p-2">
          <div className="h-full w-full rounded-lg bg-fuchsia-300"></div>
        </div>
        <div className="flex flex-row pe-2 ps-2">
          {timesStamps.map((i) => (
            <TimeStamp key={i} seconds={i} zoom={zoomFromIndex(zoomIndex)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TimeStamp({
  seconds,
  zoom,
}: Readonly<{ seconds: number; zoom: number }>) {
  const arrayOfTen = Array.from({ length: 10 }, (_, i) => i);
  const width = scrubberLengthPerSecondPerZoom * zoom;
  return (
    <div
      className="relative flex h-[54px] flex-row justify-between"
      style={{ width: `${width}px` }}
    >
      <div
        className={`absolute flex h-full w-full flex-row items-center justify-center ${width > 74 ? "text-sm" : "text-xs"} font-semibold text-zinc-500`}
      >
        <div>{millisecondsToHHMMSS(seconds * 1000)}</div>
      </div>
      {arrayOfTen.map((i) => (
        <div
          key={i}
          className="border-l bg-zinc-300"
          style={{
            height: `${i === 0 ? "100%" : "8px"}`,
            opacity: `${i === 9 ? "0" : ""}`,
          }}
        ></div>
      ))}
    </div>
  );
}

function zoomFromIndex(zoomIndex: number) {
  return Math.pow(10, zoomIndex);
}
