import { useEffect, useState } from "react";

/* Gets the mouse position relative to the client window. 
 Not supplying an updateWhen condition makes this hook trigger a re-render for every mouse move event.*/
export default function useMouseClientPos(updateWhen = true) {
  const [mouseClientPos, setMouseClientPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleMouseMove(ev: MouseEvent) {
      if (updateWhen) setMouseClientPos({ x: ev.clientX, y: ev.clientY });
    }
    function handleMouseDown(ev: MouseEvent) {
      setMouseClientPos({ x: ev.clientX, y: ev.clientY });
    }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [updateWhen]);

  return { mouseClientPos };
}

// Converts a coordinate from the window space to a container space.
export function windowToConatainerPoint(
  container: HTMLElement,
  windowPoint: { x: number; y: number },
) {
  // Get the bounding rectangle of the container
  const rect = container.getBoundingClientRect();

  // Convert the point coordinates to the container's coordinate system
  const x = windowPoint.x - rect.left;
  const y = windowPoint.y - rect.top;

  return { x, y };
}
