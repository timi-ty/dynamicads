"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import useVideoControls from "../_hooks/useVideoControls";

export default function VideoPlayer({
  className,
}: Readonly<{ className?: string }>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(
    videoRef.current !== null && videoRef.current !== undefined,
  );

  useEffect(() => {
    setHasVideo(videoRef.current !== null && videoRef.current !== undefined);
  }, [videoRef.current]);

  return (
    <div className={className}>
      <div className="flex h-[552px] w-[788px] flex-col justify-between rounded-2xl border bg-white p-8 shadow">
        <video
          ref={videoRef}
          src="https://utfs.io/f/795be0e4-7261-4526-89c5-b67a1059cb4b-nsv7qj.mp4"
          className="max-h-[408px] w-full rounded-lg bg-zinc-900"
        />
        {hasVideo && videoRef.current && (
          <VideoControls video={videoRef.current} />
        )}
      </div>
    </div>
  );
}

function VideoControls({
  className,
  video,
}: Readonly<{ className?: string; video: HTMLVideoElement }>) {
  const {
    isPaused,
    togglePlay,
    plusSeconds,
    minusSeconds,
    toggleRewind,
    toggleFastforward,
    jumpToStart,
    jumpToEnd,
  } = useVideoControls(video);

  return (
    <div className={className}>
      <div className="flex h-16 flex-row items-center justify-between rounded-2xl border bg-white p-4 text-sm font-semibold text-zinc-500 shadow">
        <span className="flex flex-row items-center gap-2">
          <Image
            src="/ic_arrow-line-left.svg"
            alt="jump to start"
            width={32}
            height={32}
            className="rounded-full border p-2"
            onClick={jumpToStart}
          />
          <span>Jump to start</span>
        </span>
        <span className="flex flex-row items-center gap-8">
          <span className="flex flex-row items-center gap-2">
            <Image
              src="/ic_anticlockwise.svg"
              alt="+10s"
              width={20}
              height={20}
              onClick={() => minusSeconds(10)}
            />
            <span>10s</span>
          </span>
          <Image
            src="/ic_rewind.svg"
            alt="rewind"
            width={20}
            height={20}
            onClick={toggleRewind}
          />
          <Image
            src={isPaused ? "/ic_play.svg" : "/ic_pause.svg"}
            alt={isPaused ? "play" : "pause"}
            width={32}
            height={32}
            onClick={togglePlay}
          />
          <Image
            src="/ic_fastforward.svg"
            alt="fastforward"
            width={20}
            height={20}
            onClick={toggleFastforward}
          />
          <span className="flex flex-row items-center gap-2">
            <Image
              src="/ic_clockwise.svg"
              alt="+10s"
              width={20}
              height={20}
              onClick={() => plusSeconds(10)}
            />
            <span>10s</span>
          </span>
        </span>
        <span className="flex flex-row items-center gap-2">
          <span>Jump to end</span>
          <Image
            src="/ic_arrow-line-right.svg"
            alt="jump to end"
            width={32}
            height={32}
            className="rounded-full border p-2"
            onClick={jumpToEnd}
          />
        </span>
      </div>
    </div>
  );
}
