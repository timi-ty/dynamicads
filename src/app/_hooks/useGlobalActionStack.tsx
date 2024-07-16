import { atom, useAtom } from "jotai";

// Atoms that make the undo/redo stacks global states.
const undoActionStackAtom = atom<
  {
    forwardAction: () => any;
    reverseAction: () => any;
    primary: (params: any) => any;
    revert: (params: any) => any;
  }[]
>([]);
const redoActionStackAtom = atom<
  {
    forwardAction: () => any;
    reverseAction: () => any;
    primary: (params: any) => any;
    revert: (params: any) => any;
  }[]
>([]);

// This hook operates on a global scope and must have no side effects.
// We await every action just incase it is a promise. Awaits do nothing for non async functions.
export default function useGlobalActionStack() {
  const [undoActionStack, setUndoActionStack] = useAtom(undoActionStackAtom);
  const [redoActionStack, setRedoActionStack] = useAtom(redoActionStackAtom);

  // In any situation where there is a risk of the stack getting corrupted, we invalidate the redo stack to keep the undo stack safe.
  function invalidateRedoStack() {
    setRedoActionStack([]);
  }

  // Use this to do a reversible action. It captures the action and adds it to the undo stack.
  // If the primary action returns null, the action is not pushed to the stack and cannot be undone, this should be the case if the primary action failed.
  // If the revert action returns null, the action could not be reversed and hence the redo stack must be invalidated to preserve the correctness of the undo stack.
  // It works by exchanging action sets between the undo and redo stack based on who acted last.
  async function doAction<T, K>(
    primary: (revertActionParams?: NonNullable<Awaited<K>>) => T,
    revert: (primaryActionParams?: NonNullable<Awaited<T>>) => K,
  ) {
    // Do the primary action and await the result if necessary.
    const actionResult = await primary();

    // If the primary action returns null, it does not push to the stack and will not be reversible. It has no effect on the stack.
    if (actionResult === null) {
      return;
    }

    // Construct the forward and reverse actions.
    const forwardAction = async () => {
      return await primary();
    };
    const reverseAction = async () => {
      return await revert(actionResult);
    };

    // Push to the undo stack. Also push the unboxed versions of revert and primary so that we can reconstruct them when ping-ponging through the actions.
    setUndoActionStack((s) => [
      ...s,
      { forwardAction, reverseAction, primary, revert },
    ]);

    // Clear the redo stack every time a new organic action is done.
    // Being able to redo an old action is counter-inuitive and erroneous if the actions can depend on each other.
    invalidateRedoStack();
  }

  // Pops an action from the undo stack, calls the reverse for it, and pushes the action to the redo stack.
  async function undoAction() {
    const action = undoActionStack.pop();
    if (action) {
      // Undoing an action means it may require a different input to be redone. Get this new required input and reconstruct the forward action.
      const undoActionResult = await action.reverseAction();
      // If the undo action returns null, it means the undo failed and the redo stack has to be purged.
      if (undoActionResult === null) {
        invalidateRedoStack();
        return;
      }
      const reconstructedAction = {
        ...action,
        forwardAction: async () => {
          return await action.primary(undoActionResult);
        },
      };
      setRedoActionStack((s) => [...s, reconstructedAction]);
    }
  }

  // Pops an action from the redo stack, calls the forward for it, and pushes the action back to the undo stack.
  async function redoAction() {
    const action = redoActionStack.pop();
    if (action) {
      // Redoing the action means it may return a different result this time. Get this new result and reconstruct the reverse action.
      const redoActionResult = await action.forwardAction();
      // If the formard action returns null, it does not push to the stack and will not be reversible anymore. We also clear the redo stack to keep the undo stack safe.
      if (redoActionResult === null) {
        invalidateRedoStack();
        return;
      }
      const reconstructedAction = {
        ...action,
        reverseAction: async () => {
          return await action.revert(redoActionResult);
        },
      };
      setUndoActionStack((s) => [...s, reconstructedAction]);
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
