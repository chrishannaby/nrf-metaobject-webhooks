import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { client } from "~/trigger.server";
import { z } from "zod";

export const addToKlaviyoListSchema = z.object({
  email: z.string().email(),
  listId: z.string().nonempty(),
});

function response(status: number, body: string) {
  return new Response(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS, POST",
      "Access-Control-Allow-Headers": "Content-Type, X-Api-Key",
    },
  });
}

export function loader({ request }: LoaderFunctionArgs) {
  if (request.method === "OPTIONS") {
    return response(200, "OK");
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const apiKey = request.headers.get("X-Api-Key") || "";
  if (apiKey !== process.env.API_KEY) {
    return response(401, "Unauthorized");
  }
  if (request.method !== "POST") {
    return response(405, "Method not allowed");
  }
  const contentType = request.headers.get("Content-Type") || "";
  if (contentType !== "application/json") {
    return response(400, "Content-Type must be application/json");
  }
  const body = await request.json();
  try {
    const { email, listId } = addToKlaviyoListSchema.parse(body);

    await client.sendEvent({
      name: "add-to-klaviyo-list",
      payload: {
        email: email,
        listId: listId,
      },
    });
    return response(200, "OK");
  } catch (error: any) {
    return response(400, error.message);
  }
}
