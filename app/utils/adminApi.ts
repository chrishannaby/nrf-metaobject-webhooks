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

const drawQuery = `
query drawQuery($id: ID!) {
	metaobject(id: $id) {
    displayName
		handle
		product: field(key: "product") {
			value
     	reference {
				... on Product {
					variants(first: 1) {
						nodes {
							id
						}
					}
				}
			} 
		}
		numberAvailable: field(key: "number_available") {
			value
		}
    secret: field(key: "secret") {
      value
    }
	}
}
`;

type GetDrawOperation = {
  data: {
    metaobject: {
      id: string;
      displayName: string;
      product: {
        value: string;
        reference: {
          variants: {
            nodes: Array<{
              id: string;
            }>;
          };
        };
      };
      numberAvailable: {
        value: number;
      };
      secret: {
        value: string;
      };
    };
  };
  variables: {
    id: string;
  };
};

export async function getDraw(drawId: string): Promise<{
  id: string;
  name: string;
  productId: string;
  variantId: string;
  numberAvailable: number;
  secret: string;
}> {
  const response = await queryAdminApi<GetDrawOperation>(drawQuery, {
    id: drawId,
  });

  const metaobject = response.body.data.metaobject;

  return {
    id: drawId,
    name: metaobject.displayName,
    productId: metaobject.product.value,
    variantId: metaobject.product.reference.variants.nodes[0].id,
    numberAvailable: metaobject.numberAvailable.value,
    secret: metaobject.secret.value,
  };
}

type FlowTriggerPayload =
  | {
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
    }
  | { "Draft Order ID": string; "Auto Approve Threshold": number };

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
  return data;
}

const updateWinnersMutation = `
mutation addWinners($id: ID!, $winners: String!) {
  metaobjectUpdate(
    id: $id
    metaobject: { fields: [{key: "winners", value: $winners}]}
  ) {
    userErrors {
      field
      message
    }
  }
}
`;

type UpdateWinnersOperation = {
  data: {
    metaobjectUpdate: {
      userErrors: Array<{ field: string; message: string }>;
    };
  };
  variables: {
    id: string;
    winners: string;
  };
};

