import Image from "next/image";
import { useContext, useState, useEffect, useRef } from "react";
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
  const { controls, publishScrubberTime } = useContext(EpisodeVideoContext);
  const { videoLength, addSmoothTimeUpdateListener } = controls;

  const [isSeeking, setIsSeeking] = useState(false);
  const [thumbProgress, setThumbProgress] = useState(0);

  useEffect(() => {
    const smoothTimeUpdateListener = addSmoothTimeUpdateListener(
      (smoothVideoTime) => {
        const clampedVideoTime = clamp(smoothVideoTime, 0, videoLength);
        setThumbProgress((clampedVideoTime / videoLength) * scrubberWidth); // Set the screen position of the thumb.
        publishScrubberTime(clampedVideoTime); // Keep the scrubber time in sync with the video time.
      },
    );
    return () => smoothTimeUpdateListener.remove();
  }, [
    setThumbProgress,
    publishScrubberTime,
    addSmoothTimeUpdateListener,
    scrubberWidth,
    videoLength,
  ]);

  // This effect ensures that if mouse down was triggered by this scrubber thumb, any mouse events anywhere are handled by the scrubber thumb.
  const handleSeekRef = useRef(handleSeek); // Create a reference to handleSeek to escape the closure.
  const isSeekingRef = useRef(isSeeking); // Create a reference to isSeeking to escape the closure.
  // Escape the closures to avoid having to rerun this effect on every frame becuase handleSeek is redeclared every frame.
  // Attempting to useMemo or useCallback simply complicates the issue.
  // This approach permits attaching the window level callbacks only once.
  handleSeekRef.current = handleSeek; // Update this reference with the newest decalration of handleSeek.
  isSeekingRef.current = isSeeking; // Update this reference with the current isSeeking state.
  useEffect(() => {
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

      if (isSeekingRef.current) handleSeekRef.current(clientX);
    }
    const mouchUpListener = addWindowMouchUpListener(handleGlobalMouchUp);
    const mouchMoveListener = addWindowMouchMoveListener(handleGlobalMouchMove);
    return () => {
      mouchUpListener.remove();
      mouchMoveListener.remove();
    };
  }, []);

  return (
    <div
      className="absolute bottom-0 left-0 top-0 h-full w-8 cursor-pointer"
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
