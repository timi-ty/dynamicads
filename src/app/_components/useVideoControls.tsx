import { useState, useEffect, useRef } from "react";

export default function useVideoControls(video: HTMLVideoElement) {
  const [isPaused, setIsPaused] = useState(video.paused);
  const [isRewinding, setIsRewinding] = useState(false);
  const [isFastforwarding, setIsFastforwarding] = useState(false);
  const rewindHandle = useRef<number>();
  const fastforwardHandle = useRef<number>();

  useEffect(() => {
    video.addEventListener("play", () => {
      setIsPaused(false);
    });
    video.addEventListener("pause", () => {
      setIsPaused(true);
    });
    video.addEventListener("ended", () => {
      setIsPaused(true);
    });
    return () => {
      video.removeEventListener("play", () => {
        setIsPaused(false);
      });
      video.removeEventListener("pause", () => {
        setIsPaused(true);
      });
      video.removeEventListener("ended", () => {
        setIsPaused(true);
      });
    };
  }, [video]);

  useEffect(() => {
    if (!isRewinding) {
      window.clearInterval(rewindHandle.current);
      return;
    }
    video.pause(); //Always pause before seeking
    setIsFastforwarding(false); //We cannot fastforward and rewind at the same time
    rewindHandle.current = window.setInterval(() => {
      video.currentTime -= 0.5;
    }, 500);

    return () => {
      window.clearInterval(rewindHandle.current);
    };
  }, [isRewinding]);

  useEffect(() => {
    if (!isFastforwarding) {
      window.clearInterval(fastforwardHandle.current);
      return;
    }
    video.pause(); //Always pause before seeking
    setIsRewinding(false); //We cannot rewind and fastforward at the same time
    fastforwardHandle.current = window.setInterval(() => {
      video.currentTime += 0.5;
    }, 500);

    return () => {
      window.clearInterval(fastforwardHandle.current);
    };
  }, [isFastforwarding]);

  function togglePlay() {
    if (video.paused || video.ended) {
      video.play();
      setIsRewinding(false); //Every time we play or pause, cancel seeking
      setIsFastforwarding(false);
    } else {
      video.pause();
      setIsFastforwarding(false); //Every time we play or pause, cancel seeking
      setIsFastforwarding(false);
    }
  }

  function plusSeconds(s: number) {
    video.currentTime += s;
  }

  function minusSeconds(s: number) {
    video.currentTime -= s;
  }

  function toggleRewind() {
    setIsRewinding((r) => !r);
  }

  function toggleFastforward() {
    setIsFastforwarding((f) => !f);
  }

  function jumpToStart() {
    video.pause();
    video.currentTime = 0;
  }

  function jumpToEnd() {
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
