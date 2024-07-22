import { useContext, useRef, useMemo, useCallback } from "react";
import { clamp, windowToConatainerPoint } from "~/utils/math";
import EpisodeVideoContext from "../_context/EpisodeVideoContext";
import Image from "next/image";
import { millisecondsToHHMMSS } from "~/utils/format";
import { api } from "~/trpc/react";
import ScrubberThumb from "./ScrubberThumb";
import { AdMarkerType } from "~/utils/types";
import AdMarkerHandle from "./AdMarkerHandle";

const defaultPickAreaWidth = 1134; //cherry picked px value.

export default function Scrubber({ zoom }: Readonly<{ zoom: number }>) {
  const { controls: videoControls } = useContext(EpisodeVideoContext);

  // The pink area is the important part of the scrubber. It is the part that matches the video length.
  const pinkAreaRef = useRef<HTMLDivElement>(null);
  const pinkAreaWidth = useMemo(() => defaultPickAreaWidth * zoom, [zoom]);

  const getRelativePos = useCallback((clientMousePosX: number) => {
    if (!pinkAreaRef.current) return { x: 0, y: 0 };
    return windowToConatainerPoint(pinkAreaRef.current, {
      x: clientMousePosX,
      y: 0,
    });
  }, []);

  const handleSeek = useCallback(
    (clientMousePosX: number) => {
      const relativeMousePos = getRelativePos(clientMousePosX);
      const clampedSeekPos = clamp(relativeMousePos.x, 0, pinkAreaWidth);
      let seekPoint =
        (clampedSeekPos / pinkAreaWidth) * videoControls.videoLength;
      seekPoint = clamp(seekPoint, 0, videoControls.videoLength); // Another clamp just for safety.
      videoControls.seek(seekPoint);
    },
    [pinkAreaWidth, videoControls],
  );

  return (
    <div className="w-full overflow-x-scroll pb-8 pt-4">
      {/**We have to add all the left + right padding leading down to the pink area to this width to give the pink area the correct width.*/}
      <div className="h-[221px]" style={{ width: `${pinkAreaWidth + 32}px` }}>
        <div className="relative h-[167px] w-full">
          <div className="absolute bottom-0 left-0 right-0 h-32 w-full pe-2 ps-2">
            <div className="relative h-full w-full rounded-lg bg-zinc-900 p-2">
              {/**This pink area is the length of the video. Its width should directly match the calculated width.*/}
              <div
                ref={pinkAreaRef}
                className="h-full w-full rounded-lg bg-fuchsia-300"
                onClick={(ev) => handleSeek(ev.clientX)}
              ></div>
              <ScrubberDecoration
                className="pointer-events-none absolute bottom-4 left-2 right-2 top-2"
                width={pinkAreaWidth}
              />
              <AdMarkerOverlay
                className="pointer-events-none absolute bottom-1 left-2 right-2 top-1"
                scrubberWidth={pinkAreaWidth}
                getRelativePos={getRelativePos}
              />
            </div>
          </div>
          <ScrubberThumb
            scrubberWidth={pinkAreaWidth}
            handleSeek={handleSeek}
          />
        </div>
        <TimeStampSequence
          videoLength={videoControls.videoLength}
          scrubberWidth={pinkAreaWidth}
          zoom={zoom}
        />
      </div>
    </div>
  );
}

function TimeStampSequence({
  videoLength,
  scrubberWidth,
  zoom,
}: Readonly<{ videoLength: number; scrubberWidth: number; zoom: number }>) {
  const timeStamps = Array.from({ length: Math.ceil(zoom * 10) }, (_, i) => i); // 10 timeStamps for the default zoom of 1.
  return (
    <div className="flex w-full flex-row overflow-x-hidden pe-2 ps-2">
      {timeStamps.map((i) => (
        <TimeStamp
          key={i}
          width={scrubberWidth / timeStamps.length}
          seconds={((i + 1) * videoLength) / timeStamps.length}
        />
      ))}
    </div>
  );
}

// A single timestamp graduation.
function TimeStamp({
  width,
  seconds,
}: Readonly<{ width: number; seconds: number }>) {
  const arrayOfTen = Array.from({ length: 10 }, (_, i) => i);
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

export function ScrubberLoader() {
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

function AdMarkerOverlay({
  className,
  scrubberWidth,
  getRelativePos,
}: Readonly<{
  scrubberWidth: number;
  className?: string;
  getRelativePos: (clientMousePosX: number) => { x: number; y: number };
}>) {
  const { controls, episode } = useContext(EpisodeVideoContext);
  const { data } = api.marker.getAll.useQuery({ episodeId: episode.id });

  return (
    <div className={className}>
      {data?.markers?.map((marker) => {
        return (
          <AdMarkerHandle
            key={marker.id}
            id={marker.id}
            type={marker.type as AdMarkerType}
            value={marker.value}
            scrubberWidth={scrubberWidth}
            videoLength={controls.videoLength}
            getRelativePos={getRelativePos}
          />
        );
      })}
    </div>
  );
}

// This should use audio data from the video, but is just a randomly generated decoration for now.
function ScrubberDecoration({
  width,
  className,
}: Readonly<{ width: number; className?: string }>) {
  const stickCount = Math.floor(width * 0.125) - 2; // This gives us a stick every 8px;
  const decorativeSticks = useMemo(
    () => Array.from({ length: stickCount }, () => Math.random()),
    [stickCount],
  );

  return (
    <div className={className}>
      <div className="flex h-full flex-row items-end justify-around">
        {decorativeSticks.map((stickHeight, i) => {
          return (
            <div
              key={i}
              className="w-[2px] rounded-[1px] bg-fuchsia-200"
              style={{ height: `${stickHeight * 50}%` }}
            ></div>
          );
        })}
      </div>
    </div>
  );
}
