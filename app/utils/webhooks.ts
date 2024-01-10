import { z } from "zod";

export const baseWebhookSchema = z.object({
  handle: z.string(),
  id: z.string(),
});

export const createdOrUpdatedDropWebhookSchema = baseWebhookSchema.extend({
  fields: z.object({
    name: z.string(),
    start_time: z.coerce.date(),
    end_time: z.union([z.null(), z.coerce.date()]),
  }),
});

export const createdOrUpdatedDrawWebhookSchema = baseWebhookSchema.extend({
  fields: z.object({
    name: z.string(),
    start_time: z.coerce.date(),
  }),
});

export const createdOrUpdatedWebhookSchema = z.discriminatedUnion("type", [
  createdOrUpdatedDropWebhookSchema.extend({ type: z.literal("drop") }),
  createdOrUpdatedDrawWebhookSchema.extend({ type: z.literal("prize_draw") }),
]);

export const deletedWebhookSchema = z.union([
  baseWebhookSchema.extend({ type: z.literal("drop") }),
  baseWebhookSchema.extend({ type: z.literal("prize_draw") }),
]);
