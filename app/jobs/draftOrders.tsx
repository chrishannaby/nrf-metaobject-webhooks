import { eventTrigger } from "@trigger.dev/sdk";
import { client } from "~/trigger.server";
import { z } from "zod";
import { executeFlowTrigger, getDraftOrder } from "~/utils/adminApi";
import { approveSchema } from "~/routes/approve-order";

export const sendApprovalChangedFlowTrigger = client.defineJob({
  id: "send-approval-changed-flow-trigger",
  name: "Send Approval Changed Flow Trigger",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "approval.changed",
    schema: z.object({
      draftOrderId: z.string(),
    }),
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info(
      `Send Approval Changed Flow Trigger for ${payload.draftOrderId}`
    );

    await io.runTask("send-flow-trigger", async (task) => {
      const repsonse = await executeFlowTrigger("approval-status-changed", {
        "Draft Order ID": payload.draftOrderId,
        "Auto Approve Threshold": 1000,
      });
      await io.logger.info(
        `Flow Trigger Response: ${JSON.stringify(repsonse)}`
      );
      return repsonse;
    });
  },
});

export const approveOrder = client.defineJob({
  id: "approve-draft-order",
  name: "Approve Draft Order",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "draft_order.approve",
    schema: approveSchema,
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info(`Approve draft order: ${payload.draftOrderId}`);

    const draftOrder = await io.runTask("get-draw", async (task) => {
      return await getDraftOrder(payload.draftOrderId);
    });

    if (!draftOrder) {
      await io.logger.info(`Draft Order not found: ${payload.draftOrderId}`);
      return;
    }

    await io.logger.info(`Got draft order: ${JSON.stringify(draftOrder)}`);
  },
});
