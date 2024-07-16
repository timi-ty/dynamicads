import { atom, useAtom } from "jotai";

// Atoms that make the undo/redo stacks global states.
const undoActionStackAtom = atom<
  { forwardAction: () => void; reverseAction: () => void }[]
>([]);
const redoActionStackAtom = atom<
  { forwardAction: () => void; reverseAction: () => void }[]
>([]);

// This hook operates on a global scope and must have no side effects.
export default function useGlobalActionStack() {
  const [undoActionStack, setUndoActionStack] = useAtom(undoActionStackAtom);
  const [redoActionStack, setRedoActionStack] = useAtom(redoActionStackAtom);

  // Use this to do a reversible action. It captures the action and adds it to the undo stack.
  function doAction<T>(primary: () => T, revert: (actionParams: T) => void) {
    const actionResult = primary();
    const forwardAction = () => primary();
    const reverseAction = () => {
      revert(actionResult);
    };
    setUndoActionStack((s) => [...s, { forwardAction, reverseAction }]);

    // Clear the redo stack every time a new organic action is done.
    // Being able to redo an old action is counter-inuitive even though possible here because the actions are assumed to be atomic.
    setRedoActionStack([]);
  }

  // Pops an action from the undo stack, calls the reverse for it, and pushes the action to the redo stack.
  function undoAction() {
    const action = undoActionStack.pop();
    if (action) {
      action.reverseAction();
      setRedoActionStack((s) => [...s, action]);
    }
  }

  // Pops an action from the redo stack, calls the forward for it, and pushes the action back to the undo stack.
  function redoAction() {
    const action = redoActionStack.pop();
    if (action) {
      action.forwardAction();
      setUndoActionStack((s) => [...s, action]);
    }
  }

  return {
    doAction,
    undoAction,
    redoAction,
    canUndo: undoActionStack.length > 0,
    canRedo: redoActionStack.length > 0,
  };
}
