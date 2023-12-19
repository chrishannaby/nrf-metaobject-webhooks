import { eventTrigger } from "@trigger.dev/sdk";
import { client } from "~/trigger.server";
import {
  createdOrUpdatedWebhookSchema,
  deletedWebhookSchema,
} from "~/utils/webhooks";
import { z } from "zod";
import { db } from "~/drizzle/config.server";
import { drops } from "~/drizzle/schema.server";
import { eq } from "drizzle-orm";
import { isBefore, isAfter, isEqual } from "date-fns";
import {
  Product,
  executeFlowTrigger,
  getDrop,
  parseProductId,
  updateKlaviyoListId,
} from "~/utils/adminApi";
import { createTemplate, createList } from "~/utils/klaviyoApi";

export const created = client.defineJob({
  id: "drop-created",
  name: "Drop Created",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "drop.created",
    schema: createdOrUpdatedWebhookSchema,
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info(`Drop Created: ${payload.handle}`);

    const dropStartedEvent = await io.sendEvent(
      "drop.started",
      {
        name: `drop.started ${payload.fields.start_time.toISOString()}`,
        payload: {
          dropId: payload.id,
        },
      },
      {
        deliverAt: payload.fields.start_time,
      }
    );
    const dropEndedEvent = payload.fields.end_time
      ? await io.sendEvent(
          `drop.ended ${payload.fields.end_time.toISOString()}`,
          {
            name: "drop.ended",
            payload: {
              dropId: payload.id,
            },
          },
          {
            deliverAt: payload.fields.end_time,
          }
        )
      : null;
    await io.runTask("add-to-database", async (task) => {
      await db.insert(drops).values({
        shopifyId: payload.id,
        startedEventId: dropStartedEvent.id,
        startTime: payload.fields.start_time.toISOString(),
        endedEventId: dropEndedEvent?.id,
        endTime: payload.fields.end_time?.toISOString(),
      });
    });

    const klaviyoListId = await io.runTask(
      "create-klaviyo-list",
      async (task) => {
        return await createList(payload.handle);
      }
    );
    await io.logger.info(`Created Klaviyo List: ${klaviyoListId}`);
    await io.runTask("update-klaviyo-list-id", async (task) => {
      await updateKlaviyoListId(payload.id, klaviyoListId);
    });
  },
});

export const deleted = client.defineJob({
  id: "drop-deleted",
  name: "Drop Deleted",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "drop.deleted",
    schema: deletedWebhookSchema,
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info(`Drop Deleted: ${payload.handle}`);
    const drop = await io.runTask("fetch-drop-from-db", async (task) => {
      const rows = await db
        .select()
        .from(drops)
        .where(eq(drops.shopifyId, payload.id));
      return rows.pop();
    });
    if (drop) {
      if (drop.startedEventId) {
        await io.cancelEvent(
          `cancel-drop-started ${drop.startedEventId}`,
          drop.startedEventId
        );
      }
      if (drop.endedEventId) {
        await io.cancelEvent(
          `cancel-drop-ended ${drop.endedEventId}`,
          drop.endedEventId
        );
      }
      const previousStartTime = new Date(drop.startTime);
      const previousEndTime = drop.endTime ? new Date(drop.endTime) : null;
      const now = new Date();
      const dropWasActive =
        isBefore(previousStartTime, now) &&
        (!previousEndTime || isAfter(previousEndTime, now));
      if (dropWasActive) {
        await io.sendEvent("drop.ended", {
          name: "drop.ended",
          payload: {
            dropId: payload.id,
          },
        });
      }
      await io.runTask("delete-drop-from-db", async (task) => {
        await db.delete(drops).where(eq(drops.shopifyId, payload.id));
      });
    }
  },
});

const endTimesAreEqual = (a: Date | null, b: Date | null) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return isEqual(a, b);
};

