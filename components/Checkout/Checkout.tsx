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
import { Layout, Loading } from "../components";
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

import {
  CheckoutContainer,
  CheckoutTitle,
  CheckoutGrid,
  CheckoutForm as StyledCheckoutForm,
  Section,
  SectionTitle,
  FormRow,
  FormGroup,
  Label,
  Input,
  Select,
  OrderSummary,
  OrderTitle,
  OrderItem,
  OrderItemImage,
  OrderItemInfo,
  OrderItemName,
  OrderItemDetails,
  OrderItemPrice,
  OrderTotals,
  TotalRow,
  TotalLabel,
  TotalValue,
  GrandTotal,
  CheckoutButton,
  ErrorMessage,
  Checkbox,
  CheckboxLabel
} from "./Checkout.styles";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

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

  // Fetch payment methods on mount
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await getPaymentMethods();
        setPaymentMethods(response);
        // Auto-select first payment method
        if (response?.data?.[0]) {
          setSelectedPaymentMethod(response.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch payment methods:", err);
      }
    };
    fetchPaymentMethods();
  }, []);

  // Estimate shipping when address changes
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
              // Auto-select first shipping rate
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
    if (
      !formData.country ||
      !formData.state ||
      !formData.city ||
      !formData.zipcode
    ) {
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
      // Clear any previously selected shipping rate; require explicit user selection
      setSelectedShippingRate(null);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to calculate shipping");
    }
  };

  const foundProduct = (productId: string, productsData: IProducts) => {
    if (!productsData || !Array.isArray(productsData.data)) {
      return null;
    }

    for (const product of productsData.data) {
      if (
        product.relationships &&
        product.relationships.variants &&
        Array.isArray(product.relationships.variants.data)
      ) {
        const variant = product.relationships.variants.data.find(
          (variant) => variant.id === productId
        );
        if (variant) {
          return product;
        }
      }
    }
    return null;
  };

  const renderCartItems = () => {
    if (!Array.isArray(cartData?.included) || !productsData) {
      return null;
    }

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
          <OrderItem key={lineItem.id}>
            {imageUrl && (
              <OrderItemImage src={imageUrl} alt={product?.attributes?.name} />
            )}
            <OrderItemInfo>
              <OrderItemName>{product?.attributes?.name}</OrderItemName>
              <OrderItemDetails>
                Qty: {lineItem.attributes.quantity}
              </OrderItemDetails>
            </OrderItemInfo>
            <OrderItemPrice>{lineItem.attributes.price}</OrderItemPrice>
          </OrderItem>
        );
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError("");

    try {
      // Step 1: Update with email and addresses (moves to delivery state)
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

      // Step 2: Advance to delivery state
      await advanceCheckoutMutation.mutateAsync();

      // Step 3: Get actual shipping methods with shipment IDs
      const shippingMethodsResponse = await getShippingMethods();
      console.log(
        "Shipping methods response:",
        JSON.stringify(shippingMethodsResponse, null, 2)
      );

      // Get the first shipment from data array
      const firstShipment = shippingMethodsResponse?.data?.[0];

      // Find shipping rates in the included array
      const shippingRates = shippingMethodsResponse?.included?.filter(
        (item: any) => item.type === "shipping_rate"
      );
      const firstShippingRate = shippingRates?.[0];

      console.log("First shipment:", firstShipment);
      console.log("First shipping rate:", firstShippingRate);

      if (firstShipment && firstShippingRate) {
        // Update with selected shipping method using actual shipment ID and shipping rate ID
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

        // Advance to payment state after selecting shipping
        await advanceCheckoutMutation.mutateAsync();
      }

      // Step 4: Add payment method with Stripe token
      if (selectedPaymentMethod && stripe && elements) {
        console.log("Selected payment method:", selectedPaymentMethod);

        // Get card element
        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
          throw new Error("Card element not found");
        }

        // Create Stripe token
        const { token, error } = await stripe.createToken(cardElement, {
          name: `${formData.firstName} ${formData.lastName}`,
          address_line1: formData.billAddress1 || formData.address1,
          address_line2: formData.billAddress2 || formData.address2,
          address_city: formData.billCity || formData.city,
          address_state: formData.billState || formData.state,
          address_zip: formData.billZipcode || formData.zipcode,
          address_country: formData.billCountry || formData.country
        });

        if (error) {
          throw new Error(error.message);
        }

        console.log("Stripe token created with id:", token?.id);

        // Add payment with Stripe token as source
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

        // Advance to confirm state
        await advanceCheckoutMutation.mutateAsync();
      }

      // Step 5: Complete the order
      const completedOrder = await completeCheckoutMutation.mutateAsync();

      // Get order token for guest users to view order details
      const storage = (await import("../../config/storage")).default;
      const guestToken = await storage.getGuestOrderToken();

      // Redirect to thank you page with order number and token
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
      <CheckoutContainer>
        <CheckoutTitle>Checkout</CheckoutTitle>
        {!user && (
          <div>
            <p style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
              Already have an account?{" "}
              <Link
                href="/login?redirect=/checkout"
                style={{
                  textDecoration: "underline",
                  fontWeight: "bold"
                }}
              >
                Login
              </Link>{" "}
              to checkout faster with saved addresses and payment methods.
            </p>
          </div>
        )}

        <CheckoutGrid>
          <StyledCheckoutForm as="form" onSubmit={handleSubmit}>
            {/* Contact Information */}
            <Section>
              <SectionTitle>Contact Information</SectionTitle>
              <FormGroup>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="you@example.com"
                />
              </FormGroup>
            </Section>
            {/* Payment Method Selection */}
            <Section>
              <SectionTitle>Payment Method</SectionTitle>
              {paymentMethods &&
              paymentMethods.data &&
              paymentMethods.data.length > 0 ? (
                <div>
                  {paymentMethods.data.map((method: any) => (
                    <FormGroup key={method.id}>
                      <CheckboxLabel>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selectedPaymentMethod?.id === method.id}
                          onChange={() => setSelectedPaymentMethod(method)}
                          style={{ marginRight: "8px" }}
                        />
                        {method.attributes.name}
                      </CheckboxLabel>
                    </FormGroup>
                  ))}
                </div>
              ) : (
                <p>Loading payment methods...</p>
              )}
            </Section>

            {/* Credit Card Details */}
            <Section>
              <SectionTitle>Card Details</SectionTitle>
              <FormGroup>
                <Label>Card Information *</Label>
                <div
                  style={{
                    padding: "12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    backgroundColor: "white"
                  }}
                >
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#424770",
                          "::placeholder": {
                            color: "#aab7c4"
                          }
                        },
                        invalid: {
                          color: "#9e2146"
                        }
                      }
                    }}
                  />
                </div>
              </FormGroup>
            </Section>
            {/* Shipping Address */}
            <Section>
              <SectionTitle>Shipping Address</SectionTitle>
              <FormRow>
                <FormGroup>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label htmlFor="address1">Address *</Label>
                <Input
                  type="text"
                  id="address1"
                  name="address1"
                  value={formData.address1}
                  onChange={handleInputChange}
                  required
                  placeholder="Street address"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="address2">
                  Apartment, suite, etc. (optional)
                </Label>
                <Input
                  type="text"
                  id="address2"
                  name="address2"
                  value={formData.address2}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    placeholder="CA"
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label htmlFor="zipcode">ZIP Code *</Label>
                  <Input
                    type="text"
                    id="zipcode"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="country">Country *</Label>
                  <Select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                  </Select>
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
            </Section>

            {/* Shipping Rates */}
            {estimatedShipping?.data && estimatedShipping.data.length > 0 && (
              <Section>
                <SectionTitle>Shipping Method</SectionTitle>
                {estimatedShipping.data.map((rate: any) => (
                  <CheckboxLabel
                    key={rate.attributes.shipping_method_id}
                    style={{ marginBottom: "10px" }}
                  >
                    <input
                      type="radio"
                      name="shippingRate"
                      value={rate.attributes.shipping_method_id}
                      checked={
                        selectedShippingRate?.attributes?.shipping_method_id ===
                        rate.attributes.shipping_method_id
                      }
                      onChange={() => setSelectedShippingRate(rate)}
                      style={{ marginRight: "8px" }}
                    />
                    {rate.attributes.name} - {rate.attributes.display_cost}
                  </CheckboxLabel>
                ))}
                <CheckoutButton
                  type="button"
                  onClick={handleRecalculateShipping}
                  disabled={estimateShippingMutation.isLoading}
                  style={{
                    width: "auto",
                    padding: "12px 20px",
                    marginTop: "10px"
                  }}
                >
                  {estimateShippingMutation.isLoading
                    ? "Calculating..."
                    : "Recalculate Shipping"}
                </CheckoutButton>
              </Section>
            )}

            {/* Billing Address */}
            <Section>
              <SectionTitle>Billing Address</SectionTitle>
              <CheckboxLabel>
                <Checkbox
                  type="checkbox"
                  checked={formData.sameAsShipping}
                  onChange={handleCheckboxChange}
                />
                Same as shipping address
              </CheckboxLabel>

              {!formData.sameAsShipping && (
                <>
                  <FormRow>
                    <FormGroup>
                      <Label htmlFor="billFirstName">First Name *</Label>
                      <Input
                        type="text"
                        id="billFirstName"
                        name="billFirstName"
                        value={formData.billFirstName}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label htmlFor="billLastName">Last Name *</Label>
                      <Input
                        type="text"
                        id="billLastName"
                        name="billLastName"
                        value={formData.billLastName}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                  </FormRow>

                  <FormGroup>
                    <Label htmlFor="billAddress1">Address *</Label>
                    <Input
                      type="text"
                      id="billAddress1"
                      name="billAddress1"
                      value={formData.billAddress1}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="billAddress2">
                      Apartment, suite, etc. (optional)
                    </Label>
                    <Input
                      type="text"
                      id="billAddress2"
                      name="billAddress2"
                      value={formData.billAddress2}
                      onChange={handleInputChange}
                    />
                  </FormGroup>

                  <FormRow>
                    <FormGroup>
                      <Label htmlFor="billCity">City *</Label>
                      <Input
                        type="text"
                        id="billCity"
                        name="billCity"
                        value={formData.billCity}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label htmlFor="billState">State *</Label>
                      <Input
                        type="text"
                        id="billState"
                        name="billState"
                        value={formData.billState}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup>
                      <Label htmlFor="billZipcode">ZIP Code *</Label>
                      <Input
                        type="text"
                        id="billZipcode"
                        name="billZipcode"
                        value={formData.billZipcode}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label htmlFor="billCountry">Country *</Label>
                      <Select
                        id="billCountry"
                        name="billCountry"
                        value={formData.billCountry}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                      </Select>
                    </FormGroup>
                  </FormRow>

                  <FormGroup>
                    <Label htmlFor="billPhone">Phone Number *</Label>
                    <Input
                      type="tel"
                      id="billPhone"
                      name="billPhone"
                      value={formData.billPhone}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                </>
              )}
            </Section>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <CheckoutButton type="submit" disabled={processing}>
              {processing ? "Processing..." : "Complete Order"}
            </CheckoutButton>
          </StyledCheckoutForm>

          {/* Order Summary */}
          <OrderSummary>
            <OrderTitle>Order Summary ({item_count} items)</OrderTitle>

            {renderCartItems()}

            {/* Coupon Code */}
            <Section>
              <FormGroup style={{ marginTop: "20px" }}>
                <Label htmlFor="coupon">Coupon Code</Label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Input
                    type="text"
                    id="coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    style={{ flex: 1 }}
                  />
                  <CheckoutButton
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={
                      !couponCode.trim() || applyCouponMutation.isLoading
                    }
                    style={{
                      width: "auto",
                      padding: "12px 20px",
                      marginTop: 0
                    }}
                  >
                    Apply
                  </CheckoutButton>
                </div>
                {promo_total && (
                  <div
                    style={{
                      marginTop: "10px",
                      fontSize: "14px",
                      color: "green"
                    }}
                  >
                    Coupon applied! Discount: {promo_total}
                    <button
                      onClick={handleRemoveCoupon}
                      style={{
                        marginLeft: "10px",
                        background: "none",
                        border: "none",
                        color: "red",
                        cursor: "pointer",
                        textDecoration: "underline"
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </FormGroup>
            </Section>

            <OrderTotals>
              <TotalRow>
                <TotalLabel>Subtotal:</TotalLabel>
                <TotalValue>{display_item_total}</TotalValue>
              </TotalRow>
              <TotalRow>
                <TotalLabel>Shipping:</TotalLabel>
                <TotalValue>
                  {estimateShippingMutation.isLoading
                    ? "Calculating..."
                    : shippingCost}
                </TotalValue>
              </TotalRow>
              {promo_total && (
                <TotalRow>
                  <TotalLabel>Discount:</TotalLabel>
                  <TotalValue style={{ color: "green" }}>
                    {promo_total}
                  </TotalValue>
                </TotalRow>
              )}
              <TotalRow>
                <TotalLabel>Tax:</TotalLabel>
                <TotalValue>{included_tax_total}</TotalValue>
              </TotalRow>
              <GrandTotal>
                <span>Total:</span>
                <span>{display_total}</span>
              </GrandTotal>
            </OrderTotals>
          </OrderSummary>
        </CheckoutGrid>
      </CheckoutContainer>
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
