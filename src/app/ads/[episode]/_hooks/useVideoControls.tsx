import { useEffect, useMemo, useRef, useState } from "react";
import useAnimationManager from "~/app/_hooks/useAnimationManager";
import useListenerGroup, { type Listener } from "~/app/_hooks/useListenerGroup";
import { clamp } from "~/utils/math";

const rewindRate = 3;
const fastforwardRate = 3; // These can be converted to variables to have changing rewind/fastforward rates at runtime.

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

  const smoothVideoTime = useRef(0);
  const { startAnimation } = useAnimationManager();
  const {
    addListener: addVideoTimeListener,
    callListeners: callVideoTimeListeners,
  } = useListenerGroup();

  // These are data with actions (side effects). They do what the say.
  const [isRewinding, setIsRewinding] = useState(false);
  const [isFastforwarding, setIsFastforwarding] = useState(false);

  useEffect(() => {
    if (!video) return;

    // This local const allows the callbacks to create valid closures on the video element reference.
    // Even if the video changes, the effect can be cleaned up on the correct (old) video.
    const currentVideo = video;

    function updateSmoothVideoTime() {
      smoothVideoTime.current = currentVideo.currentTime;
      callVideoTimeListeners();
    }
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
      void currentVideo.play(); // Only a currently playing video is considered as buffering.
      setIsBuffering(true);
    }
    // Immediately call these two in case they are set before the effect runs.
    setVideoLength(currentVideo.duration);
    setVideoTime(currentVideo.currentTime);

    const smoothVideoTimeAnimation = startAnimation(updateSmoothVideoTime);
    currentVideo.addEventListener("play", handlePlay);
    currentVideo.addEventListener("pause", handlePause);
    currentVideo.addEventListener("ended", handlePause);
    currentVideo.addEventListener("durationchange", handleDurationChange);
    currentVideo.addEventListener("timeupdate", handleTimeUpdate);
    currentVideo.addEventListener("waiting", handleWaiting);
    return () => {
      smoothVideoTimeAnimation.stop();
      currentVideo.removeEventListener("play", handlePlay);
      currentVideo.removeEventListener("pause", handlePause);
      currentVideo.removeEventListener("ended", handlePause);
      currentVideo.removeEventListener("durationchange", handleDurationChange);
      currentVideo.removeEventListener("timeupdate", handleTimeUpdate);
      currentVideo.removeEventListener("waiting", handleWaiting);
    };
  }, [video, startAnimation, callVideoTimeListeners]);

  // Effect to handle rewinding.
  useEffect(() => {
    if (!video || !isRewinding) return;
    const currentVideo = video;

    setIsFastforwarding(false); // Cannot fastforward and rewind at the same time.
    function updateRewind(deltaTime: number) {
      currentVideo.currentTime -= deltaTime * rewindRate;
    }
    const rewindAnimation = startAnimation(updateRewind);
    return () => rewindAnimation.stop();
  }, [isRewinding, video]);

  // Effect to handle fastforwarding.
  useEffect(() => {
    if (!video || !isFastforwarding) return;
    const currentVideo = video;

    setIsRewinding(false); // Cannot rewind and fastforward at the same time.
    function updateFastforward(deltaTime: number) {
      currentVideo.currentTime += deltaTime * fastforwardRate;
    }
    const fastforwardAnimation = startAnimation(updateFastforward);
    return () => fastforwardAnimation.stop();
  }, [isFastforwarding, video]);

  const controls = useMemo(() => {
    function togglePlay() {
      if (!video) return;

      if (video.paused || video.ended) {
        setIsRewinding(false); // Every time video plays or pauses, cancel seeking.
        setIsFastforwarding(false);
        void video.play();
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

    // Components that set state in their smooth time update listener will rerender a lot - at the screen refresh rate.
    // Doing animations through react rerenders is not the best for performance, but results in cleaner code.
    function addSmoothTimeUpdateListener(
      onTimeUpdate: (videoTime: number) => void,
    ) {
      return addVideoTimeListener(() => onTimeUpdate(video?.currentTime ?? 0));
    }

    return {
      isPaused,
      isBuffering,
      isReady: videoLength > 0,
      isRewinding,
      isFastforwarding,
      videoTime,
      videoLength,
      togglePlay,
      plusSeconds,
      minusSeconds,
      toggleRewind,
      toggleFastforward,
      jumpToStart,
      jumpToEnd,
      seek,
      addSmoothTimeUpdateListener,
    };
  }, [
    isPaused,
    isBuffering,
    videoLength,
    isRewinding,
    isFastforwarding,
    videoTime,
    video,
    setIsRewinding,
    setIsFastforwarding,
    addVideoTimeListener,
  ]);

  return controls;
}

export type VideoControls = {
  isPaused: boolean;
  isBuffering: boolean;
  isReady: boolean;
  isRewinding: boolean;
  isFastforwarding: boolean;
  videoTime: number;
  videoLength: number;
  togglePlay: () => void;
  plusSeconds: (seconds: number) => void;
  minusSeconds: (seconds: number) => void;
  toggleRewind: () => void;
  toggleFastforward: () => void;
  jumpToStart: () => void;
  jumpToEnd: () => void;
  seek: (seconds: number) => void;
  addSmoothTimeUpdateListener: (
    onTimeUpdate: (videoTime: number) => void,
  ) => Listener;
};
