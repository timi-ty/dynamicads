import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useState, useEffect, useRef } from "react";

// This hook operates at a global scope.
// Any consumer of this hook controls the singular video element in this app.
// If this app was more complex, it would be wise to have an instance pool where different consumers can refer to different video elements to control.
// This could also be designed using React Context, but the atomic hook approach is preferred here.
// Controls override each other based on who acted last. The last consumer to trigger a control is always authoritative.

const videoAtom = atom<HTMLVideoElement | null>(null);
const isPausedAtom = atom(true);
const isRewindingAtom = atom(false);
const isFastforwardingAtom = atom(false);
const rewindHandleAtom = atom(0);
const fastforwardHandleAtom = atom(0);
export const videoLengthAtom = atom(0);
export const videoTimeAtom = atom(0);

// This entire hook has to handle the case where the video element is not yet mounted and the controls do nothing.
// A null check is performed before any operation.
export function useVideoControls() {
  const video = useAtomValue(videoAtom);

  // These are data points only. Setting isPaused to true does not pause the video, but isPaused becomes true when the video is paused.
  const [isPaused, setIsPaused] = useAtom(isPausedAtom);
  const [videoLength, setVideoLength] = useAtom(videoLengthAtom);
  const [videoTime, setVideoTime] = useAtom(videoTimeAtom);

  // These are data with actions (side effects). They do what the say.
  const [isRewinding, setIsRewinding] = useAtom(isRewindingAtom);
  const [isFastforwarding, setIsFastforwarding] = useAtom(isFastforwardingAtom);

  // These are handles for window.setInterval() calls.
  const [rewindHandle, setRewindHandle] = useAtom(rewindHandleAtom);
  const [fastforwardHandle, setFastforwardHandle] = useAtom(
    fastforwardHandleAtom,
  );

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
    }
    currentVideo.addEventListener("play", handlePlay);
    currentVideo.addEventListener("pause", handlePause);
    currentVideo.addEventListener("ended", handlePause);
    currentVideo.addEventListener("durationchange", handleDurationChange);
    currentVideo.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      currentVideo.removeEventListener("play", handlePlay);
      currentVideo.removeEventListener("pause", handlePause);
      currentVideo.removeEventListener("ended", handlePause);
      currentVideo.removeEventListener("durationchange", handleDurationChange);
      currentVideo.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [video]);

  // Effect to handle rewinding.
  useEffect(() => {
    if (!video) return;
    if (!isRewinding) {
      window.clearInterval(rewindHandle);
      return;
    }

    video.pause(); // Always pause before rewinding.
    setIsFastforwarding(false); // Cannot fastforward and rewind at the same time.
    // Kind of x2 rewind. Not really because the rate of setInterval calls is not guaranteed.
    const handle = window.setInterval(() => {
      video.currentTime -= 0.5;
    }, 250);
    setRewindHandle(handle);

    return () => {
      window.clearInterval(rewindHandle);
    };
  }, [isRewinding, video]);

  // Effect to handle fastforwarding.
  useEffect(() => {
    if (!video) return;
    if (!isFastforwarding) {
      window.clearInterval(fastforwardHandle);
      return;
    }

    video.pause(); // Always pause before fastforwarding.
    setIsRewinding(false); // Cannot rewind and fastforward at the same time.
    // Kind of x2 fastforward. Not really because the rate of setInterval calls is not guaranteed.
    const handle = window.setInterval(() => {
      video.currentTime += 0.5;
    }, 250);
    setFastforwardHandle(handle);

    return () => {
      window.clearInterval(fastforwardHandle);
    };
  }, [isFastforwarding, video]);

  function togglePlay() {
    if (!video) return;

    if (video.paused || video.ended) {
      video.play();
      setIsRewinding(false); // Every time video plays or pauses, cancel seeking.
      setIsFastforwarding(false);
    } else {
      video.pause();
      setIsFastforwarding(false); // Every time video plays or pauses, cancel seeking.
      setIsFastforwarding(false);
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

  return {
    isPaused,
    togglePlay,
    plusSeconds,
    minusSeconds,
    isRewinding,
    isFastforwarding,
    toggleRewind,
    toggleFastforward,
    jumpToStart,
    jumpToEnd,
  };
}

export function useThisVideoControls(video: HTMLVideoElement) {
  const setVideo = useSetAtom(videoAtom);
  setVideo(video);
  return useVideoControls();
}
