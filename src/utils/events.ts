// Combines window mouse up and touch up listeners.
export function addWindowMouchUpListener(
  listener: (mouseEvent?: MouseEvent, touchEvent?: TouchEvent) => void,
  blockOthers?: boolean,
): MouchListener {
  function mouseListener(ev: MouseEvent) {
    if (blockOthers) {
      ev.stopImmediatePropagation();
      ev.preventDefault();
    }

    listener(ev, undefined);
  }

  function touchListener(ev: TouchEvent) {
    if (blockOthers) {
      ev.stopImmediatePropagation();
      ev.preventDefault();
    }

    listener(undefined, ev);
  }

  window.addEventListener("mouseup", mouseListener, {
    passive: !blockOthers,
    capture: blockOthers,
  });
  window.addEventListener("touchend", touchListener, {
    passive: !blockOthers,
    capture: blockOthers,
  });

  return {
    remove: () => {
      window.removeEventListener("mouseup", mouseListener, {
        capture: blockOthers,
      });
      window.removeEventListener("touchend", touchListener, {
        capture: blockOthers,
      });
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
      ev.stopImmediatePropagation();
      ev.preventDefault();
    }

    listener(ev, undefined);
  }

  function touchListener(ev: TouchEvent) {
    if (blockOthers) {
      ev.stopImmediatePropagation();
      ev.preventDefault();
    }

    listener(undefined, ev);
  }

  window.addEventListener("mousemove", mouseListener, {
    passive: !blockOthers,
    capture: blockOthers,
  });
  window.addEventListener("touchmove", touchListener, {
    passive: !blockOthers,
    capture: blockOthers,
  });

  return {
    remove: () => {
      window.removeEventListener("mousemove", mouseListener, {
        capture: blockOthers,
      });
      window.removeEventListener("touchmove", touchListener, {
        capture: blockOthers,
      });
    },
  };
}

interface MouchListener {
  remove: () => void;
}
