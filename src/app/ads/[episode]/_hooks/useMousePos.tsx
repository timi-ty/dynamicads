import { useEffect, useState } from "react";

// Gets the mouse position relative to the client window.
export default function useMouseClientPos() {
  const [mouseClientPos, setMouseClientPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleMouseMove(ev: MouseEvent) {
      setMouseClientPos({ x: ev.clientX, y: ev.clientY });
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return { mouseClientPos };
}

// Gets the mouse position relative to the top left of this element.
// Will return 0, 0 if the mouse is positioned exactly at the top left of this element.
export function useRelativeMousePos(container: HTMLElement | null) {
  const { mouseClientPos } = useMouseClientPos();
  const relativeMousePos = container
    ? windowToConatainerPoint(container, mouseClientPos)
    : { x: 0, y: 0 };
  return { relativeMousePos };
}

// Converts a coordinate from the window space to a container space.
function windowToConatainerPoint(
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
