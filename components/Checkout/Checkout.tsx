import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { Layout } from "../Layout";
import { Loading } from "../Loading";
import { useCart } from "../../hooks/useCart";
import { useProducts } from "../../hooks";
import { useAuth } from "../../config/auth";
import {
  useUpdateCheckout,
  useAdvanceCheckout,
  useCompleteCheckout,
  useEstimateShipping,
  useApplyCoupon,
  useRemoveCoupon,
  getShippingMethods,
  getPaymentMethods
} from "../../hooks/useCheckout";
import { IProducts } from "@spree/storefront-api-v2-sdk/types/interfaces/Product";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const inputClass =
  "w-full rounded-lg border border-border bg-background px-4 py-3 font-body text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

const labelClass =
  "mb-1.5 block font-title text-xs font-semibold uppercase tracking-wider text-muted-foreground";

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { user } = useAuth();
  const { data: cartData, isLoading: cartLoading } = useCart();
  const { data: productsData } = useProducts(1);

  const updateCheckoutMutation = useUpdateCheckout();
  const advanceCheckoutMutation = useAdvanceCheckout();
  const completeCheckoutMutation = useCompleteCheckout();
  const estimateShippingMutation = useEstimateShipping();
  const applyCouponMutation = useApplyCoupon();
  const removeCouponMutation = useRemoveCoupon();

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipcode: "",
    country: "US",
    phone: "",
    sameAsShipping: true,
    billFirstName: "",
    billLastName: "",
    billAddress1: "",
    billAddress2: "",
    billCity: "",
    billState: "",
    billZipcode: "",
    billCountry: "US",
    billPhone: ""
  });

  const [couponCode, setCouponCode] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [estimatedShipping, setEstimatedShipping] = useState<any>(null);
  const [selectedShippingRate, setSelectedShippingRate] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, sameAsShipping: e.target.checked }));
  };

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await getPaymentMethods();
        setPaymentMethods(response);
        if (response?.data?.[0]) {
          setSelectedPaymentMethod(response.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch payment methods:", err);
      }
    };
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    if (
      formData.country &&
      formData.state &&
      formData.city &&
      formData.zipcode
    ) {
      const timer = setTimeout(() => {
        estimateShippingMutation.mutate(
          {
            country_iso: formData.country,
            state_name: formData.state,
            city: formData.city,
            zipcode: formData.zipcode
          },
          {
            onSuccess: (data) => {
              setEstimatedShipping(data);
              if (data?.data?.[0]) {
                setSelectedShippingRate(data.data[0]);
              }
            }
          }
        );
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.country, formData.state, formData.city, formData.zipcode]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      await applyCouponMutation.mutateAsync(couponCode);
      setCouponCode("");
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to apply coupon");
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCouponMutation.mutateAsync(undefined);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to remove coupon");
    }
  };

  const handleRecalculateShipping = async () => {
    if (!formData.country || !formData.state || !formData.city || !formData.zipcode) {
      setError("Please fill in the complete shipping address first");
      return;
    }
    try {
      const data = await estimateShippingMutation.mutateAsync({
        country_iso: formData.country,
        state_name: formData.state,
        city: formData.city,
        zipcode: formData.zipcode
      });
      setEstimatedShipping(data);
      setSelectedShippingRate(null);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to calculate shipping");
    }
  };

  const foundProduct = (productId: string, productsData: IProducts) => {
    if (!productsData || !Array.isArray(productsData.data)) return null;
    for (const product of productsData.data) {
      if (
        product.relationships?.variants &&
        Array.isArray(product.relationships.variants.data)
      ) {
        const variant = product.relationships.variants.data.find(
          (variant) => variant.id === productId
        );
        if (variant) return product;
      }
    }
    return null;
  };

  const renderCartItems = () => {
    if (!Array.isArray(cartData?.included) || !productsData) return null;

    return cartData?.included
      .filter((item) => item.type === "line_item")
      .map((lineItem: any) => {
        const product = foundProduct(
          lineItem.relationships.variant.data.id,
          productsData
        );

        const variant = cartData?.included?.find(
          (item: any) =>
            item.type === "variant" &&
            item.id === lineItem.relationships.variant.data.id
        );
        const imageId = variant?.relationships?.images?.data?.[0]?.id;
        const image = cartData?.included?.find(
          (item: any) => item.type === "image" && item.id === imageId
        );
        const imageUrl = image?.attributes?.styles?.[5]?.url
          ? `${process.env.NEXT_PUBLIC_SPREE_API_URL}${image.attributes.styles[5].url}`
          : null;

        return (
          <div key={lineItem.id} className="flex items-center gap-3 border-b border-border/20 py-3">
            {imageUrl && (
              <img
                src={imageUrl}
                alt={product?.attributes?.name}
                className="h-14 w-14 rounded-md object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-title text-sm font-medium text-foreground">
                {product?.attributes?.name}
              </p>
              <p className="font-body text-xs text-muted-foreground">
                Qty: {lineItem.attributes.quantity}
              </p>
            </div>
            <span className="font-title text-sm font-semibold text-foreground">
              {lineItem.attributes.price}
            </span>
          </div>
        );
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError("");

    try {
      await updateCheckoutMutation.mutateAsync({
        order: {
          email: formData.email,
          ship_address_attributes: {
            firstname: formData.firstName,
            lastname: formData.lastName,
            address1: formData.address1,
            address2: formData.address2,
            city: formData.city,
            phone: formData.phone,
            zipcode: formData.zipcode,
            state_name: formData.state,
            country_iso: formData.country
          },
          bill_address_attributes: formData.sameAsShipping
            ? {
                firstname: formData.firstName,
                lastname: formData.lastName,
                address1: formData.address1,
                address2: formData.address2,
                city: formData.city,
                phone: formData.phone,
                zipcode: formData.zipcode,
                state_name: formData.state,
                country_iso: formData.country
              }
            : {
                firstname: formData.billFirstName,
                lastname: formData.billLastName,
                address1: formData.billAddress1,
                address2: formData.billAddress2,
                city: formData.billCity,
                phone: formData.billPhone,
                zipcode: formData.billZipcode,
                state_name: formData.billState,
                country_iso: formData.billCountry
              }
        }
      });

      await advanceCheckoutMutation.mutateAsync();

      const shippingMethodsResponse = await getShippingMethods();
      const firstShipment = shippingMethodsResponse?.data?.[0];
      const shippingRates = shippingMethodsResponse?.included?.filter(
        (item: any) => item.type === "shipping_rate"
      );
      const firstShippingRate = shippingRates?.[0];

      if (firstShipment && firstShippingRate) {
        await updateCheckoutMutation.mutateAsync({
          order: {
            shipments_attributes: [
              {
                id: firstShipment.id,
                selected_shipping_rate_id: firstShippingRate.id
              }
            ]
          }
        });
        await advanceCheckoutMutation.mutateAsync();
      }

      if (selectedPaymentMethod && stripe && elements) {
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) throw new Error("Card element not found");

        const { token, error } = await stripe.createToken(cardElement, {
          name: `${formData.firstName} ${formData.lastName}`,
          address_line1: formData.billAddress1 || formData.address1,
          address_line2: formData.billAddress2 || formData.address2,
          address_city: formData.billCity || formData.city,
          address_state: formData.billState || formData.state,
          address_zip: formData.billZipcode || formData.zipcode,
          address_country: formData.billCountry || formData.country
        });

        if (error) throw new Error(error.message);

        await updateCheckoutMutation.mutateAsync({
          order: {
            payments_attributes: [
              {
                payment_method_id: selectedPaymentMethod.id,
                source_attributes: {
                  gateway_payment_profile_id: token.id,
                  cc_type: token.card?.brand,
                  last_digits: token.card?.last4,
                  month: token.card?.exp_month?.toString(),
                  year: token.card?.exp_year?.toString(),
                  name: token.card?.name ?? undefined
                }
              }
            ]
          }
        });

        await advanceCheckoutMutation.mutateAsync();
      }

      const completedOrder = await completeCheckoutMutation.mutateAsync();
      const storage = (await import("../../config/storage")).default;
      const guestToken = await storage.getGuestOrderToken();
      const orderNumber = completedOrder.data.attributes.number;
      if (guestToken) {
        router.push(`/thank-you?order=${orderNumber}&token=${guestToken}`);
      } else {
        router.push(`/thank-you?order=${orderNumber}`);
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Failed to complete checkout. Please try again.");
      setProcessing(false);
    }
  };

  if (cartLoading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  const {
    item_count = 0,
    display_item_total,
    included_tax_total,
    display_ship_total,
    display_total,
    promo_total
  } = cartData?.data?.attributes || {};

  const shippingCost =
    selectedShippingRate?.attributes?.display_cost ||
    display_ship_total ||
    "$0.00";

  return (
    <Layout>
      <div className="section-container py-8">
        <h1 className="mb-2 font-title text-2xl font-bold text-foreground md:text-3xl">
          Checkout
        </h1>

        {!user && (
          <p className="mb-6 font-body text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login?redirect=/checkout"
              className="font-semibold text-brand underline transition-colors hover:text-brand/80"
            >
              Login
            </Link>{" "}
            to checkout faster.
          </p>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact */}
            <section className="rounded-xl border border-border/30 bg-card p-6">
              <h2 className="mb-4 font-title text-base font-semibold text-foreground">
                Contact Information
              </h2>
              <div>
                <label htmlFor="email" className={labelClass}>Email Address *</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="you@example.com" className={inputClass} />
              </div>
            </section>

            {/* Payment Method */}
            <section className="rounded-xl border border-border/30 bg-card p-6">
              <h2 className="mb-4 font-title text-base font-semibold text-foreground">
                Payment Method
              </h2>
              {paymentMethods?.data?.length > 0 ? (
                <div className="space-y-2">
                  {paymentMethods.data.map((method: any) => (
                    <label
                      key={method.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/30 p-3 transition-colors hover:bg-muted/50"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedPaymentMethod?.id === method.id}
                        onChange={() => setSelectedPaymentMethod(method)}
                        className="accent-brand"
                      />
                      <span className="font-body text-sm text-foreground">
                        {method.attributes.name}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="font-body text-sm text-muted-foreground">Loading payment methods...</p>
              )}
            </section>

            {/* Card Details */}
            <section className="rounded-xl border border-border/30 bg-card p-6">
              <h2 className="mb-4 font-title text-base font-semibold text-foreground">
                Card Details
              </h2>
              <div>
                <label className={labelClass}>Card Information *</label>
                <div className="rounded-lg border border-border bg-background p-3">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#424770",
                          "::placeholder": { color: "#aab7c4" }
                        },
                        invalid: { color: "#9e2146" }
                      }
                    }}
                  />
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section className="space-y-4 rounded-xl border border-border/30 bg-card p-6">
              <h2 className="font-title text-base font-semibold text-foreground">
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className={labelClass}>First Name *</label>
                  <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="lastName" className={labelClass}>Last Name *</label>
                  <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="address1" className={labelClass}>Address *</label>
                <input type="text" id="address1" name="address1" value={formData.address1} onChange={handleInputChange} required placeholder="Street address" className={inputClass} />
              </div>
              <div>
                <label htmlFor="address2" className={labelClass}>Apartment, suite, etc. (optional)</label>
                <input type="text" id="address2" name="address2" value={formData.address2} onChange={handleInputChange} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="city" className={labelClass}>City *</label>
                  <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="state" className={labelClass}>State *</label>
                  <input type="text" id="state" name="state" value={formData.state} onChange={handleInputChange} required placeholder="CA" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="zipcode" className={labelClass}>ZIP Code *</label>
                  <input type="text" id="zipcode" name="zipcode" value={formData.zipcode} onChange={handleInputChange} required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="country" className={labelClass}>Country *</label>
                  <select id="country" name="country" value={formData.country} onChange={handleInputChange} required className={inputClass}>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>Phone Number *</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required className={inputClass} />
              </div>
            </section>

            {/* Shipping Rates */}
            {estimatedShipping?.data && estimatedShipping.data.length > 0 && (
              <section className="rounded-xl border border-border/30 bg-card p-6">
                <h2 className="mb-4 font-title text-base font-semibold text-foreground">
                  Shipping Method
                </h2>
                <div className="space-y-2">
                  {estimatedShipping.data.map((rate: any) => (
                    <label
                      key={rate.attributes.shipping_method_id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/30 p-3 transition-colors hover:bg-muted/50"
                    >
                      <input
                        type="radio"
                        name="shippingRate"
                        value={rate.attributes.shipping_method_id}
                        checked={selectedShippingRate?.attributes?.shipping_method_id === rate.attributes.shipping_method_id}
                        onChange={() => setSelectedShippingRate(rate)}
                        className="accent-brand"
                      />
                      <span className="font-body text-sm text-foreground">
                        {rate.attributes.name} - {rate.attributes.display_cost}
                      </span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleRecalculateShipping}
                  disabled={estimateShippingMutation.isLoading}
                  className="mt-3 rounded-lg bg-muted px-4 py-2 font-title text-xs font-semibold text-foreground transition-colors hover:bg-muted-foreground/20"
                >
                  {estimateShippingMutation.isLoading ? "Calculating..." : "Recalculate Shipping"}
                </button>
              </section>
            )}

            {/* Billing Address */}
            <section className="space-y-4 rounded-xl border border-border/30 bg-card p-6">
              <h2 className="font-title text-base font-semibold text-foreground">
                Billing Address
              </h2>
              <label className="flex cursor-pointer items-center gap-2 font-body text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={formData.sameAsShipping}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded accent-brand"
                />
                Same as shipping address
              </label>
              {!formData.sameAsShipping && (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="billFirstName" className={labelClass}>First Name *</label>
                      <input type="text" id="billFirstName" name="billFirstName" value={formData.billFirstName} onChange={handleInputChange} required className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="billLastName" className={labelClass}>Last Name *</label>
                      <input type="text" id="billLastName" name="billLastName" value={formData.billLastName} onChange={handleInputChange} required className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="billAddress1" className={labelClass}>Address *</label>
                    <input type="text" id="billAddress1" name="billAddress1" value={formData.billAddress1} onChange={handleInputChange} required className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="billAddress2" className={labelClass}>Apartment, suite, etc. (optional)</label>
                    <input type="text" id="billAddress2" name="billAddress2" value={formData.billAddress2} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="billCity" className={labelClass}>City *</label>
                      <input type="text" id="billCity" name="billCity" value={formData.billCity} onChange={handleInputChange} required className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="billState" className={labelClass}>State *</label>
                      <input type="text" id="billState" name="billState" value={formData.billState} onChange={handleInputChange} required className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="billZipcode" className={labelClass}>ZIP Code *</label>
                      <input type="text" id="billZipcode" name="billZipcode" value={formData.billZipcode} onChange={handleInputChange} required className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="billCountry" className={labelClass}>Country *</label>
                      <select id="billCountry" name="billCountry" value={formData.billCountry} onChange={handleInputChange} required className={inputClass}>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="billPhone" className={labelClass}>Phone Number *</label>
                    <input type="tel" id="billPhone" name="billPhone" value={formData.billPhone} onChange={handleInputChange} required className={inputClass} />
                  </div>
                </>
              )}
            </section>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 font-body text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={processing}
              className="w-full rounded-xl bg-brand px-8 py-4 font-title text-base font-semibold uppercase tracking-wider text-white transition-all hover:bg-brand/90 hover:-translate-y-px hover:shadow-lg active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
            >
              {processing ? "Processing..." : "Complete Order"}
            </button>
          </form>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24">
            <div className="rounded-xl border border-border/30 bg-card p-6">
              <h2 className="mb-4 font-title text-base font-semibold text-foreground">
                Order Summary ({item_count} items)
              </h2>

              <div>{renderCartItems()}</div>

              {/* Coupon */}
              <div className="mt-5 border-t border-border/20 pt-4">
                <label htmlFor="coupon" className={labelClass}>Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || applyCouponMutation.isLoading}
                    className="rounded-lg bg-brand px-4 py-2 font-title text-xs font-semibold text-white transition-colors hover:bg-brand/90 disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
                {promo_total && (
                  <div className="mt-2 flex items-center gap-2 font-body text-xs text-green-600">
                    Coupon applied! Discount: {promo_total}
                    <button
                      onClick={handleRemoveCoupon}
                      className="border-none bg-transparent text-xs text-destructive underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="mt-5 space-y-2 border-t border-border/20 pt-4">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="text-foreground">{display_item_total}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span className="text-foreground">
                    {estimateShippingMutation.isLoading ? "Calculating..." : shippingCost}
                  </span>
                </div>
                {promo_total && (
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Discount:</span>
                    <span className="text-green-600">{promo_total}</span>
                  </div>
                )}
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Tax:</span>
                  <span className="text-foreground">{included_tax_total}</span>
                </div>
                <div className="flex justify-between border-t border-border/20 pt-3 font-title text-lg font-bold text-foreground">
                  <span>Total:</span>
                  <span>{display_total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const Checkout = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};
