import { useEffect, useRef, useState } from "react";
import { clamp } from "~/utils/math";

// This entire hook has to handle the case where the video element is not yet mounted and the controls do nothing.
// A null check is performed before any operation.
export function useVideoControls(
  video: HTMLVideoElement | null,
): VideoControls {
  // These are data points only. Setting isPaused to true does not pause the video, but isPaused becomes true when the video is paused.
  const [isPaused, setIsPaused] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [videoLength, setVideoLength] = useState(0);
  const [videoTime, setVideoTime] = useState(0);

  // These are data with actions (side effects). They do what the say.
  const [isRewinding, setIsRewinding] = useState(false);
  const [isFastforwarding, setIsFastforwarding] = useState(false);

  // These are handles for window.setInterval() calls.
  const rewindHandle = useRef<number | null>(null);
  const fastforwardHandle = useRef<number | null>(null);

  useEffect(() => {
    if (!video) return;

    // This local const allows the callbacks to create valid closures on the video element reference.
    // Even if the video changes, the effect can be cleaned up on the correct (old) video.
    const currentVideo = video;

    function handlePlay() {
      setIsPaused(false);
    }
    function handlePause() {
      setIsPaused(true);
    }
    function handleDurationChange() {
      setVideoLength(currentVideo.duration);
    }
    function handleTimeUpdate() {
      setVideoTime(currentVideo.currentTime);
      setIsBuffering(false);
    }
    function handleWaiting() {
      currentVideo.play(); // Only a currently playing video is considered as buffering.
      setIsBuffering(true);
    }
    // Immediately call these two in case they are set before the effect runs.
    setVideoLength(currentVideo.duration);
    setVideoTime(currentVideo.currentTime);
    currentVideo.addEventListener("play", handlePlay);
    currentVideo.addEventListener("pause", handlePause);
    currentVideo.addEventListener("ended", handlePause);
    currentVideo.addEventListener("durationchange", handleDurationChange);
    currentVideo.addEventListener("timeupdate", handleTimeUpdate);
    currentVideo.addEventListener("waiting", handleWaiting);
    return () => {
      currentVideo.removeEventListener("play", handlePlay);
      currentVideo.removeEventListener("pause", handlePause);
      currentVideo.removeEventListener("ended", handlePause);
      currentVideo.removeEventListener("durationchange", handleDurationChange);
      currentVideo.removeEventListener("timeupdate", handleTimeUpdate);
      currentVideo.removeEventListener("waiting", handleWaiting);
    };
  }, [video]);

  // Effect to handle rewinding.
  useEffect(() => {
    if (!video) return;
    if (!isRewinding) {
      if (rewindHandle.current) window.clearInterval(rewindHandle.current);
      return;
    }

    video.pause(); // Always pause before rewinding.
    setIsFastforwarding(false); // Cannot fastforward and rewind at the same time.
    if (rewindHandle.current) window.clearInterval(rewindHandle.current);
    // Kind of x2 rewind. Not really because the rate of setInterval calls is not guaranteed.
    // This is not a very good implentation but negative playback rate is not supported.
    rewindHandle.current = window.setInterval(() => {
      video.currentTime -= 1.0;
    }, 500);

    return () => {
      if (rewindHandle.current) window.clearInterval(rewindHandle.current);
    };
  }, [isRewinding, video]);

  // Effect to handle fastforwarding.
  useEffect(() => {
    if (!video) return;
    if (!isFastforwarding) {
      if (fastforwardHandle.current)
        window.clearInterval(fastforwardHandle.current);
      return;
    }

    video.pause(); // Always pause before fastforwarding.
    setIsRewinding(false); // Cannot rewind and fastforward at the same time.
    if (fastforwardHandle.current)
      window.clearInterval(fastforwardHandle.current);
    // Kind of x2 fastforward. Not really because the rate of setInterval calls is not guaranteed.
    // This is not a very good implentation but negative playback rate is not supported.
    fastforwardHandle.current = window.setInterval(() => {
      video.currentTime += 1.0;
    }, 500);

    return () => {
      if (fastforwardHandle.current)
        window.clearInterval(fastforwardHandle.current);
    };
  }, [isFastforwarding, video]);

  function togglePlay() {
    if (!video) return;

    if (video.paused || video.ended) {
      setIsRewinding(false); // Every time video plays or pauses, cancel seeking.
      setIsFastforwarding(false);
      video.play();
    } else {
      setIsFastforwarding(false); // Every time video plays or pauses, cancel seeking.
      setIsFastforwarding(false);
      video.pause();
    }
  }

  function plusSeconds(s: number) {
    if (!video) return;

    video.currentTime += s;
  }

  function minusSeconds(s: number) {
    if (!video) return;

    video.currentTime -= s;
  }

  function toggleRewind() {
    if (!video) return;

    setIsRewinding((r) => !r);
  }

  function toggleFastforward() {
    if (!video) return;

    setIsFastforwarding((f) => !f);
  }

  function jumpToStart() {
    if (!video) return;

    video.pause();
    video.currentTime = 0;
  }

  function jumpToEnd() {
    if (!video) return;

    video.pause();
    video.currentTime = video.duration;
  }

  function seek(time: number) {
    if (!video) return;

    const seekTime = clamp(time, 0, video.duration);

    video.pause();
    video.currentTime = seekTime;
  }

  return {
    isPaused,
    isBuffering,
    isReady: videoLength > 0,
    videoTime,
    videoLength,
    togglePlay,
    plusSeconds,
    minusSeconds,
    isRewinding,
    isFastforwarding,
    toggleRewind,
    toggleFastforward,
    jumpToStart,
    jumpToEnd,
    seek,
  };
}

export type VideoControls = {
  isPaused: boolean;
  isBuffering: boolean;
  isReady: boolean;
  videoTime: number;
  videoLength: number;
  togglePlay: () => void;
  plusSeconds: (seconds: number) => void;
  minusSeconds: (seconds: number) => void;
  isRewinding: boolean;
  isFastforwarding: boolean;
  toggleRewind: () => void;
  toggleFastforward: () => void;
  jumpToStart: () => void;
  jumpToEnd: () => void;
  seek: (seconds: number) => void;
};
