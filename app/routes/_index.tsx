import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { db } from "~/drizzle/config.server";
import { drops } from "~/drizzle/schema.server";
import { getDrop, parseMetaobjectId } from "~/utils/adminApi";

export const meta: MetaFunction = () => {
  return [{ title: "NRF Webhooks" }];
};

export async function loader() {
  const rows = await db.select().from(drops);
  const data = await Promise.all(
    rows.map(async (row) => {
      const drop = await getDrop(row.shopifyId);
      return {
        name: drop.name,
        url: `https://admin.shopify.com/store/${
          process.env.SHOPIFY_SHOP_ID || ""
        }/content/entries/drop/${parseMetaobjectId(row.shopifyId)}`,
        id: row.shopifyId,
        startTime: row.startTime,
        endTime: row.endTime,
      };
    })
  );

  return json({ drops: data });
}

export default function Index() {
  const { drops } = useLoaderData<typeof loader>();

  const [currentTime, setCurrentTime] = useState(new Date().toISOString());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>NRF Webhooks</h1>
      <p>Current UTC time: {currentTime}</p>
      <h2>Drops</h2>
      <ul>
        {drops.map((drop) => (
          <li key={drop.id}>
            <a href={drop.url}>{drop.name}</a>
            <ul>
              {drop.startTime && <li>Starts at: {drop.startTime}</li>}
              {drop.endTime && <li>Ends at: {drop.endTime}</li>}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
