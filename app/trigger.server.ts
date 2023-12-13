import { TriggerClient } from "@trigger.dev/sdk";

export const client = new TriggerClient({
  id: "nrf-2024-eY_a",
  apiKey: process.env.TRIGGER_API_KEY,
  apiUrl: process.env.TRIGGER_API_URL,
});
