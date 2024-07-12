import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  verify: publicProcedure
    .input(
      z.object({ username: z.string().min(4), password: z.string().min(4) }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const user = await ctx.db.user.findUnique({
          where: {
            username: input.username,
          },
        });
        //Verify the user if they exist.
        if (user) {
          return user.password === input.password
            ? { id: user.id, error: "" }
            : { id: "", error: "invalid password" };
        }
        return { id: "", error: "not a user" };
      } catch (e) {
        return { id: "", error: "internal server error" };
      }
    }),

  create: publicProcedure
    .input(
      z.object({ username: z.string().min(4), password: z.string().min(4) }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.db.user.findUnique({
          where: {
            username: input.username,
          },
        });
        //Only create the user if they don't exist.
        if (!user) {
          const newUser = await ctx.db.user.create({
            data: {
              username: input.username,
              password: input.password,
            },
          });
          return { id: newUser.id, error: "" };
        }
        return { id: "", error: "username unavailable" };
      } catch (e) {
        return { id: "", error: "internal server error" };
      }
    }),
});
