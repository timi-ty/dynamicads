# [Dynamic Ads](https://dynamicads.vercel.app/) (ROX CODES TEST)

This is a [T3 Stack](https://create.t3.gg/) test project bootstrapped with `create-t3-app`.

This project uses the following technologies:

- [Next.js](https://nextjs.org) - App router
- [NextAuth.js](https://next-auth.js.org) - Authentication and session management
- [Prisma](https://prisma.io) - ORM
- [Tailwind CSS](https://tailwindcss.com) - Inline styles
- [tRPC](https://trpc.io) - Typed remote procedure calls with react-query batteries
- [Jotai](https://jotai.org/) - Atomic global state management
- [Uploadthing](https://uploadthing.com/) - File upload

This project generally follows standard React.js best practices, and colors within the lines of the technologies used to get the best out of them.

However, there were a few challenges that were solved by coloring outside the lines a little:

1. **Fake username/password credential authentication with NextAuth.js:** This was done to make the process of testing the app as easy as possible. Any username/password combination either logs you in or creates a new user with the credentials. Credentials are stored plainly in the PostgreSQL db for easy retrieval.

2. **PostgreSQL database:** This project runs on a single PostgreSQL instance running in an Ubuntu instance on AWS Lightsail. It has relaxed security rules for testing convenience.

3. **Custom dropdown & switch:** This project uses two custom components that could otherwise be sourced from a standard component library. This was done to avoid more dependencies/imports for an otherwise lightweight test project.

4. **Automatic redirects:** This page uses automatic redirects to steer users to the implemented page at "/ads/[episode]". Other pages are stubs.

5. **Scrubber.tsx:** This is the most complex component in this application. It tightly mananges video scrubbing while also indicating video play time. This means it is both a consumer and a publisher of the video time. This requirement forced some custom logic, most notably:

   - Wrapping values in refs to escape closures and to listen/react to window level mouse events without having to remove and re-attach the listeners on component updates.

   ```javascript
   // This effect ensures that if mouse down was triggered by the scrubber, any mouse events anywhere are handled by the scrubber.
   const handleSeekRef = useRef(handleSeek); // Create a reference to handleSeek to escape the closure.
   const isSeekingRef = useRef(isSeeking); // Create a reference to isSeeking to escape the closure.
   // Escape the closures to avoid having to rerun this effect on every frame becuase handleSeek is redeclared every frame.
   // Attempting to useMemo or useCallback simply complicates the issue.
   // This approach permits attaching the window level callbacks only once.
   handleSeekRef.current = handleSeek; // Update this reference with the newest decalration of handleSeek.
   isSeekingRef.current = isSeeking; // Update this reference with the current isSeeking state.
   useEffect(() => {
    function handleGlobalMouseUp() {
      setIsSeeking(false);
    }
    function handleGlobalMouseMove(ev: MouseEvent) {
      if (isSeekingRef.current) handleSeekRef.current(ev.clientX);
    }
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
   }, []);
   ```

   - Injecting scrubber time value updates and a video reference into an existing react context tree from within the tree itself. This is not done within the Scrubber.tsx component but is done because of it.

   ```javascript
   function EpisodeVideoContextProvider({
   episode,
   children,
   }: Readonly<{ episode: Episode; children: ReactNode }>) {
   const [video, setVideo] = useState<HTMLVideoElement | null>(null);
   const [scrubberTime, setScrubberTime] = useState(0);
   const videoControls = useVideoControls(video);
   return (
    <EpisodeVideoContext.Provider
      value={{
        setVideo: setVideo,
        controls: videoControls,
        episode: episode,
        scrubberTime: scrubberTime,
        publishScrubberTime: (time) => setScrubberTime(time),
      }}
    >
      {children}
    </EpisodeVideoContext.Provider>
   );
   }
   ```

   - Using an effect without specifying all its dependencies in the dependency array.

   ```javascript
   // When we get an updated video time, it means the seek is settled.
   useEffect(() => {
     publishScrubberTime(videoTime); // Keep the scrubber time in sync with the video time.
     setIsSeekSettled(true);
   }, [videoTime]); // This effect should only fire stricly when the videoTime updates. The functions used inside do not change between renders.
   ```

6. **Custom undo/redo stack:** Done for pleasure only, this app uses a custom built undo/redo stack. Jotai is used to manage a global stack state. Some type gymnastics were required to beat eslint rules. The stack also invalidates itself more often than one might expect. This is done becuase the delete operation which is not really reversible is treated like a reversible action by simply creating another row in the db with the same values as the deleted data. This new row will have a new/different id though, meaning the stack history can no longer be trusted. Proper undo/redo should guarantee that undo always resets application state to EXACTLY where it was before.

```javascript
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
```

7. **Fake create episode button:** The button to create a new episode just passes through to the Uploadthing default upload button. This causes some issues with the cursor pointer, but this approach was chosen for cheapness.

That's it! Start from the [Episode Page](https://github.com/timi-ty/dynamicads/blob/main/src/app/ads/%5Bepisode%5D/page.tsx) to see how most of this app is built.
