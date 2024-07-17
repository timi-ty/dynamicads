import { atom, useAtom } from "jotai";

// Atoms that make the undo/redo stacks global states.
const undoActionStackAtom = atom<object[]>([]);
const redoActionStackAtom = atom<object[]>([]);

type Action = {
  forwardAction: () => Promise<object>;
  reverseAction: () => Promise<object>;
  primary: (params?: object) => Promise<object>;
  revert: (params?: object) => Promise<object>;
};

// This hook operates on a global scope and must have no side effects.
// Await every action just incase it is a promise. Awaits do nothing for non async functions.
// Also try and catch every action. Actions are assumed to be error prone.
export default function useGlobalActionStack() {
  const [undoActionStack, setUndoActionStack] = useAtom(undoActionStackAtom);
  const [redoActionStack, setRedoActionStack] = useAtom(redoActionStackAtom);

  // In any situation where stack is corrupted or no longer valid, we clear it.
  function invalidateActionStack() {
    setRedoActionStack([]);
    setUndoActionStack([]);
  }

  // Use this to do a reversible action. It captures the action and adds it to the undo stack.
  // If the primary action returns null, the action is not pushed to the stack and cannot be undone, this should be the case if the primary action failed.
  // If the revert action returns null, the action could not be reversed and hence the redo stack must be invalidated to preserve the correctness of the undo stack.
  // It works by exchanging action sets between the undo and redo stack based on who acted last.
  async function doAction<T, K>(
    primary: (revertActionParams?: NonNullable<K>) => T | Promise<T>,
    revert: (primaryActionParams?: NonNullable<T>) => K | Promise<K>,
  ) {
    // Do the primary action and await the result if necessary.

    try {
      const actionResult = await primary();

      // If the primary action returns null, it does not push to the stack and will not be reversible. It has no effect on the stack.
      if (actionResult === null) {
        return null;
      }

      // Construct the forward and reverse actions.
      async function forwardAction() {
        return primary();
      }
      async function reverseAction() {
        return revert(actionResult ?? undefined);
      }

      // Push to the undo stack. Also push the unboxed versions of revert and primary so that we can reconstruct them when ping-ponging through the actions.
      setUndoActionStack((s) => [
        ...s,
        { forwardAction, reverseAction, primary, revert },
      ]);

      // Clear the redo stack every time a new organic action is done.
      // Being able to redo an old action is counter-inuitive and erroneous if the actions can depend on each other.
      setRedoActionStack([]);
    } catch {
      return null;
    }
  }

  // Pops an action from the undo stack, calls the reverse for it, and pushes the action to the redo stack.
  async function undoAction() {
    const action = undoActionStack.pop() as Action;
    if (action) {
      // Undoing an action means it may require a different input to be redone. Get this new required input and reconstruct the forward action.
      const undoActionResult = await action.reverseAction();
      // If the undo action returns null, it means the action could not revert the application state back to exactly where it was before.
      // If this happens, our entire stack is now potentially corrupt and cannot be trusted. Invalidate the whole thing.
      if (undoActionResult === null) {
        invalidateActionStack();
        return null;
      }
      const reconstructedAction = {
        ...action,
        forwardAction: async () => {
          try {
            return await action.primary(undoActionResult);
          } catch {
            return null; // Break and invalidate.
          }
        },
      };
      setRedoActionStack((s) => [...s, reconstructedAction]);
    }
  }

  // Pops an action from the redo stack, calls the forward for it, and pushes the action back to the undo stack.
  async function redoAction() {
    const action = redoActionStack.pop() as Action;
    if (action) {
      // Redoing the action means it may return a different result this time. Get this new result and reconstruct the reverse action.
      const redoActionResult = await action.forwardAction();
      // If the redo action returns null, it means the action could not revert the application state back to exactly where it was before.
      // If this happens, our entire stack is now potentially corrupt and cannot be trusted. Invalidate the whole thing.
      if (redoActionResult === null) {
        invalidateActionStack();
        return null;
      }
      const reconstructedAction = {
        ...action,
        reverseAction: async () => {
          try {
            return await action.revert(redoActionResult);
          } catch {
            return null; // Break and invalidate.
          }
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
    invalidateActionStack,
  };
}
