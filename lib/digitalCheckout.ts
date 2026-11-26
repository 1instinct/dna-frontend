// Digital products at checkout. A cart of only digital products skips the
// delivery step (no shipping address, no shipping rate), and buying one needs
// an account: the backend refuses a guest's order with 422
// `digital_requires_account` when it tries to leave the cart.
//
// Whether delivery is needed: the order's `checkout_steps`, when the API sends
// them, decide. Otherwise every line's product must be known digital
// (`digital_kind` from the product endpoint). Anything unknown keeps delivery:
// asking for an address too many is safe, skipping a needed one is not.

import { cartLineSlugs, spreeErrorText } from "./cartAvailability";

type CartDoc =
  | { data?: { attributes?: Record<string, any> }; included?: any[] }
  | null
  | undefined;

export const DIGITAL_REQUIRES_ACCOUNT = "digital_requires_account";

export const DIGITAL_ACCOUNT_MESSAGE =
  "Digital downloads are tied to your account, so you need to sign in to buy them.";

export function checkoutSteps(cart: CartDoc): string[] | null {
  const steps = cart?.data?.attributes?.checkout_steps;
  return Array.isArray(steps) ? steps.map(String) : null;
}

export function cartNeedsDelivery(
  cart: CartDoc,
  digitalSlugs: string[] | undefined
): boolean {
  const steps = checkoutSteps(cart);
  if (steps) return steps.includes("delivery");
  const slugs = cartLineSlugs(cart);
  if (!slugs.length || !digitalSlugs) return true;
  return !slugs.every((s) => digitalSlugs.includes(s));
}

export function cartHasDigital(
  cart: CartDoc,
  digitalSlugs: string[] | undefined
): boolean {
  if (!digitalSlugs?.length) return false;
  return cartLineSlugs(cart).some((s) => digitalSlugs.includes(s));
}

export function isDigitalRequiresAccountError(err: unknown): boolean {
  if (!err) return false;
  const e = err as {
    code?: unknown;
    summary?: unknown;
    message?: unknown;
    body?: unknown;
    serverResponse?: { data?: unknown };
  };
  const parts = [
    e.code,
    e.summary,
    e.message,
    e.body && JSON.stringify(e.body),
    e.serverResponse?.data && JSON.stringify(e.serverResponse.data)
  ];
  return parts.some(
    (p) => typeof p === "string" && p.includes(DIGITAL_REQUIRES_ACCOUNT)
  );
}

export const loginRedirectFor = (path: string): string =>
  `/login?redirect=${encodeURIComponent(path)}`;

/**
 * The Error a checkout step throws for a Spree failure. Its message is what
 * the page shows; a `digital_requires_account` refusal keeps that code so
 * the page can send the guest to sign in.
 */
export function checkoutFailure(
  fail: unknown,
  fallback: string
): Error & { code?: string } {
  if (isDigitalRequiresAccountError(fail)) {
    const err: Error & { code?: string } = new Error(DIGITAL_ACCOUNT_MESSAGE);
    err.code = DIGITAL_REQUIRES_ACCOUNT;
    return err;
  }
  return new Error(spreeErrorText(fail) || fallback);
}
