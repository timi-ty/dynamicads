import { atom, useAtom } from "jotai";

// Atoms that make the undo/redo stacks global states.
const undoActionStackAtom = atom<
  {
    forwardAction: () => any;
    reverseAction: () => any;
    revert: (params: any) => any;
  }[]
>([]);
const redoActionStackAtom = atom<
  {
    forwardAction: () => any;
    reverseAction: () => any;
    revert: (params: any) => any;
  }[]
>([]);

// This hook operates on a global scope and must have no side effects.
// We await every action just incase it is a promise. Awaits do nothing for non async functions.
export default function useGlobalActionStack() {
  const [undoActionStack, setUndoActionStack] = useAtom(undoActionStackAtom);
  const [redoActionStack, setRedoActionStack] = useAtom(redoActionStackAtom);

  // Use this to do a reversible action. It captures the action and adds it to the undo stack.
  // If the primary action returns null, the action is not pushed to the stack.
  async function doAction<T, K>(
    primary: () => T,
    revert: (actionParams: NonNullable<Awaited<T>> | undefined) => K,
  ) {
    // Do the primary action and await the result if necessary.
    const actionResult = await primary();

    // If the primary action returns null, it does not push to the stack and will not be reversible.
    if (actionResult === null) {
      return;
    }

    // Construct the forward and reverse actions.
    const forwardAction = primary;
    const reverseAction = async () => {
      await revert(actionResult);
    };

    // Push to the undo stack. Also push the unboxed version of revert so that we can reconstruct it when redoing the action.
    setUndoActionStack((s) => [...s, { forwardAction, reverseAction, revert }]);

    // Clear the redo stack every time a new organic action is done.
    // Being able to redo an old action is counter-inuitive even though possible here because the actions are assumed to be atomic.
    setRedoActionStack([]);
  }

  // Pops an action from the undo stack, calls the reverse for it, and pushes the action to the redo stack.
  async function undoAction() {
    const action = undoActionStack.pop();
    if (action) {
      await action.reverseAction();
      setRedoActionStack((s) => [...s, action]);
    }
  }

  // Pops an action from the redo stack, calls the forward for it, and pushes the action back to the undo stack.
  async function redoAction() {
    const action = redoActionStack.pop();
    if (action) {
      // Redoing the action means it may return a different result this time. Get this new result and reconstruct the reverse action.
      const redoActionResult = await action.forwardAction();
      const reconstructedAction = {
        ...action,
        reverseAction: async () => {
          await action.revert(redoActionResult);
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