export async function updateWinners(drawId: string, winners: string[]) {
  const escapedWinners =
    "[" + winners.map((name) => `\\"${name}\\"`).join(",") + "]";

  const response = await queryAdminApi<UpdateWinnersOperation>(
    updateWinnersMutation,
    {
      id: drawId,
      winners: escapedWinners,
    }
  );
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

const draftOrderIdRegex = /^gid:\/\/shopify\/DraftOrder\/(\d+)$/;

export function parseDraftOrderId(draftOrderId: string) {
  const match = draftOrderId.match(draftOrderIdRegex);
  if (!match) {
    return null;
  }
  return match[1];
}

const getCustomerQuery = `
query getCustomer($query: String!) {
  customers(first: 1, query: $query){
    nodes {
			id
    }
  }
}
`;

type GetCustomerOperation = {
  data: {
    customers: {
      nodes: Array<{
        id: string;
      }>;
    };
  };
  variables: {
    query: string;
  };
};

export async function getCustomer(email: string): Promise<string> {
  const response = await queryAdminApi<GetCustomerOperation>(getCustomerQuery, {
    query: email,
  });

  const customers = response.body.data.customers.nodes;

  if (customers.length === 0) {
    return "";
  }

  return customers[0].id;
}

const createCustomerQuery = `
mutation createCustomer($input: CustomerInput!) {
  customerCreate(input: $input) {
    customer {
      id
    }
    userErrors {
      field
      message
    }
  }
}
`;

type CreateCustomerOperation = {
  data: {
    customerCreate: {
      customer: {
        id: string;
      };
      userErrors: Array<{
        field: string;
        message: string;
      }>;
    };
  };
  variables: {
    input: {
      email: string;
      tags: string;
      firstName: string;
      lastName: string;
      emailMarketingConsent: {
        marketingOptInLevel: string;
        marketingState: string;
      };
    };
  };
};

export async function createCustomer(
  email: string,
  tags: string,
  firstName: string,
  lastName: string
): Promise<string> {
  const response = await queryAdminApi<CreateCustomerOperation>(
    createCustomerQuery,
    {
      input: {
        email,
        tags,
        firstName,
        lastName,
        emailMarketingConsent: {
          marketingOptInLevel: "CONFIRMED_OPT_IN",
          marketingState: "SUBSCRIBED",
        },
      },
    }
  );

  const customer = response.body.data.customerCreate.customer;

  return customer.id;
}

const addTagsToCustomerQuery = `
mutation tagsAdd($id: ID!, $tags: [String!]!) {
  tagsAdd(id: $id, tags: $tags) {
    node {
      id
    }
    userErrors {
      field
      message
    }
  }
}
`;

type AddTagsToCustomerOperation = {
  data: {
    tagsAdd: {
      node: {
        id: string;
      };
      userErrors: Array<{
        field: string;
        message: string;
      }>;
    };
  };
  variables: {
    id: string;
    tags: string;
  };
};

export async function addTagsToCustomer(
  customerId: string,
  tags: string
): Promise<void> {
  const response = await queryAdminApi<AddTagsToCustomerOperation>(
    addTagsToCustomerQuery,
    {
      id: customerId,
      tags,
    }
  );

  const customer = response.body.data.tagsAdd.node;

  return;
}

const createDraftOrderQuery = `
mutation createDraftOrder($input: DraftOrderInput!) {
  draftOrderCreate(input: $input) {
    draftOrder {
      id
    }
    userErrors {
      field
      message
    }
  }
}
`;

type CreateDraftOrderOperation = {
  data: {
    draftOrderCreate: {
      draftOrder: {
        id: string;
      };
      userErrors: Array<{
        field: string;
        message: string;
      }>;
    };
  };
  variables: {
    input: {
      email: string;
      shippingLine: {
        title: string;
        price: number;
      };
      reserveInventoryUntil: string;
      lineItems: {
        variantId: string;
        quantity: number;
        appliedDiscount: {
          value: number;
          valueType: string;
          title: string;
        };
      };
    };
  };
};

type CreateDraftOrderInput = {
  email: string;
  shippingLine: {
    title: string;
    price: number;
  };
  reserveInventoryUntil: string;
  lineItems: {
    variantId: string;
    quantity: number;
    appliedDiscount: {
      value: number;
      valueType: string;
      title: string;
    };
  };
};

export async function createDraftOrder(
  input: CreateDraftOrderInput
): Promise<string> {
  const response = await queryAdminApi<CreateDraftOrderOperation>(
    createDraftOrderQuery,
    {
      input: {
        email: input.email,
        shippingLine: input.shippingLine,
        reserveInventoryUntil: input.reserveInventoryUntil,
        lineItems: input.lineItems,
      },
    }
  );

  const draftOrder = response.body.data.draftOrderCreate.draftOrder;

  return draftOrder.id;
}

const getDraftOrderQuery = `
query getDraftOrder($id: ID!) {
	draftOrder(id: $id) {
		id
		name
		invoiceUrl
    readyForApproval: metafield(
			key: "ready_for_approval"
			namespace: "custom"
		) {
			value
		}
		status: metafield(key: "status", namespace: "approval") {
      id
			value
		}
	}
}
`;

type GetDraftOrderOperation = {
  data: {
    draftOrder: {
      id: string;
      name: string;
      invoiceUrl: string;
      readyForApproval: {
        value: string;
      } | null;
      status: {
        id: string;
        value: string;
      } | null;
    };
  };
  variables: {
    id: string;
  };
};

export async function getDraftOrder(draftOrderId: string) {
  const response = await queryAdminApi<GetDraftOrderOperation>(
    getDraftOrderQuery,
    {
      id: draftOrderId,
    }
  );

  return response.body.data.draftOrder;
}

const updateDraftOrderQuery = `
mutation updateDraftOrderMetafields($input: DraftOrderInput!, $ownerId: ID!) {
  draftOrderUpdate(input: $input, id: $ownerId) {
    draftOrder {
      id
    }
    userErrors {
      message
      field
    }
  }
}

`;

type UpdateDraftOrderOperation = {
  data: {
    draftOrderUpdate: {
      draftOrder: {
        id: string;
      };
      userErrors: Array<{
        message: string;
        field: string;
      }>;
    };
  };
  variables: {
    input: {
      ownerId: string;
      input: { metafields: Array<{ id: string; value: string }> };
    };
  };
};

export async function updateDraftOrder(draftOrderId: string, status: string) {
  const response = await queryAdminApi<UpdateDraftOrderOperation>(
    updateDraftOrderQuery,
    {
      input: {
        ownerId: draftOrderId,
        input: {
          metafields: [
            {
              id: "gid://shopify/Metafield/33733584257046",
              value: status,
            },
          ],
        },
      },
    }
  );
  console.log("update draft order", response.body.data);
  return response;
}
