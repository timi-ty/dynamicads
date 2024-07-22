"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useVideoControls,
  type VideoControls,
} from "../_hooks/useVideoControls";
import useGlobalActionStack from "~/app/_hooks/useGlobalActionStack";
import type { Listener } from "~/app/_hooks/useListenerGroup";

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
  getScrubberTime: () => number /* Scrubber time is updated much more frequently than video time. 
  The video context allows injection and consumption of an arbitrary scrubber time.*/;
  publishScrubberTime: (time: number) => void;
}

export function EpisodeVideoContextProvider({
  episode,
  children,
}: Readonly<{ episode: Episode; children: ReactNode }>) {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const scrubberTime = useRef(0);
  const videoControls = useVideoControls(video);
  const { invalidateActionStack } = useGlobalActionStack();

  const publishScrubberTime = useCallback(
    (time: number) => (scrubberTime.current = time),
    [],
  );

  useEffect(() => {
    invalidateActionStack(); // Instead of handling different action stacks per episode, start fresh every time a different episode is picked.
  }, [episode, invalidateActionStack]);

  return (
    <EpisodeVideoContext.Provider
      value={{
        setVideo: setVideo,
        controls: videoControls,
        episode: episode,
        getScrubberTime: () => scrubberTime.current,
        publishScrubberTime: publishScrubberTime,
      }}
    >
      {children}
    </EpisodeVideoContext.Provider>
  );
}

const defaultConsumer: EpisodeVideoConsumer = {
  setVideo: function (_: HTMLVideoElement | null): void {
    throw new Error("Function not implemented.");
  },
  controls: {
    isPaused: false,
    videoLength: 0,
    togglePlay: function (): void {
      throw new Error("Function not implemented.");
    },
    plusSeconds: function (_seconds: number): void {
      throw new Error("Function not implemented.");
    },
    minusSeconds: function (_seconds: number): void {
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
    seek: function (_time: number): void {
      throw new Error("Function not implemented.");
    },
    isBuffering: false,
    isReady: false,
    addSmoothTimeUpdateListener: function (
      _onTimeUpdate: (videoTime: number) => void,
    ): Listener {
      throw new Error("Function not implemented.");
    },
  },
  episode: {
    id: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: "",
    name: "",
    videoUrl: "",
  },
  getScrubberTime: () => 0,
  publishScrubberTime: function (_time: number): void {
    throw new Error("Function not implemented.");
  },
};

const EpisodeVideoContext = createContext(defaultConsumer);

export default EpisodeVideoContext;
