import { client } from "~/trigger.server";
import { eventTrigger } from "@trigger.dev/sdk";
import { addToKlaviyoListSchema } from "~/routes/add-to-list";
import { createProfile, addToProfileList } from "~/utils/klaviyoApi";

export const addToKlaviyoList = client.defineJob({
  id: "add-to-klaviyo-list",
  name: "Add to Klaviyo List",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "add-to-klaviyo-list",
    schema: addToKlaviyoListSchema,
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info(`Creating profile for: ${payload.email}`);
    const profileId = await io.runTask("create-profile", async (task) => {
      return await createProfile(payload.email);
    });
    await io.logger.info(`Adding: ${profileId} to list: ${payload.listId}`);
    await io.runTask("add-to-profile-list", async (task) => {
      await addToProfileList(profileId, payload.listId);
    });
  },
});
