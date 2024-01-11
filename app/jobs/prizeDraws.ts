import { eventTrigger } from "@trigger.dev/sdk";
import { client } from "~/trigger.server";
import {
  createdOrUpdatedDrawWebhookSchema,
  baseWebhookSchema,
} from "~/utils/webhooks";
import { z } from "zod";
import { db } from "~/drizzle/config.server";
import { drawSignups, draws } from "~/drizzle/schema.server";
import { eq } from "drizzle-orm";
import { isBefore, isAfter, isEqual, add, formatISO } from "date-fns";
import {
  addTagsToCustomer,
  createCustomer,
  createDraftOrder,
  getCustomer,
  getDraw,
} from "~/utils/adminApi";
import { registerSchema } from "~/routes/registerForDraw";

export const createdDraw = client.defineJob({
  id: "prize_draw-created",
  name: "prize_draw Created",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "prize_draw.created",
    schema: createdOrUpdatedDrawWebhookSchema,
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info(`Draw Created: ${payload.handle}`);

    if (isBefore(payload.fields.start_time, new Date(Date.now()))) {
      await io.logger.info(`Draw start time is in the past, skipping`);
      return;
    }

    const drawStartedEvent = await io.sendEvent(
      "prize_draw.started",
      {
        name: `prize_draw.started ${payload.fields.start_time.toISOString()}`,
        payload: {
          drawId: payload.id,
        },
      },
      {
        deliverAt: payload.fields.start_time,
      }
    );

    await io.runTask("add-to-database", async (task) => {
      await db.insert(draws).values({
        shopifyId: payload.id,
        startedEventId: drawStartedEvent.id,
        startTime: payload.fields.start_time.toISOString(),
      });
    });
  },
});

export const deletedDraw = client.defineJob({
  id: "prize_draw-deleted",
  name: "prize_draw Deleted",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "prize_draw.deleted",
    schema: baseWebhookSchema,
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info(`Draw Deleted: ${payload.handle}`);
    const draw = await io.runTask("fetch-draw-from-db", async (task) => {
      const rows = await db
        .select()
        .from(draws)
        .where(eq(draws.shopifyId, payload.id));
      return rows.pop();
    });
    if (draw) {
      if (draw.startedEventId) {
        await io.cancelEvent(
          `cancel-draw-started ${draw.startedEventId}`,
          draw.startedEventId
        );
      }

      await io.runTask("delete-draw-from-db", async (task) => {
        await db.delete(draws).where(eq(draws.shopifyId, payload.id));
      });
    }
  },
});

export const updatedDraw = client.defineJob({
  id: "prize_draw-updated",
  name: "prize_draw Updated",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "prize_draw.updated",
    schema: createdOrUpdatedDrawWebhookSchema,
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info(`Draw Updated: ${payload.handle}`);
    const draw = await io.runTask("fetch-draw-from-db", async (task) => {
      const rows = await db
        .select()
        .from(draws)
        .where(eq(draws.shopifyId, payload.id));
      return rows.pop();
    });
    if (!draw) {
      await io.logger.info(
        `Draw not found in db: ${payload.handle}, creating new draw`
      );
      await io.sendEvent("prize_draw.created", {
        name: "prize_draw.created",
        payload,
      });
      return;
    }

    const newStartTime = payload.fields.start_time;
    const previousStartTime = new Date(draw.startTime);
    if (isEqual(newStartTime, previousStartTime)) {
      await io.logger.info(`Drop start time has not changed, skipping`);
      return;
    }

    await io.logger.info(
      `previousStartTime: ${previousStartTime.toISOString()} newStartTime: ${newStartTime.toISOString()}`
    );

    const now = new Date(Date.now());

    if (isBefore(newStartTime, now)) {
      await io.logger.info(`new start time is in the past, skipping`);
      return;
    }

    // cancel any existing events
    if (draw.startedEventId) {
      await io.cancelEvent(
        `cancel-draw-started ${draw.startedEventId}`,
        draw.startedEventId
      );
    }

    let newDrawStartedEventId: string | null;

    if (isAfter(newStartTime, now)) {
      const newDrawStartedEvent = await io.sendEvent(
        `prize_draw.started ${newStartTime.toISOString()}`,
        {
          name: "prize_draw.started",
          payload: {
            drawId: payload.id,
          },
        },
        {
          deliverAt: newStartTime,
        }
      );
      newDrawStartedEventId = newDrawStartedEvent.id;
    }

    await io.runTask("update-draw-in-db", async (task) => {
      await db
        .update(draws)
        .set({
          startedEventId: newDrawStartedEventId ?? draw.startedEventId,
          startTime: newStartTime.toISOString(),
        })
        .where(eq(draws.shopifyId, payload.id));
    });
  },
});

