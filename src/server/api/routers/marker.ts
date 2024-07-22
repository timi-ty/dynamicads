import { time } from "console";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { validMarkerTypes } from "~/utils/data";
import { type AdMarkerType } from "~/utils/types";

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
      } catch {
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
        value: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedMarker = await ctx.db.marker.update({
          where: {
            id: input.markerId,
            createdById: ctx.session.user.id,
            deleted: false,
          },
          data: {
            type: input.type,
            value: input.value,
          },
        });
        return { updatedMarker: updatedMarker };
      } catch {
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
            deleted: false,
          },
        });
        return { markers: markers };
      } catch {
        return { error: "internal server error" };
      }
    }),

  delete: protectedProcedure
    .input(z.object({ markerId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const deletedMarker = await ctx.db.marker.update({
          where: { id: input.markerId, createdById: ctx.session.user.id },
          data: {
            deleted: true,
          },
        });
        return { deletedMarker: deletedMarker };
      } catch {
        return { error: "internal server error" };
      }
    }),

  recover: protectedProcedure
    .input(z.object({ markerId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const recoveredMarker = await ctx.db.marker.update({
          where: { id: input.markerId, createdById: ctx.session.user.id },
          data: {
            deleted: false,
          },
        });
        return { recoveredMarker: recoveredMarker };
      } catch {
        return { error: "internal server error" };
      }
    }),
});
