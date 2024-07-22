// Combines window mouse up and touch up listeners.
export function addWindowMouchUpListener(
  listener: (mouseEvent?: MouseEvent, touchEvent?: TouchEvent) => void,
  blockOthers?: boolean,
): MouchListener {
  function mouseListener(ev: MouseEvent) {
    if (blockOthers) {
      ev.stopPropagation();
      ev.preventDefault();
    }

    listener(ev, undefined);
  }

  function touchListener(ev: TouchEvent) {
    if (blockOthers) {
      ev.stopPropagation();
      ev.preventDefault();
    }

    listener(undefined, ev);
  }

  window.addEventListener("mouseup", mouseListener, { passive: !blockOthers });
  window.addEventListener("touchend", touchListener, { passive: !blockOthers });

  return {
    remove: () => {
      window.removeEventListener("mouseup", mouseListener);
      window.removeEventListener("touchend", touchListener);
    },
  };
}

// Combines window mouse move and touch move listeners.
export function addWindowMouchMoveListener(
  listener: (mouseEvent?: MouseEvent, touchEvent?: TouchEvent) => void,
  blockOthers?: boolean,
): MouchListener {
  function mouseListener(ev: MouseEvent) {
    if (blockOthers) {
      ev.stopPropagation();
      ev.preventDefault();
    }

    listener(ev, undefined);
  }

  function touchListener(ev: TouchEvent) {
    if (blockOthers) {
      ev.stopPropagation();
      ev.preventDefault();
    }

    listener(undefined, ev);
  }

  window.addEventListener("mousemove", mouseListener, {
    passive: !blockOthers,
  });
  window.addEventListener("touchmove", touchListener, {
    passive: !blockOthers,
  });

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
