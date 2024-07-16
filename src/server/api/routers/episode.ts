import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const episodeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        videoUrl: z.string().url(),
        episodeName: z.string().min(4).max(30),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const episode = await ctx.db.episode.create({
          data: {
            name: input.episodeName,
            videoUrl: input.videoUrl,
            createdBy: { connect: { id: ctx.session.user.id } },
          },
        });
        return { episode: episode };
      } catch (e) {
        return { error: "internal server error" };
      }
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const episodes = await ctx.db.episode.findMany({
        where: { createdById: ctx.session.user.id },
      });
      return { episodes: episodes };
    } catch (e) {
      return { error: "internal server error" };
    }
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const episode = await ctx.db.episode.findUnique({
          where: { id: input.id, createdById: ctx.session.user.id },
        });
        return { episode: episode };
      } catch (e: any) {
        return { error: "internal server error" };
      }
    }),
});
