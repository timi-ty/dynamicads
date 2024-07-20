import { useCallback, useRef } from "react";

export default function useAnimationManager() {
  const lastUsedId = useRef(0);
  const animations = useRef(new Map<number, number>()); // Maps animationProcessIds to their lastUpdatedTime.

  const createAnimation = useCallback(() => {
    const id = lastUsedId.current++;
    animations.current.set(id, Date.now()); // This is guaranteed to never use the same id twice.
    return id;
  }, []);

  const startAnimation = useCallback(
    (update: ((deltaTime: number) => void) | (() => void)): Animation => {
      const animationProcessId = createAnimation();
      function updateAnimation() {
        if (!animations.current.has(animationProcessId)) return; // If the animation process has been stopped, don't queue the next frame.
        const currentTime = Date.now();
        const lastTime =
          animations.current.get(animationProcessId) ?? currentTime; // If the animation does not exist then deltaTime will be 0.
        const deltaTime = (currentTime - lastTime) * 0.001; // deltaTime is in seconds.
        animations.current.set(animationProcessId, currentTime);
        update(deltaTime);
        requestAnimationFrame(updateAnimation);
      }
      updateAnimation();

      return {
        stop: () => {
          animations.current.delete(animationProcessId);
        },
      };
    },
    [createAnimation],
  );

  return { startAnimation };
}

interface Animation {
  stop: () => void;
}
