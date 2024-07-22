import Image from "next/image";
import { useContext, useState, useEffect } from "react";
import EpisodeVideoContext from "../_context/EpisodeVideoContext";
import { clamp } from "~/utils/math";
import {
  addWindowMouchMoveListener,
  addWindowMouchUpListener,
} from "~/utils/events";

export default function ScrubberThumb({
  scrubberWidth,
  handleSeek,
}: Readonly<{
  scrubberWidth: number;
  handleSeek: (clientMousePosX: number) => void;
}>) {
  const { controls } = useContext(EpisodeVideoContext);
  const { videoLength, addSmoothTimeUpdateListener } = controls;

  const [isSeeking, setIsSeeking] = useState(false);
  const [thumbProgress, setThumbProgress] = useState(0);

  useEffect(() => {
    const smoothTimeUpdateListener = addSmoothTimeUpdateListener(
      (smoothVideoTime) => {
        const clampedVideoTime = clamp(smoothVideoTime, 0, videoLength);
        setThumbProgress((clampedVideoTime / videoLength) * scrubberWidth); // Set the screen position of the thumb.
      },
    );
    return () => smoothTimeUpdateListener.remove();
  }, [
    setThumbProgress,
    addSmoothTimeUpdateListener,
    scrubberWidth,
    videoLength,
  ]);

  // This effect attached window level listeners that take over once a seek begins.
  useEffect(() => {
    if (!isSeeking) return; // Listeners are not needed if not seeking.

    function handleGlobalMouchUp() {
      setIsSeeking(false);
    }
    function handleGlobalMouchMove(
      mouseEvent?: MouseEvent,
      touchEvent?: TouchEvent,
    ) {
      let clientX = 0;
      if (mouseEvent) {
        clientX = mouseEvent.clientX;
      } else if (touchEvent?.touches[0]) {
        clientX = touchEvent.touches[0].clientX;
      }

      if (isSeeking) handleSeek(clientX);
    }
    const mouchUpListener = addWindowMouchUpListener(handleGlobalMouchUp, true);
    const mouchMoveListener = addWindowMouchMoveListener(
      handleGlobalMouchMove,
      true,
    );
    return () => {
      mouchUpListener.remove();
      mouchMoveListener.remove();
    };
  }, [isSeeking, handleSeek]);

  return (
    <div
      className="absolute bottom-0 left-0 top-0 h-full w-8 cursor-pointer select-none"
      draggable={false}
      style={{
        translate: `${thumbProgress}px 0px`,
      }}
      onMouseDown={(ev) => {
        setIsSeeking(true);
        handleSeek(ev.clientX);
      }}
      onTouchStart={(ev) => {
        if (ev.touches[0]) {
          setIsSeeking(true);
          handleSeek(ev.touches[0].clientX);
        }
      }}
    >
      <Image
        src="/scrubber-thumb.svg"
        alt="scrubber thumb"
        width={32}
        height={167}
        draggable={false}
      />
    </div>
  );
}
