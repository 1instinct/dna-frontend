import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useCart } from "@hooks/useCart";
import { useMutation, useQueryClient } from "react-query";
import { removeItemFromCart } from "@hooks/useCart";
import { QueryKeys } from "@hooks/queryKeys";
import { useAuth } from "@config/auth";
import { useAddresses } from "@hooks/useAccounts";
import {
  useUpdateCheckout,
  useAdvanceCheckout,
  useCompleteCheckout,
  getShippingMethods,
  getPaymentMethods
} from "@hooks/useCheckout";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import Image from "next/image";
import { LoginDialog } from "@components/Login/LoginDialog";
import { cn } from "@lib/utils";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const addressSchema = Yup.object({
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  address1: Yup.string().required("Required"),
  city: Yup.string().required("Required"),
  state: Yup.string().required("Required"),
  zipcode: Yup.string().required("Required"),
  phone: Yup.string().required("Required")
});

const CheckoutWizard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuth();
  const { data: cartData } = useCart();
  const { data: addressesData } = useAddresses();
  const queryClient = useQueryClient();

  const removeFromCartMutation = useMutation(
    (lineItemId: string) => removeItemFromCart(lineItemId),
    {
      onSuccess: (data) => {
        console.log("Item removed successfully:", data);
        queryClient.invalidateQueries(QueryKeys.CART);
      },
      onError: (error: any) => {
        console.error("Failed to remove item from cart:", error);
        alert(`Failed to remove item: ${error.message || "Unknown error"}`);
      }
    }
  );

  const updateCheckoutMutation = useUpdateCheckout();
  const advanceCheckoutMutation = useAdvanceCheckout();
  const completeCheckoutMutation = useCompleteCheckout();

  const [currentStep, setCurrentStep] = useState(0);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const cartItems =
    cartData?.included?.filter((item: any) => item.type === "line_item") || [];
  const displayTotal = cartData?.data?.attributes?.display_total || "$0.00";
  const savedAddresses = addressesData?.data || [];

  if (!user) {
    return (
      <>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="px-5 py-10 text-center">
            <div className="mb-4 text-5xl">🔒</div>
            <div className="mb-2 text-base text-foreground">Login Required</div>
            <div className="mb-6 text-sm text-muted-foreground">
              Please login to complete your purchase
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90"
              >
                Keep Shopping
              </button>
              <button
                onClick={() => setShowLoginDialog(true)}
                className="flex-1 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90"
              >
                Login
              </button>
            </div>
          </div>
        </div>

        <LoginDialog
          isOpen={showLoginDialog}
          onClose={() => setShowLoginDialog(false)}
          onSuccess={() => {
            queryClient.invalidateQueries(QueryKeys.CART);
          }}
        />
      </>
    );
  }

  const handleRemoveItem = (lineItemId: string) => {
    console.log("Removing item:", lineItemId);
    removeFromCartMutation.mutate(lineItemId);
  };

  const loadShippingMethods = async () => {
    try {
      const response = await getShippingMethods();
      const shippingRates =
        response?.included?.filter(
          (item: any) => item.type === "shipping_rate"
        ) || [];
      setShippingMethods(shippingRates);
      if (shippingRates.length > 0) {
        setSelectedShipping(shippingRates[0].id);
      }
    } catch (error) {
      console.error("Failed to load shipping methods:", error);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const response = await getPaymentMethods();
      const methods = response?.data || [];
      setPaymentMethods(methods);
    } catch (error) {
      console.error("Failed to load payment methods:", error);
    }
  };

  const handleAddressSubmit = async (values: any) => {
    try {
      await updateCheckoutMutation.mutateAsync({
        order: {
          email: user?.data?.attributes?.email,
          bill_address_attributes: {
            firstname: values.firstName,
            lastname: values.lastName,
            address1: values.address1,
            address2: values.address2 || "",
            city: values.city,
            phone: values.phone,
            zipcode: values.zipcode,
            state_name: values.state,
            country_iso: "US"
          },
          ship_address_attributes: {
            firstname: values.firstName,
            lastname: values.lastName,
            address1: values.address1,
            address2: values.address2 || "",
            city: values.city,
            phone: values.phone,
            zipcode: values.zipcode,
            state_name: values.state,
            country_iso: "US"
          }
        }
      });

      await advanceCheckoutMutation.mutateAsync();
      await loadShippingMethods();
      setCurrentStep(2);
    } catch (error) {
      console.error("Address submission failed:", error);
    }
  };

  const handleSelectAddress = async (address: any) => {
    try {
      await updateCheckoutMutation.mutateAsync({
        order: {
          email: user?.data?.attributes?.email,
          bill_address_attributes: {
            firstname: address.attributes.firstname,
            lastname: address.attributes.lastname,
            address1: address.attributes.address1,
            address2: address.attributes.address2 || "",
            city: address.attributes.city,
            phone: address.attributes.phone,
            zipcode: address.attributes.zipcode,
            state_name: address.attributes.state_name,
            country_iso: address.attributes.country_iso || "US"
          },
          ship_address_attributes: {
            firstname: address.attributes.firstname,
            lastname: address.attributes.lastname,
            address1: address.attributes.address1,
            address2: address.attributes.address2 || "",
            city: address.attributes.city,
            phone: address.attributes.phone,
            zipcode: address.attributes.zipcode,
            state_name: address.attributes.state_name,
            country_iso: address.attributes.country_iso || "US"
          }
        }
      });

      await advanceCheckoutMutation.mutateAsync();
      await loadShippingMethods();
      setCurrentStep(2);
    } catch (error) {
      console.error("Address selection failed:", error);
    }
  };

  const handleShippingSubmit = async () => {
    try {
      const shipmentsData = cartData?.data?.relationships?.shipments?.data;
      const shipment = Array.isArray(shipmentsData)
        ? shipmentsData[0]
        : shipmentsData;
      if (shipment && selectedShipping) {
        await updateCheckoutMutation.mutateAsync({
          order: {
            shipments_attributes: [
              {
                id: shipment.id,
                selected_shipping_rate_id: selectedShipping
              }
            ]
          }
        });
      }

      await advanceCheckoutMutation.mutateAsync();
      await loadPaymentMethods();
      setCurrentStep(3);
    } catch (error) {
      console.error("Shipping submission failed:", error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-5">
      {/* Step Indicator */}
      <div className="mb-5 flex justify-between gap-2">
        {[0, 1, 2, 3].map((step) => (
          <div
            key={step}
            className={cn(
              "h-1 flex-1 rounded-full transition-all",
              currentStep > step
                ? "bg-brand"
                : currentStep === step
                ? "bg-brand/60"
                : "bg-white/20"
            )}
          />
        ))}
      </div>

      {/* Step 0: Cart Review */}
      {currentStep === 0 && (
        <>
          <h3 className="m-0 mb-4 text-lg font-semibold text-foreground">
            Your Cart ({cartItems.length})
          </h3>

          {cartItems.map((item: any) => {
            const variant = cartData?.included?.find(
              (inc: any) =>
                inc.type === "variant" &&
                inc.id === item.relationships?.variant?.data?.id
            );
            const image = variant?.attributes?.images?.[0]?.url;

            return (
              <div
                key={item.id}
                className="flex gap-3 border-b border-white/10 py-3"
              >
                <div className="h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-lg bg-white/5">
                  {image && (
                    <Image
                      src={image}
                      alt={item.attributes?.name || "Product"}
                      width={60}
                      height={60}
                      style={{ objectFit: "cover" }}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 truncate text-sm font-medium text-foreground">
                    {item.attributes?.name}
                  </div>
                  <div className="text-[13px] text-brand">
                    {item.attributes?.quantity} &times;{" "}
                    {item.attributes?.display_price}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveItem(item.id);
                  }}
                  disabled={removeFromCartMutation.isLoading}
                  className="border-none bg-transparent p-1 text-lg text-destructive hover:opacity-70"
                >
                  &times;
                </button>
              </div>
            );
          })}

          <div className="mt-3 flex justify-between border-t border-white/10 pt-3">
            <span className="text-sm font-medium text-muted-foreground">
              Total
            </span>
            <span className="text-base font-semibold text-foreground">
              {displayTotal}
            </span>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90"
            >
              Keep Shopping
            </button>
            <button
              onClick={() => setCurrentStep(1)}
              disabled={cartItems.length === 0}
              className="flex-1 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 disabled:translate-y-0"
            >
              Continue
            </button>
          </div>
        </>
      )}

      {/* Step 1: Shipping Address */}
      {currentStep === 1 && (
        <>
          <h3 className="m-0 mb-4 text-lg font-semibold text-foreground">
            Checkout - Shipping Address
          </h3>

          {!showNewAddressForm && savedAddresses.length > 0 && (
            <>
              {savedAddresses.map((address: any) => (
                <label
                  key={address.id}
                  className={cn(
                    "mb-3 block cursor-pointer rounded-lg border-2 p-3 transition-all hover:border-brand/60",
                    selectedAddress === address.id
                      ? "border-brand bg-white/5"
                      : "border-white/10 bg-transparent"
                  )}
                  onClick={() => setSelectedAddress(address.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "relative mt-0.5 h-5 w-5 flex-shrink-0 rounded-full border-2",
                        selectedAddress === address.id
                          ? "border-brand bg-brand"
                          : "border-white/30 bg-transparent"
                      )}
                    >
                      {selectedAddress === address.id && (
                        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 text-sm font-semibold text-foreground">
                        {address.attributes.firstname}{" "}
                        {address.attributes.lastname}
                      </div>
                      <div className="text-[13px] leading-relaxed text-muted-foreground">
                        {address.attributes.address1}
                      </div>
                      {address.attributes.address2 && (
                        <div className="text-[13px] leading-relaxed text-muted-foreground">
                          {address.attributes.address2}
                        </div>
                      )}
                      <div className="text-[13px] leading-relaxed text-muted-foreground">
                        {address.attributes.city},{" "}
                        {address.attributes.state_name}{" "}
                        {address.attributes.zipcode}
                      </div>
                      <div className="text-[13px] leading-relaxed text-muted-foreground">
                        {address.attributes.phone}
                      </div>
                    </div>
                  </div>
                </label>
              ))}

              <button
                onClick={() => setShowNewAddressForm(true)}
                className="mb-5 w-full cursor-pointer rounded-lg border-2 border-dashed border-white/20 bg-transparent p-3 text-sm font-semibold text-brand transition-all hover:border-brand hover:bg-white/5"
              >
                + Add New Address
              </button>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setCurrentStep(0)}
                  className="flex-1 rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    const address = savedAddresses.find(
                      (a: any) => a.id === selectedAddress
                    );
                    if (address) handleSelectAddress(address);
                  }}
                  disabled={!selectedAddress}
                  className="flex-1 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 disabled:translate-y-0"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {(showNewAddressForm || savedAddresses.length === 0) && (
            <Formik
              initialValues={{
                firstName: "",
                lastName: "",
                address1: "",
                address2: "",
                city: "",
                state: "",
                zipcode: "",
                phone: ""
              }}
              validationSchema={addressSchema}
              onSubmit={handleAddressSubmit}
            >
              {({ errors, touched }) => (
                <Form>
                  {savedAddresses.length > 0 && (
                    <button
                      onClick={() => setShowNewAddressForm(false)}
                      className="mb-4 rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90"
                      type="button"
                    >
                      &larr; Back to Saved Addresses
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="mb-4">
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        First Name
                      </label>
                      <Field
                        name="firstName"
                        className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                      />
                      {errors.firstName && touched.firstName && (
                        <div className="mt-1 text-xs text-destructive">
                          {errors.firstName}
                        </div>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Last Name
                      </label>
                      <Field
                        name="lastName"
                        className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                      />
                      {errors.lastName && touched.lastName && (
                        <div className="mt-1 text-xs text-destructive">
                          {errors.lastName}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Address
                    </label>
                    <Field
                      name="address1"
                      className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                    />
                    {errors.address1 && touched.address1 && (
                      <div className="mt-1 text-xs text-destructive">
                        {errors.address1}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Apartment, suite, etc. (optional)
                    </label>
                    <Field
                      name="address2"
                      className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="mb-4">
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        City
                      </label>
                      <Field
                        name="city"
                        className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                      />
                      {errors.city && touched.city && (
                        <div className="mt-1 text-xs text-destructive">
                          {errors.city}
                        </div>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        State
                      </label>
                      <Field
                        name="state"
                        className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                      />
                      {errors.state && touched.state && (
                        <div className="mt-1 text-xs text-destructive">
                          {errors.state}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="mb-4">
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        ZIP Code
                      </label>
                      <Field
                        name="zipcode"
                        className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                      />
                      {errors.zipcode && touched.zipcode && (
                        <div className="mt-1 text-xs text-destructive">
                          {errors.zipcode}
                        </div>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Phone
                      </label>
                      <Field
                        name="phone"
                        className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                      />
                      {errors.phone && touched.phone && (
                        <div className="mt-1 text-xs text-destructive">
                          {errors.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => setCurrentStep(0)}
                      type="button"
                      className="flex-1 rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90"
                    >
                      Modify Cart
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90"
                    >
                      Continue
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </>
      )}

      {/* Step 2: Shipping Method */}
      {currentStep === 2 && (
        <>
          <h3 className="m-0 mb-4 text-lg font-semibold text-foreground">
            Checkout - Shipping Method
          </h3>

          {shippingMethods.map((method: any) => (
            <label
              key={method.id}
              className={cn(
                "mb-2 flex cursor-pointer items-center gap-3 rounded-md border-2 p-3 transition-all hover:border-brand/60",
                selectedShipping === method.id
                  ? "border-brand bg-white/5"
                  : "border-white/10 bg-transparent"
              )}
            >
              <input
                type="radio"
                name="shipping"
                value={method.id}
                checked={selectedShipping === method.id}
                onChange={(e) => setSelectedShipping(e.target.value)}
                className="h-5 w-5 flex-shrink-0 cursor-pointer"
              />
              <div>
                <div className="text-sm font-medium text-foreground">
                  {method.attributes?.name}
                </div>
                <div className="mt-1 text-[13px] text-brand">
                  {method.attributes?.display_cost}
                </div>
              </div>
            </label>
          ))}

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex-1 rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90"
            >
              Back
            </button>
            <button
              onClick={handleShippingSubmit}
              disabled={!selectedShipping}
              className="flex-1 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 disabled:translate-y-0"
            >
              Continue
            </button>
          </div>
        </>
      )}

      {/* Step 3: Payment */}
      {currentStep === 3 && (
        <Elements stripe={stripePromise}>
          <PaymentStep
            onBack={() => setCurrentStep(2)}
            onComplete={(orderNum) => {
              setOrderNumber(orderNum);
              setCurrentStep(4);
            }}
          />
        </Elements>
      )}

      {/* Step 4: Confirmation */}
      {currentStep === 4 && (
        <div className="px-5 py-10 text-center">
          <div className="mb-4 text-5xl">🎉</div>
          <div className="mb-2 text-base text-foreground">Order Complete!</div>
          <div className="text-sm text-muted-foreground">
            Order #{orderNumber}
          </div>
          <div className="mt-5 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90"
            >
              Continue Watching
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentStep: React.FC<{
  onBack: () => void;
  onComplete: (orderNum: string) => void;
}> = ({ onBack, onComplete }) => {
  const stripe = useStripe();
  const elements = useElements();
  const updateCheckoutMutation = useUpdateCheckout();
  const advanceCheckoutMutation = useAdvanceCheckout();
  const completeCheckoutMutation = useCompleteCheckout();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement
      });

      if (error) {
        setError(error.message || "Payment failed");
        setProcessing(false);
        return;
      }

      await updateCheckoutMutation.mutateAsync({
        order: {
          payments_attributes: [
            {
              payment_method_id: paymentMethod.id,
              source_attributes: {
                gateway_payment_profile_id: paymentMethod.id,
                cc_type: paymentMethod.card?.brand,
                last_digits: paymentMethod.card?.last4,
                month: paymentMethod.card?.exp_month?.toString(),
                year: paymentMethod.card?.exp_year?.toString(),
                name: paymentMethod.billing_details?.name ?? undefined
              }
            }
          ]
        }
      });

      await advanceCheckoutMutation.mutateAsync();

      const result = await completeCheckoutMutation.mutateAsync();

      const orderNum = result?.data?.attributes?.number || "N/A";
      onComplete(orderNum);
    } catch (err: any) {
      setError(err.message || "Payment processing failed");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePayment}>
      <h3 className="m-0 mb-4 text-lg font-semibold text-foreground">
        Checkout - Payment
      </h3>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Card Details
        </label>
        <div className="rounded-md border border-white/20 bg-white/5 p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "14px",
                  color: "#fff",
                  "::placeholder": {
                    color: "rgba(255, 255, 255, 0.5)"
                  }
                },
                invalid: {
                  color: "#fa755a"
                }
              }
            }}
          />
        </div>
      </div>

      {error && (
        <div className="mt-1 text-xs text-destructive">{error}</div>
      )}

      <div className="mt-5 flex gap-3">
        <button
          onClick={onBack}
          type="button"
          className="flex-1 rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 disabled:translate-y-0"
        >
          {processing ? "Processing..." : "Complete Order"}
        </button>
      </div>
    </form>
  );
};

export const StreamCheckout: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: cartData } = useCart();

  const itemCount = cartData?.data?.attributes?.item_count || 0;

  return (
    <div
      className={cn(
        "absolute bottom-[60px] left-5 z-[100] flex flex-col overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.3)] backdrop-blur-[20px] transition-all duration-300",
        isExpanded
          ? "w-[380px] max-h-[85vh] rounded-xl border border-white/10 bg-black/95"
          : "h-[60px] w-[60px] bg-background"
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "relative flex h-[60px] w-[60px] flex-shrink-0 cursor-pointer items-center justify-center border-none bg-background text-2xl text-foreground transition-all",
          isExpanded ? "rounded-t-xl" : "rounded-full hover:bg-muted"
        )}
      >
        🛒
        {itemCount > 0 && (
          <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-white">
            {itemCount}
          </div>
        )}
      </button>

      {isExpanded && <CheckoutWizard onClose={() => setIsExpanded(false)} />}
    </div>
  );
};
