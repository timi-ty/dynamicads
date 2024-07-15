"use client";

import { createContext, ReactNode, useState } from "react";
import { useVideoControls, VideoControls } from "../_hooks/useVideoControls";

interface VideoConsumer {
  setVideo: (video: HTMLVideoElement | null) => void;
  controls: VideoControls;
}

export function VideoContextProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const videoControls = useVideoControls(video);
  return (
    <VideoContext.Provider
      value={{ setVideo: setVideo, controls: videoControls }}
    >
      {children}
    </VideoContext.Provider>
  );
}

const defaultConsumer: VideoConsumer = {
  setVideo: function (video: HTMLVideoElement | null): void {
    throw new Error("Function not implemented.");
  },
  controls: {
    isPaused: false,
    videoTime: 0,
    videoLength: 0,
    togglePlay: function (): void {
      throw new Error("Function not implemented.");
    },
    plusSeconds: function (seconds: number): void {
      throw new Error("Function not implemented.");
    },
    minusSeconds: function (seconds: number): void {
      throw new Error("Function not implemented.");
    },
    isRewinding: false,
    isFastforwarding: false,
    toggleRewind: function (): void {
      throw new Error("Function not implemented.");
    },
    toggleFastforward: function (): void {
      throw new Error("Function not implemented.");
    },
    jumpToStart: function (): void {
      throw new Error("Function not implemented.");
    },
    jumpToEnd: function (): void {
      throw new Error("Function not implemented.");
    },
    seek: function (seconds: number): void {
      throw new Error("Function not implemented.");
    },
    isBuffering: false,
    isReady: false,
  },
};
const VideoContext = createContext(defaultConsumer);

export default VideoContext;
