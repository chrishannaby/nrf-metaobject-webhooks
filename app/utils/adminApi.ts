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
		referencedBy(first: 100) {
			edges {
				node {
					referencer {
						... on Product {
							id
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
      referencedBy: Connection<{
        referencer: {
          id: string;
        };
      }>;
    };
  };
  variables: {
    id: string;
  };
};

export async function getDrop(dropId: string) {
  const response = await queryAdminApi<GetDropOperation>(dropQuery, {
    id: dropId,
  });

  return {
    id: dropId,
    name: response.body.data.metaobject.displayName,
    products: response.body.data.metaobject.referencedBy.edges.map(
      (edge) => edge.node.referencer.id
    ),
  };
}

type FlowTriggerPayload = {
  Drop: {
    id: string;
    name: string;
    products: Array<{ productId: string }>;
  };
};

const flowTriggerQuery = `
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
        query: flowTriggerQuery,
        variables: {
          handle: triggerHandle,
          payload,
        },
      }),
    }
  );
  const { data } = await response.json();
  console.log(data.flowTriggerReceive.userErrors);
}

const productIdRegex = /^gid:\/\/shopify\/Product\/(\d+)$/;

export function parseProductId(productId: string) {
  const match = productId.match(productIdRegex);
  if (!match) {
    return null;
  }
  return match[1];
}
