import { useContext, useRef, useState, useEffect, useMemo } from "react";
import { clamp } from "~/utils/math";
import EpisodeVideoContext from "../_context/EpisodeVideoContext";
import {
  useRelativeMousePos,
  windowToConatainerPoint,
} from "../_hooks/useMousePos";
import Image from "next/image";
import { millisecondsToHHMMSS } from "~/utils/format";
import { api } from "~/trpc/react";

const defaultPickAreaWidth = 1134; //cherry picked px value to fit the entire scrubber within the inspector.

export default function Scrubber({ zoom }: Readonly<{ zoom: number }>) {
  const { controls: videoControls, publishScrubberTime } =
    useContext(EpisodeVideoContext);
  const { videoLength, videoTime, seek } = videoControls;
  // The pink area is the important part of the scrubber. It is the part that matches theh video length.
  const pinkAreaRef = useRef<HTMLDivElement>(null);

  // This handles the situation where the thumb is used to seek.
  const [isSeeking, setIsSeeking] = useState(false);
  const [lastSeekPosition, setLastSeekPosition] = useState(0);
  const { relativeMousePos: pinkAreaMouseSeekingPos } = useRelativeMousePos(
    pinkAreaRef.current,
    isSeeking,
  );

  const pinkAreaWidth = defaultPickAreaWidth * zoom;
  const thumbProgress = (videoTime / videoLength) * pinkAreaWidth;

  const [isSeekSettled, setIsSeekSettled] = useState(true); // We initially are not seeking and so seek starts as settled.
  function handleSeek(clientMousePosX: number) {
    if (!pinkAreaRef.current) return;

    setIsSeekSettled(false);
    const relativeMousePos = windowToConatainerPoint(pinkAreaRef.current, {
      x: clientMousePosX,
      y: 0,
    });
    const clampedSeekPos = clamp(relativeMousePos.x, 0, pinkAreaWidth);
    setLastSeekPosition(clampedSeekPos); // We cache this to prevent the thumb from jumping to an old position while the seek is processing.
    let seekPoint = (clampedSeekPos / pinkAreaWidth) * videoLength;
    seekPoint = clamp(seekPoint, 0, videoLength); // Another clamp just for safety.
    publishScrubberTime(seekPoint); // Make the scrubber time available even before seek settles.
    seek(seekPoint);
  }

  // When we get an updated video time, it means the seek has settled.
  useEffect(() => {
    setIsSeekSettled(true);
    publishScrubberTime(videoTime); // Keep the scrubber time in sync with the video time when settled.
  }, [videoTime]);

  // This effect ensures that if mouse down was triggered by this scrubber, any mouse events anywhere are handled by the scrubber.
  const handleSeekRef = useRef(handleSeek); // Create a reference to handleSeek to escape the closure.
  const isSeekingRef = useRef(isSeeking); // Create a reference to isSeeking to escape the closure.
  // Escape the closures to avoid having to rerun this effect on every frame becuase handleSeek is redeclared every frame.
  // Attempting to useMemo or useCallback simply complicates the issue.
  // This approach permits attaching the window level callbacks only once.
  handleSeekRef.current = handleSeek; // Update this reference with the newest decalration of handleSeek.
  isSeekingRef.current = isSeeking; // Update this reference with the current isSeeking state.
  useEffect(() => {
    function handleGlobalMouseUp() {
      setIsSeeking(false);
    }
    function handleGlobalMouseMove(ev: MouseEvent) {
      if (isSeekingRef.current) handleSeekRef.current(ev.clientX);
    }
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, []);

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
                width={pinkAreaWidth}
              />
            </div>
          </div>
          {/**This is the scrubber thumb. It triggers isSeeking onMouseDown */}
          <div
            className="absolute bottom-0 left-0 top-0 h-full w-8 cursor-pointer"
            draggable={false}
            style={{
              translate: `${isSeeking ? clamp(pinkAreaMouseSeekingPos.x, 0, pinkAreaWidth) : isSeekSettled ? thumbProgress : lastSeekPosition}px 0px`,
            }}
            onMouseDown={() => setIsSeeking(true)}
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
        <TimeStampSequence
          videoLength={videoLength}
          pinkAreaWidth={pinkAreaWidth}
          zoom={zoom}
        />
      </div>
    </div>
  );
}

