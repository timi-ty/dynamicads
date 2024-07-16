"use client";

import { createContext, ReactNode, useState } from "react";
import { useVideoControls, VideoControls } from "../_hooks/useVideoControls";

export interface Episode {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  name: string;
  videoUrl: string;
}

export interface EpisodeVideoConsumer {
  setVideo: (video: HTMLVideoElement | null) => void;
  controls: VideoControls;
  episode: Episode;
}

export function EpisodeVideoContextProvider({
  episode,
  children,
}: Readonly<{ episode: Episode; children: ReactNode }>) {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const videoControls = useVideoControls(video);
  return (
    <EpisodeVideoContext.Provider
      value={{ setVideo: setVideo, controls: videoControls, episode: episode }}
    >
      {children}
    </EpisodeVideoContext.Provider>
  );
}

const defaultConsumer: EpisodeVideoConsumer = {
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
  episode: {
    id: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: "",
    name: "",
    videoUrl: "",
  },
};

const EpisodeVideoContext = createContext(defaultConsumer);

export default EpisodeVideoContext;
