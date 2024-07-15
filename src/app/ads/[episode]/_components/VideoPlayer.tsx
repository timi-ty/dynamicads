"use client";

import Image from "next/image";
import { useContext, useEffect, useRef } from "react";
import VideoContext from "../_context/VideoContext";
import { VideoControls } from "../_hooks/useVideoControls";

export default function VideoPlayer({
  className,
  videoUrl,
}: Readonly<{ className?: string; videoUrl: string }>) {
  const videoContext = useContext(VideoContext);
  const videoRef = useRef<HTMLVideoElement>(null);

  // This effect sets the video for the current context tree.
  useEffect(() => {
    if (videoRef.current) {
      videoContext.setVideo(videoRef.current);
    }
  }, [videoRef.current]);

  return (
    <div className={className}>
      <div className="flex h-[552px] w-[788px] flex-col justify-between rounded-2xl border bg-white p-8 shadow">
        <div className="relative w-full">
          <video
            ref={videoRef}
            src={videoUrl}
            className="h-[408px] w-full rounded-lg bg-zinc-900"
          />
          {videoContext.controls.isBuffering && <VideoBuffererView />}
        </div>
        <VideoControlsView
          controls={videoContext.controls}
          disabled={!videoContext.controls.isReady}
        />
      </div>
    </div>
  );
}

function VideoControlsView({
  className,
  controls,
  disabled,
}: Readonly<{
  className?: string;
  controls: VideoControls;
  disabled?: boolean;
}>) {
  const {
    isPaused,
    togglePlay,
    plusSeconds,
    minusSeconds,
    toggleRewind,
    toggleFastforward,
    jumpToStart,
    jumpToEnd,
    isRewinding,
    isFastforwarding,
  } = controls;

  return (
    <div className={className}>
      <div
        className={`flex h-16 flex-row items-center justify-between rounded-2xl border bg-white p-4 text-sm font-semibold text-zinc-500 shadow ${disabled ? "pointer-events-none opacity-30" : ""}`}
      >
        <button
          className="group flex flex-row items-center gap-2 rounded-xl p-2 active:text-zinc-900"
          onClick={jumpToStart}
          type="button"
        >
          <Image
            src="/ic_arrow-line-left.svg"
            alt="jump to start"
            width={32}
            height={32}
            className="rounded-full border p-2 group-active:bg-zinc-100"
          />
          <span>Jump to start</span>
        </button>
        <span className="flex flex-row items-center gap-8">
          <button
            className="group flex flex-row items-center gap-2 active:text-zinc-900"
            onClick={() => minusSeconds(10)}
          >
            <Image
              src="/ic_anticlockwise.svg"
              alt="-10s"
              width={20}
              height={20}
              className="rounded-full group-active:bg-zinc-100"
            />
            <span>10s</span>
          </button>
          <button
            onClick={toggleRewind}
            className={`${isRewinding ? "bg-zinc-100 shadow" : ""} rounded-full p-2`}
          >
            <Image src="/ic_rewind.svg" alt="rewind" width={20} height={20} />
          </button>
          <button onClick={togglePlay}>
            <Image
              src={isPaused ? "/ic_play.svg" : "/ic_pause.svg"}
              alt={isPaused ? "play" : "pause"}
              width={32}
              height={32}
            />
          </button>
          <button
            onClick={toggleFastforward}
            className={`${isFastforwarding ? "bg-zinc-100 shadow" : ""} rounded-full p-2`}
          >
            <Image
              src="/ic_fastforward.svg"
              alt="fastforward"
              width={20}
              height={20}
            />
          </button>
          <button
            className="group flex flex-row items-center gap-2 active:text-zinc-900"
            onClick={() => plusSeconds(10)}
          >
            <span>10s</span>
            <Image
              src="/ic_clockwise.svg"
              alt="+10s"
              width={20}
              height={20}
              className="rounded-full group-active:bg-zinc-100"
            />
          </button>
        </span>
        <button
          className="group flex flex-row items-center gap-2 rounded-xl p-2 active:text-zinc-900"
          onClick={jumpToEnd}
          type="button"
        >
          <span>Jump to end</span>
          <Image
            src="/ic_arrow-line-right.svg"
            alt="jump to start"
            width={32}
            height={32}
            className="rounded-full border p-2 group-active:bg-zinc-100"
          />
        </button>
      </div>
    </div>
  );
}

function VideoBuffererView() {
  return (
    <div className="absolute bottom-0 left-0 right-0 top-0 flex w-full flex-row items-center justify-center rounded-lg bg-black bg-opacity-20">
      <Image
        src="/spinner_dots.svg"
        alt="buffering video"
        width={48}
        height={48}
        className="relative opacity-80"
      />
    </div>
  );
}
