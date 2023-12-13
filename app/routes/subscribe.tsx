const mutation = `
mutation {
    webhookSubscriptionCreate(
        topic: METAOBJECTS_UPDATE
        subTopic: "type:drop"
        webhookSubscription: {
        format: JSON,
        callbackUrl: "https://nrf-webhooks.chrishannaby-store-a.com/webhooks"}
    ) {
        userErrors {
        field
        message
        }
        webhookSubscription {
        id
        }
    }
}`;

export async function action() {
  console.log(process.env.SHOPIFY_STORE_NAME);
  const response = await fetch(
    `https:/${process.env.SHOPIFY_STORE_NAME}.myshopify.com/admin/api/2024-01/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN || "",
      },
      body: JSON.stringify({ query: mutation }),
    }
  );
  const data = await response.json();
  console.log(data);
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
