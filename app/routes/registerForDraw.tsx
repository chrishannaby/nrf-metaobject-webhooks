import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { client } from "~/trigger.server";
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  drawId: z.string().nonempty(),
  secret: z.string().nonempty(),
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
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
  if (request.method !== "POST") {
    return response(405, "Method not allowed");
  }
  const contentType = request.headers.get("Content-Type") || "";
  if (contentType !== "application/json") {
    return response(400, "Content-Type must be application/json");
  }
  const body = await request.json();
  try {
    const { email, drawId, secret, firstName, lastName } =
      registerSchema.parse(body);

    await client.sendEvent({
      name: "prize_draw.register",
      payload: {
        email: email,
        drawId: drawId,
        secret: secret,
        firstName: firstName,
        lastName: lastName,
      },
    });
    return response(200, "OK");
  } catch (error: any) {
    return response(400, error.message);
  }
}
