// Combines window mouse up and touch up listeners.
export function addWindowMouchUpListener(
  listener: (mouseEvent?: MouseEvent, touchEvent?: TouchEvent) => void,
): MouchListener {
  function mouseListener(ev: MouseEvent) {
    listener(ev, undefined);
  }

  function touchListener(ev: TouchEvent) {
    listener(undefined, ev);
  }

  window.addEventListener("mouseup", mouseListener);
  window.addEventListener("touchend", touchListener);

  return {
    remove: () => {
      window.removeEventListener("mouseup", mouseListener);
      window.removeEventListener("touchend", touchListener);
    },
  };
}

// Combines window mouse up and touch up listeners.
export function addWindowMouchMoveListener(
  listener: (mouseEvent?: MouseEvent, touchEvent?: TouchEvent) => void,
): MouchListener {
  function mouseListener(ev: MouseEvent) {
    listener(ev, undefined);
  }

  function touchListener(ev: TouchEvent) {
    listener(undefined, ev);
  }

  window.addEventListener("mousemove", mouseListener);
  window.addEventListener("touchmove", touchListener);

  return {
    remove: () => {
      window.removeEventListener("mousemove", mouseListener);
      window.removeEventListener("touchmove", touchListener);
    },
  };
}

interface MouchListener {
  remove: () => void;
}
