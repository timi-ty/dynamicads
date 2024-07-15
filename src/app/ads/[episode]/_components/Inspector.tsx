"use client";

import { millisecondsToHHMMSS } from "~/utils/format";
import Image from "next/image";
import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { useRelativeMousePos } from "../_hooks/useMousePos";
import { clamp } from "~/utils/math";
import VideoContext from "../_context/VideoContext";

const scrubberLengthPerSecondPerZoom = 121; // px

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
  const videoContext = useContext(VideoContext);

  return (
    <div className={className}>
      <div className="flex min-h-[358px] min-w-[1232px] flex-col justify-between rounded-2xl border bg-white p-8 shadow">
        <Controls
          zoomIndex={zoomIndex}
          setZoomIndex={(index) => setZoomIndex(index)}
          zoomOpts={{ minZoomIndex, maxZoomIndex }}
        />
        {videoContext.controls.isReady ? (
          <Scrubber zoomIndex={zoomIndex} />
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
  const videoContext = useContext(VideoContext);
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

function Scrubber({ zoomIndex }: Readonly<{ zoomIndex: number }>) {
  const videoContext = useContext(VideoContext);
  const { videoLength, videoTime, seek } = videoContext.controls;
  // The pink area is the important part of the scrubber. It is the part that matches theh video length.
  const pinkAreaRef = useRef<HTMLDivElement>(null);
  const { relativeMousePos } = useRelativeMousePos(pinkAreaRef.current);

  const pinkAreaWidth = Math.ceil(
    scrubberLengthPerSecondPerZoom * videoLength * zoomFromIndex(zoomIndex),
  );
  const thumbProgress =
    scrubberLengthPerSecondPerZoom * videoTime * zoomFromIndex(zoomIndex);

  const timesStamps = Array.from(
    { length: Math.ceil(videoLength) },
    (_, i) => i,
  );

  const [isSeekSettled, setIsSeekSettled] = useState(true); // We initially are not seeking and so seek starts as settled.
  function handleSeek() {
    setIsSeekSettled(false);
    setLastSeekPosition(relativeMousePos.x); // We cache this to prevent the thumb from jumping to an old position while the seek is processing.
    let seekPoint = (relativeMousePos.x / pinkAreaWidth) * videoLength;
    seekPoint = clamp(seekPoint, 0, videoLength);
    seek(seekPoint);
  }

  // When we get an updated video time, it means the seek has settled.
  useEffect(() => {
    setIsSeekSettled(true);
  }, [videoTime]);

  // This handles the situation where the thumb is used to seek.
  const [isSeeking, setIsSeeking] = useState(false);
  const [lastSeekPosition, setLastSeekPosition] = useState(0);

  // This effect makes isSeeking a side effect that carries out seek actions.
  useEffect(() => {
    if (isSeeking) return;
    handleSeek(); // If we stopped seeking then we just finished a seek and we handle it.
  }, [isSeeking]);

  // This effect ensures that if mouse down was triggered by this scrubber, any mouse up anywhere finishes the seek.
  useEffect(() => {
    function handleGlobalMouseUp() {
      setIsSeeking(false);
    }
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [isSeeking]);

  return (
    <div className="w-full overflow-x-scroll pb-8 pt-4">
      {/**We have to add all the left + right padding leading down to the pink area to this width to give the pink area the correct width.*/}
      <div className="h-[221px]" style={{ width: `${pinkAreaWidth + 32}px` }}>
        <div className="relative h-[167px] w-full">
          <div className="absolute bottom-0 left-0 right-0 h-32 w-full pe-2 ps-2">
            <div className="h-full w-full rounded-lg bg-zinc-900 p-2">
              {/**This pink area is the length of the video. Its width should directly match the calculated width.*/}
              <div
                ref={pinkAreaRef}
                className="h-full w-full rounded-lg bg-fuchsia-300"
                onClick={handleSeek}
              ></div>
            </div>
          </div>
          <div
            className="absolute bottom-0 left-0 top-0 h-full w-8 cursor-pointer"
            draggable={false}
            style={{
              translate: `${isSeeking ? clamp(relativeMousePos.x, 0, pinkAreaWidth) : isSeekSettled ? thumbProgress : lastSeekPosition}px 0px`,
            }}
            onMouseDown={() => setIsSeeking(true)}
            onMouseUp={() => setIsSeeking(false)}
            onMouseMove={() => {
              if (isSeeking) handleSeek(); // We process seeks gradually while moving.
            }}
          >
            <Image
              src="/scrubber-thumb.svg"
              alt="scrubber thumb"
              width={32}
              height={167}
              draggable={false}
            />
          </div>
        </div>
        <div className="flex w-full flex-row overflow-x-hidden pe-2 ps-2">
          {timesStamps.map((i) => (
            <TimeStamp key={i} seconds={i} zoom={zoomFromIndex(zoomIndex)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// A single timestamp graduation.
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
        className={`absolute flex h-full w-full flex-row items-center justify-center ${width > 80 ? "text-sm" : "text-xs"} font-semibold text-zinc-500`}
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

function ScrubberLoader() {
  return (
    <div className="flex h-[221px] flex-col items-center justify-center gap-12 rounded-2xl border bg-white p-8 text-zinc-500 shadow">
      <span>Loading Scrubber</span>
      <Image
        src="/spinner.svg"
        alt={"loading scrubber"}
        width={32}
        height={32}
      />
    </div>
  );
}