function TimeStampSequence({
  videoLength,
  pinkAreaWidth,
  zoom,
}: Readonly<{ videoLength: number; pinkAreaWidth: number; zoom: number }>) {
  const timeStamps = Array.from({ length: Math.ceil(zoom * 10) }, (_, i) => i); // 10 timeStamps for the default zoom of 1.
  return (
    <div className="flex w-full flex-row overflow-x-hidden pe-2 ps-2">
      {timeStamps.map((i) => (
        <TimeStamp
          width={pinkAreaWidth / timeStamps.length}
          seconds={(i * videoLength) / timeStamps.length}
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
  width,
  className,
}: Readonly<{ width: number; className?: string }>) {
  const { controls, episode } = useContext(EpisodeVideoContext);
  const { data } = api.marker.getAll.useQuery({ episodeId: episode.id });

  return (
    <div className={className}>
      {data &&
        !data.error &&
        data.markers &&
        data.markers.map((marker) => {
          // Calaculates the marker left offset, converts marker.value to from millis to seconds.
          const markerLeft =
            ((marker.value * 0.001) / controls.videoLength) * width;
          return (
            <div
              key={marker.id}
              style={{ left: `${markerLeft}px` }}
              className={`absolute flex h-full w-[42px] flex-col items-center justify-between rounded-md border-2 border-zinc-900 pb-2 pt-2 ${marker.type === "Static" ? "bg-blue-300 stroke-blue-800 text-blue-800" : marker.type === "A/B" ? "bg-orange-300 stroke-orange-800 text-orange-800" : "bg-green-300 stroke-green-800 text-green-800"}`}
            >
              <div
                className={`flex max-h-[14px] flex-row items-center justify-center rounded border p-1 text-center text-[10px] ${
                  marker.type === "Static"
                    ? "border-blue-800"
                    : marker.type === "A/B"
                      ? "border-orange-800"
                      : "border-green-800"
                }`}
              >
                <span>
                  {marker.type === "Static"
                    ? "S"
                    : marker.type === "A/B"
                      ? "A/B"
                      : "A"}
                </span>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.99992 8.66665C6.36811 8.66665 6.66659 8.36817 6.66659 7.99998C6.66659 7.63179 6.36811 7.33331 5.99992 7.33331C5.63173 7.33331 5.33325 7.63179 5.33325 7.99998C5.33325 8.36817 5.63173 8.66665 5.99992 8.66665Z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.99992 4.00002C6.36811 4.00002 6.66659 3.70154 6.66659 3.33335C6.66659 2.96516 6.36811 2.66669 5.99992 2.66669C5.63173 2.66669 5.33325 2.96516 5.33325 3.33335C5.33325 3.70154 5.63173 4.00002 5.99992 4.00002Z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.99992 13.3333C6.36811 13.3333 6.66659 13.0349 6.66659 12.6667C6.66659 12.2985 6.36811 12 5.99992 12C5.63173 12 5.33325 12.2985 5.33325 12.6667C5.33325 13.0349 5.63173 13.3333 5.99992 13.3333Z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.99992 8.66665C10.3681 8.66665 10.6666 8.36817 10.6666 7.99998C10.6666 7.63179 10.3681 7.33331 9.99992 7.33331C9.63173 7.33331 9.33325 7.63179 9.33325 7.99998C9.33325 8.36817 9.63173 8.66665 9.99992 8.66665Z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.99992 4.00002C10.3681 4.00002 10.6666 3.70154 10.6666 3.33335C10.6666 2.96516 10.3681 2.66669 9.99992 2.66669C9.63173 2.66669 9.33325 2.96516 9.33325 3.33335C9.33325 3.70154 9.63173 4.00002 9.99992 4.00002Z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.99992 13.3333C10.3681 13.3333 10.6666 13.0349 10.6666 12.6667C10.6666 12.2985 10.3681 12 9.99992 12C9.63173 12 9.33325 12.2985 9.33325 12.6667C9.33325 13.0349 9.63173 13.3333 9.99992 13.3333Z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
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
    () => Array.from({ length: stickCount }, (_, i) => Math.random()),
    [width],
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
