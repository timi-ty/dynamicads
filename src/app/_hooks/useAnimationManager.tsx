import { useCallback, useRef } from "react";

export default function useAnimationManager() {
  const lastUsedId = useRef(0);
  const processIds = useRef(new Set<number>());

  const createAnimationId = useCallback(() => {
    const id = lastUsedId.current++;
    processIds.current.add(id); // This is guaranteed to never use the same id twice.
    return id;
  }, []);

  // The update function does not receive the time delta because it is not needed for now.
  const startAnimation = useCallback(
    (update: () => void): Animation => {
      const animationProcessId = createAnimationId();
      function updateAnimation() {
        update();
        if (!processIds.current.has(animationProcessId)) return; // If the animation process has been stopped, don't queue the next frame.
        requestAnimationFrame(updateAnimation);
      }
      updateAnimation();

      return {
        stop: () => {
          processIds.current.delete(animationProcessId);
        },
      };
    },
    [createAnimationId],
  );

  return { startAnimation };
}

interface Animation {
  stop: () => void;
}