export const updated = client.defineJob({
  id: "drop-updated",
  name: "Drop Updated",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "drop.updated",
    schema: createdOrUpdatedWebhookSchema,
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info(`Drop Updated: ${payload.handle}`);
    const drop = await io.runTask("fetch-drop-from-db", async (task) => {
      const rows = await db
        .select()
        .from(drops)
        .where(eq(drops.shopifyId, payload.id));
      return rows.pop();
    });
    if (!drop) {
      await io.logger.info(
        `Drop not found in db: ${payload.handle}, creating new drop`
      );
      await io.sendEvent("drop.created", {
        name: "drop.created",
        payload,
      });
      return;
    }

    const newStartTime = payload.fields.start_time;
    const newEndTime = payload.fields.end_time;
    const previousStartTime = new Date(drop.startTime);
    const previousEndTime = drop.endTime ? new Date(drop.endTime) : null;
    if (
      isEqual(newStartTime, previousStartTime) &&
      endTimesAreEqual(newEndTime, previousEndTime)
    ) {
      await io.logger.info(
        `Drop start and end times have not changed, skipping`
      );
      return;
    }

    await io.logger.info(
      `previousStartTime: ${previousStartTime.toISOString()} newStartTime: ${newStartTime.toISOString()}`
    );
    await io.logger.info(
      `previousEndTime: ${previousEndTime?.toISOString()} newEndTime: ${newEndTime?.toISOString()}`
    );

    const now = new Date(Date.now());

    const dropWasActive =
      isBefore(previousStartTime, now) &&
      (!previousEndTime || isAfter(previousEndTime, now));
    await io.logger.info(`dropWasActive: ${dropWasActive}`);
    const dropNowActive =
      isBefore(newStartTime, now) && (!newEndTime || isAfter(newEndTime, now));
    await io.logger.info(`dropNowActive: ${dropNowActive}`);

    // cancel any existing events
    if (drop.startedEventId) {
      await io.cancelEvent(
        `cancel-drop-started ${drop.startedEventId}`,
        drop.startedEventId
      );
    }
    if (drop.endedEventId) {
      await io.cancelEvent(
        `cancel-drop-ended ${drop.endedEventId}`,
        drop.endedEventId
      );
    }

    if (dropWasActive && !dropNowActive) {
      await io.sendEvent(`drop.ended ${new Date().toISOString()}`, {
        name: "drop.ended",
        payload: {
          dropId: payload.id,
        },
      });
    }

    if (!dropWasActive && dropNowActive) {
      await io.sendEvent(`drop.started ${new Date().toISOString()}`, {
        name: "drop.started",
        payload: {
          dropId: payload.id,
        },
      });
    }

    let newDropStartedEventId: string | null;

    if (isAfter(newStartTime, now)) {
      const newDropStartedEvent = await io.sendEvent(
        `drop.started ${newStartTime.toISOString()}`,
        {
          name: "drop.started",
          payload: {
            dropId: payload.id,
          },
        },
        {
          deliverAt: newStartTime,
        }
      );
      newDropStartedEventId = newDropStartedEvent.id;
    }

    let newDropEndedEventId: string | null;

    if (newEndTime && isAfter(newEndTime, now)) {
      const newDropEndedEvent = await io.sendEvent(
        `drop.ended ${newEndTime.toISOString()}`,
        {
          name: "drop.ended",
          payload: {
            dropId: payload.id,
          },
        },
        {
          deliverAt: newEndTime,
        }
      );
      newDropEndedEventId = newDropEndedEvent.id;
    }

    await io.runTask("update-drop-in-db", async (task) => {
      await db
        .update(drops)
        .set({
          startedEventId: newDropStartedEventId ?? drop.startedEventId,
          startTime: newStartTime.toISOString(),
          endedEventId: newDropEndedEventId ?? drop.endedEventId,
          endTime: newEndTime?.toISOString(),
        })
        .where(eq(drops.shopifyId, payload.id));
    });
  },
});

function extractProductIds(products: Product[]) {
  return products.flatMap((product) => {
    const parsed = parseProductId(product.id);
    if (!parsed) {
      return [];
    }
    return [{ productId: parsed }];
  });
}

export const sendDropStartedFlowTrigger = client.defineJob({
  id: "send-drop-started-flow-trigger",
  name: "Send Drop Started Flow Trigger",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "drop.started",
    schema: z.object({
      dropId: z.string(),
    }),
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info(
      `Send Drop Started Flow Trigger for ${payload.dropId}`
    );

    const drop = await io.runTask("fetch-drop", async (task) => {
      return await getDrop(payload.dropId);
    });

    await io.logger.info(`Got drop: ${JSON.stringify(drop)}`);

    const productIds = extractProductIds(drop.products);

    if (productIds.length === 0) {
      await io.logger.info(`Drop has no products, skipping`);
      return;
    }

    const klaviyoTemplateId = await io.runTask(
      "create-klaviyo-template",
      async (task) => {
        return await createTemplate(drop.name, drop.products);
      }
    );
    await io.logger.info(`Created Klaviyo Template: ${klaviyoTemplateId}`);

    await io.runTask("send-flow-trigger", async (task) => {
      await executeFlowTrigger("drop-started", {
        Drop: {
          id: drop.id,
          name: drop.name,
          products: productIds,
        },
        Klaviyo: {
          listId: drop.klaviyo.listId,
          templateId: klaviyoTemplateId,
          apiKey: drop.klaviyo.apiKey,
        },
      });
    });
  },
});

export const sendDropEndedFlowTrigger = client.defineJob({
  id: "send-drop-ended-flow-trigger",
  name: "Send Drop Ended Flow Trigger",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "drop.ended",
    schema: z.object({
      dropId: z.string(),
    }),
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info(`Send Drop Ended Flow Trigger for ${payload.dropId}`);
    await io.runTask("fetch-drop", async (task) => {
      const drop = await getDrop(payload.dropId);
      await io.logger.info(`Got drop: ${JSON.stringify(drop)}`);
      if (!drop.products.length) {
        await io.logger.info(`Drop has no products, skipping`);
        return;
      }
      await io.runTask("send-flow-trigger", async (task) => {
        const repsonse = await executeFlowTrigger("drop-ended", {
          Drop: {
            id: drop.id,
            name: drop.name,
            products: extractProductIds(drop.products),
          },
        });
        return repsonse;
      });
    });
  },
});
