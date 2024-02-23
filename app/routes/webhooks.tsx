import type { ActionFunctionArgs } from "@remix-run/node";
import { client } from "~/trigger.server";
import crypto from "crypto";
import {
  createdOrUpdatedWebhookSchema,
  deletedWebhookSchema,
} from "~/utils/webhooks";

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.text();
  const hmacHeader = request.headers.get("X-Shopify-Hmac-SHA256") || "";
  if (!validateHmac(body, hmacHeader)) {
    return new Response("HMAC validation failed", { status: 401 });
  }
  const topic = request.headers.get("X-Shopify-Topic") || "";
  const rawData = JSON.parse(body);
  let data;
  switch (topic) {
    case "metaobjects/create":
      data = createdOrUpdatedWebhookSchema.parse(rawData);
      await client.sendEvent({
        name: `${data.type}.created`,
        payload: data,
      });
      break;
    case "metaobjects/delete":
      data = deletedWebhookSchema.parse(rawData);
      await client.sendEvent({
        name: `${data.type}.deleted`,
        payload: data,
      });
      break;
    case "metaobjects/update":
      data = createdOrUpdatedWebhookSchema.parse(rawData);
      await client.sendEvent({
        name: `${data.type}.updated`,
        payload: data,
      });
      break;
    case "draft_orders/update":
      console.log(`Draft Order Updated: ${JSON.stringify(rawData.id)}`);
      await client.sendEvent({
        name: "draft_order.updated",
        payload: rawData.id,
      });
      break;
    default:
      console.log("unknown topic");
      break;
  }

  return new Response("ok");
}

function validateHmac(requestBody: string, hmacHeader: string) {
  const generatedHmac = crypto
    .createHmac("sha256", process.env.SHOPIFY_CLIENT_SECRET || "")
    .update(requestBody, "utf8")
    .digest("base64");
  return hmacHeader === generatedHmac;
}
