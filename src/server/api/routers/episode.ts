import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const episodeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        episodeUrl: z.string().url(),
        episodeName: z.string().min(4).max(30),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.episode.create({
          data: {
            name: input.episodeName,
            fileUrl: input.episodeUrl,
            createdBy: { connect: { id: ctx.session.user.id } },
          },
        });
        return { error: "" };
      } catch (e) {
        return { error: "internal server error" };
      }
    }),

  addMarker: protectedProcedure
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

  getAll: protectedProcedure.query(async ({ ctx, input }) => {
    try {
      const episodes = await ctx.db.episode.findMany();
      return { episodes: episodes, error: "" };
    } catch (e) {
      return { episodes: [], error: "internal server error" };
    }
  }),
});
