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
import {
  CheckoutWrapper,
  ToggleButton,
  CartBadge,
  CheckoutContent,
  StepIndicator,
  StepDot,
  CheckoutTitle,
  CartItem,
  ItemImage,
  ItemDetails,
  ItemName,
  ItemPrice,
  RemoveButton,
  FormField,
  Label,
  Input,
  FormRow,
  ErrorText,
  TotalRow,
  TotalLabel,
  TotalValue,
  StepActions,
  StepButton,
  CardElementWrapper,
  SuccessMessage,
  SuccessIcon,
  SuccessText,
  OrderNumber,
  ShippingMethodOption,
  ShippingMethodName,
  ShippingMethodCost,
  LoginPrompt,
  LoginIcon,
  LoginText,
  LoginSubtext,
  AddressOption,
  AddressOptionContent,
  AddressRadio,
  AddressDetails,
  AddressName,
  AddressLine,
  NewAddressButton
} from "./StreamCheckout.styles";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Validation Schema
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

  // If not logged in, show login prompt
  if (!user) {
    return (
      <>
        <CheckoutContent>
          <LoginPrompt>
            <LoginIcon>🔒</LoginIcon>
            <LoginText>Login Required</LoginText>
            <LoginSubtext>Please login to complete your purchase</LoginSubtext>
            <StepActions>
              <StepButton onClick={onClose}>Keep Shopping</StepButton>
              <StepButton
                variant="primary"
                onClick={() => setShowLoginDialog(true)}
              >
                Login
              </StepButton>
            </StepActions>
          </LoginPrompt>
        </CheckoutContent>

        <LoginDialog
          isOpen={showLoginDialog}
          onClose={() => setShowLoginDialog(false)}
          onSuccess={() => {
            // After successful login, user state will update and component will re-render
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
      console.log("Shipping methods response:", response);

      // Find shipping rates in the included array (same pattern as full checkout)
      const shippingRates =
        response?.included?.filter(
          (item: any) => item.type === "shipping_rate"
        ) || [];

      console.log("Shipping rates:", shippingRates);
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
    <CheckoutContent>
      <StepIndicator>
        <StepDot isActive={currentStep === 0} isCompleted={currentStep > 0} />
        <StepDot isActive={currentStep === 1} isCompleted={currentStep > 1} />
        <StepDot isActive={currentStep === 2} isCompleted={currentStep > 2} />
        <StepDot isActive={currentStep === 3} isCompleted={currentStep > 3} />
      </StepIndicator>

      {/* Step 0: Cart Review */}
      {currentStep === 0 && (
        <>
          <CheckoutTitle>Your Cart ({cartItems.length})</CheckoutTitle>

          {cartItems.map((item: any) => {
            const variant = cartData?.included?.find(
              (inc: any) =>
                inc.type === "variant" &&
                inc.id === item.relationships?.variant?.data?.id
            );
            const image = variant?.attributes?.images?.[0]?.url;

            return (
              <CartItem key={item.id}>
                <ItemImage>
                  {image && (
                    <Image
                      src={image}
                      alt={item.attributes?.name || "Product"}
                      width={60}
                      height={60}
                      style={{ objectFit: "cover" }}
                    />
                  )}
                </ItemImage>
                <ItemDetails>
                  <ItemName>{item.attributes?.name}</ItemName>
                  <ItemPrice>
                    {item.attributes?.quantity} ×{" "}
                    {item.attributes?.display_price}
                  </ItemPrice>
                </ItemDetails>
                {/* Remove button disabled during checkout - items can't be removed once checkout starts */}
                <RemoveButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Remove button clicked for item:", item.id);
                    handleRemoveItem(item.id);
                  }}
                  disabled={removeFromCartMutation.isLoading}
                >
                  ×
                </RemoveButton>
              </CartItem>
            );
          })}

          <TotalRow>
            <TotalLabel>Total</TotalLabel>
            <TotalValue>{displayTotal}</TotalValue>
          </TotalRow>

          <StepActions>
            <StepButton onClick={onClose}>Keep Shopping</StepButton>
            <StepButton
              variant="primary"
              onClick={() => setCurrentStep(1)}
              disabled={cartItems.length === 0}
            >
              Continue
            </StepButton>
          </StepActions>
        </>
      )}

      {/* Step 1: Shipping Address */}
      {currentStep === 1 && (
        <>
          <CheckoutTitle>Checkout - Shipping Address</CheckoutTitle>

          {/* Show saved addresses if available */}
          {!showNewAddressForm && savedAddresses.length > 0 && (
            <>
              {savedAddresses.map((address: any) => (
                <AddressOption
                  key={address.id}
                  selected={selectedAddress === address.id}
                  onClick={() => setSelectedAddress(address.id)}
                >
                  <AddressOptionContent>
                    <AddressRadio selected={selectedAddress === address.id} />
                    <AddressDetails>
                      <AddressName>
                        {address.attributes.firstname}{" "}
                        {address.attributes.lastname}
                      </AddressName>
                      <AddressLine>{address.attributes.address1}</AddressLine>
                      {address.attributes.address2 && (
                        <AddressLine>{address.attributes.address2}</AddressLine>
                      )}
                      <AddressLine>
                        {address.attributes.city},{" "}
                        {address.attributes.state_name}{" "}
                        {address.attributes.zipcode}
                      </AddressLine>
                      <AddressLine>{address.attributes.phone}</AddressLine>
                    </AddressDetails>
                  </AddressOptionContent>
                </AddressOption>
              ))}

              <NewAddressButton onClick={() => setShowNewAddressForm(true)}>
                + Add New Address
              </NewAddressButton>

              <StepActions>
                <StepButton onClick={() => setCurrentStep(0)}>Back</StepButton>
                <StepButton
                  variant="primary"
                  onClick={() => {
                    const address = savedAddresses.find(
                      (a: any) => a.id === selectedAddress
                    );
                    if (address) handleSelectAddress(address);
                  }}
                  disabled={!selectedAddress}
                >
                  Continue
                </StepButton>
              </StepActions>
            </>
          )}

          {/* Show form if adding new address or no saved addresses */}
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
                    <StepButton
                      onClick={() => setShowNewAddressForm(false)}
                      style={{ marginBottom: "16px" }}
                      type="button"
                    >
                      ← Back to Saved Addresses
                    </StepButton>
                  )}

                  <FormRow>
                    <FormField>
                      <Label>First Name</Label>
                      <Field name="firstName" as={Input} />
                      {errors.firstName && touched.firstName && (
                        <ErrorText>{errors.firstName}</ErrorText>
                      )}
                    </FormField>
                    <FormField>
                      <Label>Last Name</Label>
                      <Field name="lastName" as={Input} />
                      {errors.lastName && touched.lastName && (
                        <ErrorText>{errors.lastName}</ErrorText>
                      )}
                    </FormField>
                  </FormRow>

                  <FormField>
                    <Label>Address</Label>
                    <Field name="address1" as={Input} />
                    {errors.address1 && touched.address1 && (
                      <ErrorText>{errors.address1}</ErrorText>
                    )}
                  </FormField>

                  <FormField>
                    <Label>Apartment, suite, etc. (optional)</Label>
                    <Field name="address2" as={Input} />
                  </FormField>

                  <FormRow>
                    <FormField>
                      <Label>City</Label>
                      <Field name="city" as={Input} />
                      {errors.city && touched.city && (
                        <ErrorText>{errors.city}</ErrorText>
                      )}
                    </FormField>
                    <FormField>
                      <Label>State</Label>
                      <Field name="state" as={Input} />
                      {errors.state && touched.state && (
                        <ErrorText>{errors.state}</ErrorText>
                      )}
                    </FormField>
                  </FormRow>

                  <FormRow>
                    <FormField>
                      <Label>ZIP Code</Label>
                      <Field name="zipcode" as={Input} />
                      {errors.zipcode && touched.zipcode && (
                        <ErrorText>{errors.zipcode}</ErrorText>
                      )}
                    </FormField>
                    <FormField>
                      <Label>Phone</Label>
                      <Field name="phone" as={Input} />
                      {errors.phone && touched.phone && (
                        <ErrorText>{errors.phone}</ErrorText>
                      )}
                    </FormField>
                  </FormRow>

                  <StepActions>
                    <StepButton onClick={() => setCurrentStep(0)} type="button">
                      Modify Cart
                    </StepButton>
                    <StepButton variant="primary" type="submit">
                      Continue
                    </StepButton>
                  </StepActions>
                </Form>
              )}
            </Formik>
          )}
        </>
      )}

      {/* Step 2: Shipping Method */}
      {currentStep === 2 && (
        <>
          <CheckoutTitle>Checkout - Shipping Method</CheckoutTitle>

          {shippingMethods.map((method: any) => {
            console.log("Rendering method:", method);
            return (
              <ShippingMethodOption
                key={method.id}
                selected={selectedShipping === method.id}
              >
                <input
                  type="radio"
                  name="shipping"
                  value={method.id}
                  checked={selectedShipping === method.id}
                  onChange={(e) => setSelectedShipping(e.target.value)}
                />
                <div>
                  <ShippingMethodName>
                    {method.attributes?.name}
                  </ShippingMethodName>
                  <ShippingMethodCost>
                    {method.attributes?.display_cost}
                  </ShippingMethodCost>
                </div>
              </ShippingMethodOption>
            );
          })}

          <StepActions>
            <StepButton onClick={() => setCurrentStep(1)}>Back</StepButton>
            <StepButton
              variant="primary"
              onClick={handleShippingSubmit}
              disabled={!selectedShipping}
            >
              Continue
            </StepButton>
          </StepActions>
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
        <SuccessMessage>
          <SuccessIcon>🎉</SuccessIcon>
          <SuccessText>Order Complete!</SuccessText>
          <OrderNumber>Order #{orderNumber}</OrderNumber>
          <StepActions>
            <StepButton variant="primary" onClick={onClose}>
              Continue Watching
            </StepButton>
          </StepActions>
        </SuccessMessage>
      )}
    </CheckoutContent>
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

      // First update checkout with payment method
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

      // Then complete the checkout
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
      <CheckoutTitle>Checkout - Payment</CheckoutTitle>

      <FormField>
        <Label>Card Details</Label>
        <CardElementWrapper>
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
        </CardElementWrapper>
      </FormField>

      {error && <ErrorText>{error}</ErrorText>}

      <StepActions>
        <StepButton onClick={onBack} type="button">
          Back
        </StepButton>
        <StepButton
          variant="primary"
          type="submit"
          disabled={!stripe || processing}
        >
          {processing ? "Processing..." : "Complete Order"}
        </StepButton>
      </StepActions>
    </form>
  );
};

export const StreamCheckout: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: cartData } = useCart();

  const itemCount = cartData?.data?.attributes?.item_count || 0;

  return (
    <CheckoutWrapper isExpanded={isExpanded}>
      <ToggleButton
        isExpanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        🛒
        {itemCount > 0 && <CartBadge>{itemCount}</CartBadge>}
      </ToggleButton>

      {isExpanded && <CheckoutWizard onClose={() => setIsExpanded(false)} />}
    </CheckoutWrapper>
  );
};
