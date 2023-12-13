import type { ActionFunctionArgs } from "@remix-run/node";
import { client } from "~/trigger.server";

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.text();
  console.log(body);
  console.log(request.headers.get("X-Shopify-Topic"));
  await client.sendEvent({
    name: "metaobject.updated",
    payload: {
      body,
    },
  });
  return new Response("ok");
}
