import { createRemixRoute } from "@trigger.dev/remix";
import { client } from "~/trigger.server";

// Remix will automatically strip files with side effects
// So you need to *export* your Job definitions like this:
export * from "~/jobs/drops";
export * from "~/jobs/klayvio";

export const { action } = createRemixRoute(client);
