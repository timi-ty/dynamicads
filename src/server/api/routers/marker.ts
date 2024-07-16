import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { validMarkerTypes } from "~/utils/data";
import { AdMarkerType } from "~/utils/types";

export const markerRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        episodeId: z.number(),
        type: z
          .string()
          .refine((val) => validMarkerTypes.includes(val as AdMarkerType), {
            message: "Type must be one of: 'Auto', 'A/B', 'Static'",
          }),
        value: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const marker = await ctx.db.marker.create({
          data: {
            episode: { connect: { id: input.episodeId } },
            type: input.type,
            value: input.value,
            createdById: ctx.session.user.id,
          },
        });
        return { marker: marker };
      } catch (e) {
        return { error: "internal server error" };
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        markerId: z.number(),
        type: z
          .string()
          .refine((val) => validMarkerTypes.includes(val as AdMarkerType), {
            message: "Type must be one of: 'Auto', 'A/B', 'Static'",
          }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.marker.update({
          where: { id: input.markerId, createdById: ctx.session.user.id },
          data: {
            type: input.type,
          },
        });
        return;
      } catch (e) {
        return { error: "internal server error" };
      }
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        episodeId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const markers = await ctx.db.marker.findMany({
          orderBy: { createdAt: "asc" },
          where: {
            episodeId: input.episodeId,
            createdById: ctx.session.user.id,
          },
        });
        return { markers: markers };
      } catch (e) {
        return { error: "internal server error" };
      }
    }),

  delete: protectedProcedure
    .input(z.object({ markerId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.marker.delete({
          where: { id: input.markerId, createdById: ctx.session.user.id },
        });
        return;
      } catch (e: any) {
        return { error: "internal server error" };
      }
    }),
});
