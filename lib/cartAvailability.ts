// Which cart lines can't be bought. The backend keeps a line whose product was
// hidden: it shows in the cart and can be removed, its quantity can't change, and
// checkout refuses it only at the last step. The cart has no flag for this, but
// each line carries its product's slug, and the product endpoint is the same
// answer the product page gets.

import { LookupOptions, lookupProduct } from "./slugRoute";

type CartDoc = { included?: any[] } | null | undefined;

const lineItems = (cart: CartDoc): any[] =>
  Array.isArray(cart?.included)
    ? (cart?.included as any[]).filter((item) => item?.type === "line_item")
    : [];

export const cartLineSlugs = (cart: CartDoc): string[] =>
  Array.from(
    new Set<string>(
      lineItems(cart)
        .map((line) => line.attributes?.slug)
        .filter(Boolean)
    )
  );

/** An API failure proves nothing, so it never blames a line. */
export async function findUnavailableSlugs(
  slugs: string[],
  options: LookupOptions
): Promise<string[]> {
  const found = await Promise.all(
    slugs.map(async (slug) => {
      const { status } = await lookupProduct(slug, options);
      return status === "hidden" || status === "missing" ? slug : null;
    })
  );
  return found.filter((slug): slug is string => slug !== null);
}

export interface UnavailableLine {
  id: string;
  name: string;
}

export const unavailableCartLines = (
  cart: CartDoc,
  unavailableSlugs: string[] | undefined
): UnavailableLine[] =>
  lineItems(cart)
    .filter((line) => unavailableSlugs?.includes(line.attributes?.slug))
    .map((line) => ({ id: line.id, name: line.attributes?.name || "" }));

/** The SDK's own message is only "Spree returned a HTTP 422 error code". */
export const spreeErrorText = (err: unknown): string => {
  const e = (err || {}) as { summary?: string; message?: string };
  return e.summary || e.message || "";
};

export const LINE_NOT_BUYABLE_MESSAGE =
  "An item in your cart is out of stock or no longer available. Review your cart to continue.";

const LINE_NOT_BUYABLE =
  /insufficient (quantity|stock)|no longer available|this item is not available|become unavailable|quantity selected/i;

export const isLineNotBuyableError = (text: string): boolean =>
  LINE_NOT_BUYABLE.test(text);

export const checkoutErrorMessage = (err: unknown): string => {
  const text = spreeErrorText(err);
  if (isLineNotBuyableError(text)) return LINE_NOT_BUYABLE_MESSAGE;
  return text || "Failed to complete checkout. Please try again.";
};
