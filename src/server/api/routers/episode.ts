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
        return { error: null };
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
          return { id: newUser.id, error: null };
        }
        return { id: null, error: "username unavailable" };
      } catch (e) {
        return { id: null, error: "internal server error" };
      }
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const episodes = await ctx.db.episode.findMany();
      return { episodes: episodes, error: null };
    } catch (e) {
      return { episodes: null, error: "internal server error" };
    }
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const episode = await ctx.db.episode.findUniqueOrThrow({
          where: { id: input.id, createdById: ctx.session.user.id },
        });
        return { episode: episode, error: null };
      } catch (e: any) {
        if (e.code === "P2025") {
          return { episode: null, error: "not an episode" };
        }
        return { episode: null, error: "internal server error" };
      }
    }),
});
