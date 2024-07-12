import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "~/server/db";
import { api } from "~/trpc/server";

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
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          id: token.sub || "",
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
        //Fake authorization just to have consistent user data per username in the db
        //Authorize the user if they exist, otherwise create a new user
        try {
          if (!credentials) return null;
          let result = await api.user.verify(credentials);
          if (result.error === "") {
            return { id: result.id };
          } else if (result.error === "not a user") {
            result = await api.user.create(credentials);
            return result.error === "" ? { id: result.id } : null;
          }
        } catch (e) {
          console.error(e);
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
