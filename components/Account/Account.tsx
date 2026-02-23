import React, { useState } from "react";
import { useRouter } from "next/router";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import styled from "@emotion/styled";
import { Layout } from "../Layout";
import { Loading } from "../Loading";
import { Button } from "../shared/Button";
import { FormikInput, FormikPassword } from "@components/FormikWrappers";
import { useAccountInfo, useUpdateAccount } from "@hooks/useAccounts";

import {
  Content,
  PageTitle,
  PageBottom,
  AccountImg,
  FormWrapper,
  LeftCol,
  RightCol,
  FormItem,
  FormLabel
} from "./Account.styles";

const ErrorMessageDisplay = styled.div`
  color: ${(p) => p.theme.colors.red?.primary || "#ff0000"};
  padding: 10px;
  margin: 10px 0;
  background: ${(p) => p.theme.colors.red?.light || "#ffe6e6"};
  border-radius: 4px;
  font-size: 14px;
`;

const SuccessMessageDisplay = styled.div`
  color: ${(p) => p.theme.colors.green?.primary || "#00ff00"};
  padding: 10px;
  margin: 10px 0;
  background: ${(p) => p.theme.colors.green?.light || "#e6ffe6"};
  border-radius: 4px;
  font-size: 14px;
`;

const FormSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-family: ${(p) => p.theme.typography.titleLG.fontFamily};
  font-size: 18px;
  margin-bottom: 15px;
  text-transform: uppercase;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

const StyledFormInput = styled(Field)`
  font-size: 14px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  border-bottom: 1px solid #707070;
  width: 100%;
  padding: 8px 0;
  background: transparent;
  border-top: none;
  border-left: none;
  border-right: none;
  outline: none;
  margin-bottom: 10px;

  &::placeholder {
    color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.secondary
        : p.theme.colors.black.secondary};
  }
`;

const ButtonWrapper = styled.div`
  margin-top: 20px;
`;

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().min(8, "Password must be at least 8 characters"),
  password_confirmation: Yup.string().oneOf(
    [Yup.ref("password")],
    "Passwords must match"
  )
});

export const Account = () => {
  const router = useRouter();
  const { data: accountData, isLoading, error } = useAccountInfo();
  const updateAccount = useUpdateAccount();
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Content>
          <ErrorMessageDisplay>
            Failed to load account information. Please try again.
          </ErrorMessageDisplay>
        </Content>
      </Layout>
    );
  }

  const accountInfo = accountData?.data?.data?.attributes;
  const initialValues = {
    email: accountInfo?.email || "",
    password: "",
    password_confirmation: ""
  };

  return (
    <Layout>
      <Content>
        <PageTitle>account</PageTitle>
        <PageBottom>
          <AccountImg src={"/account.png"} alt="Account" />
          <FormWrapper>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                try {
                  setUpdateError(null);
                  setUpdateSuccess(null);

                  // Only send password fields if password is being changed
                  const updateData: any = { email: values.email };
                  if (values.password) {
                    updateData.password = values.password;
                    updateData.password_confirmation =
                      values.password_confirmation;
                  }

                  await updateAccount.mutateAsync(updateData);
                  setUpdateSuccess("Account updated successfully!");

                  // Reset password fields
                  resetForm({
                    values: {
                      email: values.email,
                      password: "",
                      password_confirmation: ""
                    }
                  });
                } catch (e: any) {
                  setUpdateError(
                    e?.message || "Failed to update account. Please try again."
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ handleSubmit, isSubmitting, values }) => (
                <form onSubmit={handleSubmit}>
                  <LeftCol>
                    <FormSection>
                      <SectionTitle>Order History</SectionTitle>
                      <FormLabel>
                        Look at your order history, manage your current orders,
                        track deliveries, or request a return.
                      </FormLabel>
                      <ButtonWrapper>
                        <Button onClick={() => router.push("/account/orders")}>
                          View Orders
                        </Button>
                      </ButtonWrapper>
                    </FormSection>

                    <FormSection>
                      <SectionTitle>Addresses</SectionTitle>
                      <FormLabel>
                        Where you at? Add or edit billing and shipping addresses
                        here.
                      </FormLabel>
                      <ButtonWrapper>
                        <Button
                          onClick={() => router.push("/account/addresses")}
                        >
                          Manage Addresses
                        </Button>
                      </ButtonWrapper>
                    </FormSection>

                    <FormSection>
                      <SectionTitle>Favorites</SectionTitle>
                      <FormLabel>
                        View and manage your saved favorite products.
                      </FormLabel>
                      <ButtonWrapper>
                        <Button
                          onClick={() => router.push("/account/favorites")}
                        >
                          View Favorites
                        </Button>
                      </ButtonWrapper>
                    </FormSection>

                    <FormSection>
                      <SectionTitle>Account Details</SectionTitle>
                      {updateError && (
                        <ErrorMessageDisplay>{updateError}</ErrorMessageDisplay>
                      )}
                      {updateSuccess && (
                        <SuccessMessageDisplay>
                          {updateSuccess}
                        </SuccessMessageDisplay>
                      )}
                      <FormLabel>
                        Add or edit your e-mail address and password.
                      </FormLabel>
                      <FormItem>
                        <Field
                          type="email"
                          name="email"
                          placeholder="Email"
                          component={FormikInput}
                          label="Email"
                        />
                      </FormItem>
                      <FormItem>
                        <Field
                          name="password"
                          placeholder="New Password (leave blank to keep current)"
                          component={FormikPassword}
                          label="New Password"
                        />
                      </FormItem>
                      <FormItem>
                        <Field
                          name="password_confirmation"
                          placeholder="Confirm New Password"
                          component={FormikPassword}
                          label="Confirm Password"
                        />
                      </FormItem>
                      <ButtonWrapper>
                        <Button
                          onClick={handleSubmit as any}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Updating..." : "Update Account"}
                        </Button>
                      </ButtonWrapper>
                    </FormSection>
                  </LeftCol>

                  <RightCol>
                    <FormSection>
                      <SectionTitle>Payment Methods</SectionTitle>
                      <FormLabel>
                        Get it. Add or edit payment methods here.
                      </FormLabel>
                      <ButtonWrapper>
                        <Button onClick={() => router.push("/account/payment")}>
                          Manage Payment Methods
                        </Button>
                      </ButtonWrapper>
                    </FormSection>
                  </RightCol>
                </form>
              )}
            </Formik>
          </FormWrapper>
        </PageBottom>
      </Content>
    </Layout>
  );
};
