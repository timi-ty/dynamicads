import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string;
    };
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: (params) => {
      return {
        ...params.session,
        user: {
          id: params.token.sub || "",
          name: params.session.user.name,
        },
      };
    },
  },
  providers: [
    CredentialsProvider({
      name: "Fake Credentials",
      credentials: {
        username: {
          label: "Username (4+ chars)",
          type: "text",
          placeholder: "roxtest",
        },
        password: { label: "Password (4+ chars)", type: "password" },
      },
      async authorize(credentials, _) {
        // Fake authorization just to have consistent user data per username in the db.
        // Authorize the user if they exist, otherwise create a new user.
        // We can't go through trpc here because trpc depends on auth. This runs on the server only so we use the db directly.
        if (!credentials) return null;
        try {
          const user = await db.user.findUnique({
            where: {
              username: credentials.username,
            },
          });
          // Verify the user if they exist.
          if (user) {
            return user.password === credentials.password
              ? { id: user.id, name: user.username }
              : null;
          } else {
            // Create a new user if they don't exist
            const newUser = await db.user.create({
              data: {
                username: credentials.username,
                password: credentials.password,
              },
            });
            return { id: newUser.id, name: newUser.username };
          }
        } catch (e) {
          console.log(e);
        }
        return null;
      },
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
