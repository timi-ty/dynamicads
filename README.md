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

5. **Custom video controls:** This project tightly mananges video scrubbing while also indicating video play time. This means it both consumes and sets the current time of a video element. This requirement forced some custom logic, most notably the use of requestAnimationFrame to poll for the video time.

6. **Custom undo/redo stack:** This app uses a custom built undo/redo stack. Jotai is used to manage a global stack state. Some type gymnastics were required to beat eslint rules.

```javascript
  // Pops an action from the undo stack, calls the reverse for it, and pushes the action to the redo stack.
  async function undoAction() {
    const action = undoActionStack.pop() as Action;
    if (action) {
      try {
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
      } catch {
        return null; // Break and invalidate.
      }
    }
  }
```

7. **Fake create episode button:** The button to create a new episode just passes through to the Uploadthing default upload button. This causes some issues with the cursor pointer, but this approach was chosen for cheapness.

That's it! Start from the [Episode Page](https://github.com/timi-ty/dynamicads/blob/main/src/app/ads/%5Bepisode%5D/page.tsx) to see how most of this app is built.
