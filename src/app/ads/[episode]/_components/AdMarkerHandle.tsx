"use client";

import { useCallback, useEffect, useState } from "react";
import useGlobalActionStack from "~/app/_hooks/useGlobalActionStack";
import { api } from "~/trpc/react";
import {
  addWindowMouchUpListener,
  addWindowMouchMoveListener,
} from "~/utils/events";
import { clamp } from "~/utils/math";
import { AdMarkerType } from "~/utils/types";

export default function AdMarkerHandle({
  id,
  type,
  value,
  scrubberWidth,
  videoLength,
  getRelativePos,
}: Readonly<{
  id: number;
  type: AdMarkerType;
  value: number;
  scrubberWidth: number;
  videoLength: number;
  getRelativePos: (clientMousePosX: number) => { x: number; y: number };
}>) {
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [markerLeft, setMarkerLeft] = useState(
    ((value * 0.001) / videoLength) * scrubberWidth,
  );

  useEffect(
    () => setMarkerLeft(((value * 0.001) / videoLength) * scrubberWidth),
    [value, videoLength, scrubberWidth],
  );

  const queryUtils = api.useUtils();
  const editMarker = api.marker.update.useMutation();

  const { doAction } = useGlobalActionStack();

  const handleEditValue = useCallback(
    (newMarkerValue: number) => {
      const clampedValue = clamp(newMarkerValue, 0, videoLength * 1000); // Marker value is in millis.
      async function primary() {
        const { updatedMarker } = await editMarker.mutateAsync({
          // No need to wrap in try block for actions.
          type: type,
          value: clampedValue,
          markerId: id,
        });
        if (editMarker.error ?? !updatedMarker) {
          return null; // Nothing to revert.
        }
        void queryUtils.marker.getAll.invalidate();

        return { oldMarkerValue: value };
      }
      async function revert(params?: { oldMarkerValue: number }) {
        if (!params) return;

        await editMarker.mutateAsync(
          { type: type, value: params.oldMarkerValue, markerId: id },
          {
            onSuccess: () => {
              void queryUtils.marker.getAll.invalidate();
            },
          },
        );
      }
      void doAction(primary, revert);
    },
    [editMarker, doAction],
  );

  const handleAdjust = useCallback((clientMousePosX: number) => {
    const relativeMousePos = getRelativePos(clientMousePosX - 21); // The marker handle is hardcoded to a 42px width. Subtracting 21 makes the drag centered on the marker.
    const clampedAdjustPos = clamp(relativeMousePos.x, 0, scrubberWidth);
    setMarkerLeft(clampedAdjustPos);
  }, []);

  // This effect attached window level listeners that take over once an adjust begins.
  useEffect(() => {
    if (!isAdjusting) return; // Listeners are not needed if not adjusting.

    function handleGlobalMouchUp() {
      setIsAdjusting(false);
      const markerValue = (markerLeft / scrubberWidth) * videoLength * 1000; // Marker value is in millis.
      handleEditValue(markerValue);
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

      if (isAdjusting) handleAdjust(clientX);
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
  }, [isAdjusting, handleAdjust, handleEditValue]);

  return (
    <div
      style={{ left: `${markerLeft}px` }}
      className={`pointer-events-auto absolute flex h-full w-[42px] cursor-pointer select-none flex-col items-center justify-between rounded-md border-2 border-zinc-900 pb-2 pt-2 ${type === "Static" ? "bg-blue-300 stroke-blue-800 text-blue-800" : type === "A/B" ? "bg-orange-300 stroke-orange-800 text-orange-800" : "bg-green-300 stroke-green-800 text-green-800"}`}
      onMouseDown={(ev) => {
        setIsAdjusting(true);
        handleAdjust(ev.clientX);
      }}
      onTouchStart={(ev) => {
        if (ev.touches[0]) {
          setIsAdjusting(true);
          handleAdjust(ev.touches[0].clientX);
        }
      }}
    >
      <div
        className={`flex max-h-[14px] flex-row items-center justify-center rounded border p-1 text-center text-[10px] ${
          type === "Static"
            ? "border-blue-800"
            : type === "A/B"
              ? "border-orange-800"
              : "border-green-800"
        }`}
      >
        <span>{type === "Static" ? "S" : type === "A/B" ? "A/B" : "A"}</span>
      </div>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.99992 8.66665C6.36811 8.66665 6.66659 8.36817 6.66659 7.99998C6.66659 7.63179 6.36811 7.33331 5.99992 7.33331C5.63173 7.33331 5.33325 7.63179 5.33325 7.99998C5.33325 8.36817 5.63173 8.66665 5.99992 8.66665Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.99992 4.00002C6.36811 4.00002 6.66659 3.70154 6.66659 3.33335C6.66659 2.96516 6.36811 2.66669 5.99992 2.66669C5.63173 2.66669 5.33325 2.96516 5.33325 3.33335C5.33325 3.70154 5.63173 4.00002 5.99992 4.00002Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.99992 13.3333C6.36811 13.3333 6.66659 13.0349 6.66659 12.6667C6.66659 12.2985 6.36811 12 5.99992 12C5.63173 12 5.33325 12.2985 5.33325 12.6667C5.33325 13.0349 5.63173 13.3333 5.99992 13.3333Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.99992 8.66665C10.3681 8.66665 10.6666 8.36817 10.6666 7.99998C10.6666 7.63179 10.3681 7.33331 9.99992 7.33331C9.63173 7.33331 9.33325 7.63179 9.33325 7.99998C9.33325 8.36817 9.63173 8.66665 9.99992 8.66665Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.99992 4.00002C10.3681 4.00002 10.6666 3.70154 10.6666 3.33335C10.6666 2.96516 10.3681 2.66669 9.99992 2.66669C9.63173 2.66669 9.33325 2.96516 9.33325 3.33335C9.33325 3.70154 9.63173 4.00002 9.99992 4.00002Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.99992 13.3333C10.3681 13.3333 10.6666 13.0349 10.6666 12.6667C10.6666 12.2985 10.3681 12 9.99992 12C9.63173 12 9.33325 12.2985 9.33325 12.6667C9.33325 13.0349 9.63173 13.3333 9.99992 13.3333Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
