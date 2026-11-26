import React, { useEffect, useId, useRef, useState } from "react";
import { Formik, Form, Field, useFormikContext } from "formik";
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

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const fieldId = (name: string) => `stream-checkout-${name}`;

const addressFields = [
  "firstName",
  "lastName",
  "address1",
  "address2",
  "city",
  "state",
  "zipcode",
  "phone"
] as const;

type AddressFieldName = (typeof addressFields)[number];

const AddressField: React.FC<{
  name: AddressFieldName;
  label: string;
  autoComplete: string;
  type?: string;
  required?: boolean;
  error?: string;
}> = ({ name, label, autoComplete, type = "text", required, error }) => {
  const id = fieldId(name);
  const errorId = `${id}-error`;

  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-muted-foreground"
      >
        {label}
      </label>
      <Field
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-md border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none ${focusRing}`}
      />
      {error && (
        <div id={errorId} className="mt-1 text-xs text-destructive">
          {error}
        </div>
      )}
    </div>
  );
};

// After a submit that fails validation, move focus to the first invalid field so its error
// (linked with aria-describedby) is read out.
const FocusFirstInvalidField: React.FC = () => {
  const { submitCount, isSubmitting, isValidating, errors } =
    useFormikContext<Record<AddressFieldName, string>>();
  const handledSubmit = useRef(0);

  useEffect(() => {
    if (submitCount === handledSubmit.current || isSubmitting || isValidating)
      return;
    handledSubmit.current = submitCount;
    const firstInvalid = addressFields.find((name) => errors[name]);
    if (firstInvalid) document.getElementById(fieldId(firstInvalid))?.focus();
  }, [submitCount, isSubmitting, isValidating, errors]);

  return null;
};

const CheckoutWizard: React.FC<{ onClose: () => void; id: string }> = ({
  onClose,
  id
}) => {
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

  // Each step replaces the panel's content, so move focus to the new step's heading instead
  // of leaving it on a button that no longer exists.
  const panelRef = useRef<HTMLDivElement>(null);
  const previousStep = useRef(currentStep);
  useEffect(() => {
    if (previousStep.current === currentStep) return;
    previousStep.current = currentStep;
    panelRef.current
      ?.querySelector<HTMLElement>("[data-step-heading]")
      ?.focus();
  }, [currentStep]);

  const cartItems =
    cartData?.included?.filter((item: any) => item.type === "line_item") || [];
  const displayTotal = cartData?.data?.attributes?.display_total || "$0.00";
  const savedAddresses = addressesData?.data || [];

  if (!user) {
    return (
      <>
        <div
          id={id}
          role="region"
          aria-label="Checkout"
          className="flex-1 overflow-y-auto p-5"
        >
          <div className="px-5 py-10 text-center">
            <div aria-hidden="true" className="mb-4 text-5xl">
              🔒
            </div>
            <h2 className="mb-2 text-base text-foreground">Login Required</h2>
            <div className="mb-6 text-sm text-muted-foreground">
              Please login to complete your purchase
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Keep Shopping
              </button>
              <button
                onClick={() => setShowLoginDialog(true)}
                className="flex-1 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
    <div
      id={id}
      ref={panelRef}
      role="region"
      aria-label="Checkout"
      className="flex-1 overflow-y-auto p-5"
    >
      {/* Step Indicator */}
      {currentStep < 4 && (
        <p className="sr-only">Step {currentStep + 1} of 4</p>
      )}
      <div aria-hidden="true" className="mb-5 flex justify-between gap-2">
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
          <h2
            data-step-heading
            tabIndex={-1}
            className="m-0 mb-4 text-lg font-semibold text-foreground focus:outline-none"
          >
            Your Cart ({cartItems.length})
          </h2>

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
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveItem(item.id);
                  }}
                  disabled={removeFromCartMutation.isLoading}
                  aria-label={`Remove ${
                    item.attributes?.name || "item"
                  } from cart`}
                  className={`rounded border-none bg-transparent p-1 text-lg text-destructive hover:opacity-70 ${focusRing}`}
                >
                  <span aria-hidden="true">&times;</span>
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
              className="flex-1 rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Keep Shopping
            </button>
            <button
              onClick={() => setCurrentStep(1)}
              disabled={cartItems.length === 0}
              className="flex-1 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:translate-y-0"
            >
              Continue
            </button>
          </div>
        </>
      )}

      {/* Step 1: Shipping Address */}
      {currentStep === 1 && (
        <>
          <h2
            data-step-heading
            tabIndex={-1}
            className="m-0 mb-4 text-lg font-semibold text-foreground focus:outline-none"
          >
            Checkout - Shipping Address
          </h2>

          {!showNewAddressForm && savedAddresses.length > 0 && (
            <>
              <fieldset className="m-0 min-w-0 border-0 p-0">
                <legend className="sr-only">Saved addresses</legend>
                {savedAddresses.map((address: any) => (
                  <label
                    key={address.id}
                    className={cn(
                      "relative mb-3 flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition-all hover:border-brand/60",
                      selectedAddress === address.id
                        ? "border-brand bg-white/5"
                        : "border-white/10 bg-transparent"
                    )}
                  >
                    <input
                      type="radio"
                      name="stream-checkout-saved-address"
                      value={address.id}
                      checked={selectedAddress === address.id}
                      onChange={() => setSelectedAddress(address.id)}
                      className="peer sr-only"
                    />
                    <div
                      aria-hidden="true"
                      className={cn(
                        "relative mt-0.5 h-5 w-5 flex-shrink-0 rounded-full border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                        selectedAddress === address.id
                          ? "border-brand bg-brand"
                          : "border-white/30 bg-transparent"
                      )}
                    >
                      {selectedAddress === address.id && (
                        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex-1 text-sm font-semibold text-foreground">
                      {address.attributes.firstname}{" "}
                      {address.attributes.lastname}
                      <div className="mt-1 text-[13px] font-normal leading-relaxed text-muted-foreground">
                        {address.attributes.address1}
                      </div>
                      {address.attributes.address2 && (
                        <div className="text-[13px] font-normal leading-relaxed text-muted-foreground">
                          {address.attributes.address2}
                        </div>
                      )}
                      <div className="text-[13px] font-normal leading-relaxed text-muted-foreground">
                        {address.attributes.city},{" "}
                        {address.attributes.state_name}{" "}
                        {address.attributes.zipcode}
                      </div>
                      <div className="text-[13px] font-normal leading-relaxed text-muted-foreground">
                        {address.attributes.phone}
                      </div>
                    </div>
                  </label>
                ))}
              </fieldset>

              <button
                onClick={() => setShowNewAddressForm(true)}
                className="mb-5 w-full cursor-pointer rounded-lg border-2 border-dashed border-white/20 bg-transparent p-3 text-sm font-semibold text-brand transition-all hover:border-brand hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                + Add New Address
              </button>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setCurrentStep(0)}
                  className="flex-1 rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                  className="flex-1 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:translate-y-0"
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
              {({ errors, touched }) => {
                const errorFor = (name: AddressFieldName) =>
                  touched[name] ? errors[name] : undefined;

                return (
                  <Form noValidate>
                    <FocusFirstInvalidField />
                    {savedAddresses.length > 0 && (
                      <button
                        onClick={() => setShowNewAddressForm(false)}
                        className="mb-4 rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        type="button"
                      >
                        &larr; Back to Saved Addresses
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <AddressField
                        name="firstName"
                        label="First Name"
                        autoComplete="shipping given-name"
                        required
                        error={errorFor("firstName")}
                      />
                      <AddressField
                        name="lastName"
                        label="Last Name"
                        autoComplete="shipping family-name"
                        required
                        error={errorFor("lastName")}
                      />
                    </div>

                    <AddressField
                      name="address1"
                      label="Address"
                      autoComplete="shipping address-line1"
                      required
                      error={errorFor("address1")}
                    />

                    <AddressField
                      name="address2"
                      label="Apartment, suite, etc. (optional)"
                      autoComplete="shipping address-line2"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <AddressField
                        name="city"
                        label="City"
                        autoComplete="shipping address-level2"
                        required
                        error={errorFor("city")}
                      />
                      <AddressField
                        name="state"
                        label="State"
                        autoComplete="shipping address-level1"
                        required
                        error={errorFor("state")}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <AddressField
                        name="zipcode"
                        label="ZIP Code"
                        autoComplete="shipping postal-code"
                        required
                        error={errorFor("zipcode")}
                      />
                      <AddressField
                        name="phone"
                        label="Phone"
                        type="tel"
                        autoComplete="shipping tel"
                        required
                        error={errorFor("phone")}
                      />
                    </div>

                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={() => setCurrentStep(0)}
                        type="button"
                        className="flex-1 rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        Modify Cart
                      </button>
                      <button
                        type="submit"
                        className="flex-1 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        Continue
                      </button>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          )}
        </>
      )}

      {/* Step 2: Shipping Method */}
      {currentStep === 2 && (
        <>
          <h2
            data-step-heading
            tabIndex={-1}
            className="m-0 mb-4 text-lg font-semibold text-foreground focus:outline-none"
          >
            Checkout - Shipping Method
          </h2>

          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="sr-only">Shipping method</legend>
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
                  className={`h-5 w-5 flex-shrink-0 cursor-pointer ${focusRing}`}
                />
                <div className="text-sm font-medium text-foreground">
                  {method.attributes?.name}
                  <div className="mt-1 text-[13px] font-normal leading-normal text-brand">
                    {method.attributes?.display_cost}
                  </div>
                </div>
              </label>
            ))}
          </fieldset>

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex-1 rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Back
            </button>
            <button
              onClick={handleShippingSubmit}
              disabled={!selectedShipping}
              className="flex-1 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:translate-y-0"
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
          <div aria-hidden="true" className="mb-4 text-5xl">
            🎉
          </div>
          <h2
            data-step-heading
            tabIndex={-1}
            className="mb-2 text-base text-foreground focus:outline-none"
          >
            Order Complete!
          </h2>
          <div className="text-sm text-muted-foreground">
            Order #{orderNumber}
          </div>
          <div className="mt-5 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
      <h2
        data-step-heading
        tabIndex={-1}
        className="m-0 mb-4 text-lg font-semibold text-foreground focus:outline-none"
      >
        Checkout - Payment
      </h2>

      <div className="mb-4">
        <div
          id="stream-checkout-card-label"
          className="mb-1.5 block text-xs font-medium text-muted-foreground"
        >
          Card Details
        </div>
        <div
          role="group"
          aria-labelledby="stream-checkout-card-label"
          className="rounded-md border border-white/20 bg-white/5 p-3"
        >
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

      <div role="alert">
        {error && <div className="mt-1 text-xs text-destructive">{error}</div>}
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={onBack}
          type="button"
          className="flex-1 rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:translate-y-0"
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
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const itemCount = cartData?.data?.attributes?.item_count || 0;

  const close = () => {
    setIsExpanded(false);
    toggleRef.current?.focus();
  };

  // Escape closes the open panel. Listening on the container keeps it to keypresses inside
  // the panel; the login dialog renders in a portal and handles its own Escape.
  useEffect(() => {
    const container = containerRef.current;
    if (!isExpanded || !container) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      e.preventDefault();
      setIsExpanded(false);
      toggleRef.current?.focus();
    };
    container.addEventListener("keydown", onKeyDown);
    return () => container.removeEventListener("keydown", onKeyDown);
  }, [isExpanded]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute bottom-[60px] left-5 z-[100] flex flex-col overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.3)] backdrop-blur-[20px] transition-all duration-300",
        isExpanded
          ? "w-[380px] max-h-[85vh] rounded-xl border border-white/10 bg-black/95"
          : "h-[60px] w-[60px] bg-background"
      )}
    >
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={isExpanded ? panelId : undefined}
        aria-label={
          itemCount > 0
            ? `Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`
            : "Cart"
        }
        className={cn(
          "relative flex h-[60px] w-[60px] flex-shrink-0 cursor-pointer items-center justify-center border-none bg-background text-2xl text-foreground transition-all",
          focusRing,
          "focus-visible:ring-inset focus-visible:ring-offset-0",
          isExpanded ? "rounded-t-xl" : "rounded-full hover:bg-muted"
        )}
      >
        <span aria-hidden="true">🛒</span>
        {itemCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-white"
          >
            {itemCount}
          </span>
        )}
      </button>

      {isExpanded && <CheckoutWizard id={panelId} onClose={close} />}
    </div>
  );
};
