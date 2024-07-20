import { useRef } from "react";

export default function useListenerGroup() {
  const lastUsedId = useRef(0);
  const listeners = useRef<Map<number, () => void>>(new Map());

  function addListener(listener: () => void): Listener {
    const id = lastUsedId.current++; // This is guaranteed to never use the same id twice.
    listeners.current.set(id, listener);
    return {
      remove: () => {
        listeners.current.delete(id);
      },
    };
  }

  function callListeners() {
    listeners.current.forEach((listener) => {
      listener();
    });
  }

  return { addListener, callListeners };
}

export interface Listener {
  remove: () => void;
}
