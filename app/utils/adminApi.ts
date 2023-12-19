export type Maybe<T> = T | null;

export type Connection<T> = {
  edges: Array<Edge<T>>;
};

export type Edge<T> = {
  node: T;
};

interface ShopifyErrorLike {
  status: number;
  message: Error;
  cause?: Error;
}

export const isObject = (
  object: unknown
): object is Record<string, unknown> => {
  return (
    typeof object === "object" && object !== null && !Array.isArray(object)
  );
};

export const isShopifyError = (error: unknown): error is ShopifyErrorLike => {
  if (!isObject(error)) return false;

  if (error instanceof Error) return true;

  return findError(error);
};

function findError<T extends object>(error: T): boolean {
  if (Object.prototype.toString.call(error) === "[object Error]") {
    return true;
  }

  const prototype = Object.getPrototypeOf(error) as T | null;

  return prototype === null ? false : findError(prototype);
}

type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

export async function queryAdminApi<T>(
  query: string,
  variables?: ExtractVariables<T>
): Promise<{ status: number; body: T } | never> {
  try {
    const result = await fetch(
      `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN || "",
        },
        body: JSON.stringify({
          ...(query && { query }),
          ...(variables && { variables }),
        }),
      }
    );
    const body = await result.json();

    if (body.errors) {
      throw body.errors[0];
    }

    return {
      status: result.status,
      body,
    };
  } catch (e) {
    if (isShopifyError(e)) {
      throw {
        cause: e.cause?.toString() || "unknown",
        status: e.status || 500,
        message: e.message,
        query,
      };
    }

    throw {
      error: e,
      query,
    };
  }
}

const dropQuery = `
query metaobjectReferences($id: ID!) {
	metaobject(id: $id) {
    displayName
    klaviyoListId: field(key: "klaviyo_list_id") {
			value
		}
		referencedBy(first: 100) {
			edges {
				node {
					referencer {
						... on Product {
							id
              title
							onlineStoreUrl
							featuredImage {
								url
							}
						}
					}
				}
			}
		}
	}
}
`;

type GetDropOperation = {
  data: {
    metaobject: {
      displayName: string;
      klaviyoListId: {
        value: string;
      };
      referencedBy: Connection<{
        referencer: {
          id: string;
          title: string;
          onlineStoreUrl: string;
          featuredImage: {
            url: string;
          };
        };
      }>;
    };
  };
  variables: {
    id: string;
  };
};

export type Product = {
  id: string;
  name: string;
  url: string;
  imageUrl: string;
};

type Klaviyo = {
  listId: string;
  apiKey: string;
};

export async function getDrop(dropId: string): Promise<{
  id: string;
  name: string;
  klaviyo: Klaviyo;
  products: Product[];
}> {
  const response = await queryAdminApi<GetDropOperation>(dropQuery, {
    id: dropId,
  });

  const metaobject = response.body.data.metaobject;

  return {
    id: dropId,
    name: metaobject.displayName,
    klaviyo: {
      listId: metaobject.klaviyoListId.value,
      apiKey: process.env.KLAVIYO_API_KEY || "",
    },
    products: response.body.data.metaobject.referencedBy.edges.map((edge) => {
      const product = edge.node.referencer;
      return {
        id: product.id,
        name: product.title,
        url: product.onlineStoreUrl,
        imageUrl: product.featuredImage.url,
      };
    }),
  };
}

type FlowTriggerPayload = {
  Drop: {
    id: string;
    name: string;
    products: Array<{ productId: string }>;
  };
  Klaviyo?: {
    listId: string;
    templateId: string;
    apiKey: string;
  };
};

const flowTriggerMutation = `
mutation flowTriggerReceive($handle: String, $payload: JSON) {
	flowTriggerReceive(handle: $handle, payload: $payload) {
		userErrors {
			message
			field
		}
	}
}
`;

export async function executeFlowTrigger(
  triggerHandle: string,
  payload: FlowTriggerPayload
) {
  const response = await fetch(
    `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/2024-01/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN || "",
      },
      body: JSON.stringify({
        query: flowTriggerMutation,
        variables: {
          handle: triggerHandle,
          payload,
        },
      }),
    }
  );
  const { data } = await response.json();
}

const updateKlaviyoListIdMutation = `
mutation updateKlaviyoListId($id: ID!, $klaviyoListId: String!) {
	metaobjectUpdate(
		id: $id
		metaobject: { fields: [{ key: "klaviyo_list_id", value: $klaviyoListId }] }
	) {
		userErrors {
			field
			message
		}
	}
}
`;

export async function updateKlaviyoListId(
  dropId: string,
  klaviyoListId: string
) {
  const response = await fetch(
    `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/2024-01/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN || "",
      },
      body: JSON.stringify({
        query: updateKlaviyoListIdMutation,
        variables: {
          id: dropId,
          klaviyoListId,
        },
      }),
    }
  );
  const { data } = await response.json();
  console.log(data.metaobjectUpdate.userErrors);
}

const productIdRegex = /^gid:\/\/shopify\/Product\/(\d+)$/;

export function parseProductId(productId: string) {
  const match = productId.match(productIdRegex);
  if (!match) {
    return null;
  }
  return match[1];
}

const metaobjectIdRegex = /^gid:\/\/shopify\/Metaobject\/(\d+)$/;

export function parseMetaobjectId(metaobjectId: string) {
  const match = metaobjectId.match(metaobjectIdRegex);
  if (!match) {
    return null;
  }
  return match[1];
}