export const executePrizeDraw = client.defineJob({
  id: "execute-prize-draw",
  name: "Execute Prize Draw",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "prize_draw.started",
    schema: z.object({
      drawId: z.string(),
    }),
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info(`Execute draw for ${payload.drawId}`);

    const draw = await io.runTask("fetch-draw", async (task) => {
      return await getDraw(payload.drawId);
    });

    if (!draw) {
      await io.logger.info(`Draw not found: ${payload.drawId}`);
      return;
    }

    //get customers from db
    const customers = await io.runTask("fetch-customers", async (task) => {
      return await db
        .select()
        .from(drawSignups)
        .where(eq(drawSignups.drawId, payload.drawId));
    });

    const winners = getRandomItems(customers, draw.numberAvailable);

    await io.logger.info(`Winners: ${JSON.stringify(winners)}`);

    // create draft order for each winner
    for (const winner of winners) {
      await io.runTask(`create-draft-order ${winner.id}`, async (task) => {
        await createDraftOrder({
          email: winner.email,
          shippingLine: {
            title: "Free Shipping",
            price: 0,
          },
          reserveInventoryUntil: formatISO(
            add(new Date(Date.now()), { days: 1 })
          ),
          lineItems: {
            variantId: draw.variantId,
            quantity: 1,
            appliedDiscount: {
              title: "PRIZE DRAW",
              value: 100,
              valueType: "PERCENTAGE",
            },
          },
        });
      });
    }

    await io.logger.info(`Got draw: ${JSON.stringify(draw)}`);
  },
});

export const registerForDraw = client.defineJob({
  id: "register-for-draw",
  name: "Register for Draw",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "prize_draw.register",
    schema: registerSchema,
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info(
      `Register for Draw: ${payload.drawId} email: ${payload.email}`
    );

    const draw = await io.runTask("get-draw", async (task) => {
      return await getDraw(payload.drawId);
    });

    if (!draw) {
      await io.logger.info(`Draw not found: ${payload.drawId}`);
      return;
    }

    await io.logger.info(`Got draw: ${JSON.stringify(draw)}`);

    if (!draw.secret || draw.secret !== payload.secret) {
      await io.logger.info(`Invalid secret: ${payload.secret}`);
      return;
    }

    // add customer to shopify
    await io.runTask("add-customer", async (task) => {
      await io.sendEvent("customer.created", {
        name: "customer.created",
        payload: {
          email: payload.email,
          tags: payload.drawId,
        },
      });
    });

    await io.runTask("add-to-database", async (task) => {
      await db.insert(drawSignups).values({
        drawId: payload.drawId,
        email: payload.email,
      });
    });
  },
});

export const addCustomer = client.defineJob({
  id: "create-customer",
  name: "Create Customer",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "customer.created",
    schema: z.object({
      email: z.string(),
      tags: z.string(),
    }),
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info(`Create Customer: email: ${payload.email}`);

    let customer = await io.runTask("get-customer", async (task) => {
      return await getCustomer(payload.email);
    });

    await io.runTask("add-tags", async (task) => {
      await addTagsToCustomer(customer, payload.tags);
    });

    if (!customer) {
      await io.logger.info(`Customer not found: ${payload.email}`);
      customer = await io.runTask("create-customer", async (task) => {
        return await createCustomer(payload.email, payload.tags);
      });
    }

    await io.logger.info(`Got customer: ${JSON.stringify(customer)}`);
  },
});

function getRandomItems<T>(arr: T[], n: number): T[] {
  let tempArr = [...arr];
  for (let i = tempArr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [tempArr[i], tempArr[j]] = [tempArr[j], tempArr[i]];
  }
  return tempArr.slice(0, n);
}
