import { eventTrigger } from "@trigger.dev/sdk";
import { client } from "~/trigger.server";
import { z } from "zod";

export const job = client.defineJob({
  id: "metaobject-updated",
  name: "Metaobject Updated",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "metaobject.updated",
    schema: z.object({
      body: z.string(),
    }),
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info("Body: " + payload.body);
  },
});
