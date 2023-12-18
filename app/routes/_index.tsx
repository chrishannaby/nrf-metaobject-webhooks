import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/drizzle/config.server";
import { drops } from "~/drizzle/schema.server";
import { parseProductId } from "~/utils/adminApi";

export const meta: MetaFunction = () => {
  return [{ title: "NRF Webhooks" }];
};

export async function loader() {
  const rows = (await db.select().from(drops)).map((row) => {
    return {
      url: `https://admin.shopify.com/store/230154-2/content/entries/drop/${parseProductId(
        row.shopifyId
      )}`,
      id: row.shopifyId,
      startTime: row.startTime,
      endTime: row.endTime,
    };
  });
  return json({ drops: rows });
}

export default function Index() {
  const { drops } = useLoaderData<typeof loader>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>NRF Webhooks</h1>
      <h2>Drops</h2>
      <ul>
        {drops.map((drop) => (
          <li key={drop.id}>
            <a href={drop.url}>{drop.id}</a>: {drop.startTime}{" "}
            {drop.endTime && <span>- {drop.endTime}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
