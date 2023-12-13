import { z } from "zod";

const baseWebhookSchema = z.object({
  handle: z.string(),
  id: z.string(),
});

export const deletedWebhookSchema = baseWebhookSchema;

export const createdWebhookSchema = baseWebhookSchema.extend({
  fields: z.object({
    name: z.string(),
    start_time: z.coerce.date(),
    end_time: z.union([z.null(), z.coerce.date()]),
  }),
});

export const updatedWebhookSchema = createdWebhookSchema;
