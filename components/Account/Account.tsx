import React, { useState } from "react";
import { useRouter } from "next/router";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import { Package, MapPin, Heart, CreditCard, User, Mail, Lock } from "lucide-react";
import { cn } from "@lib/utils";
import { Button } from "@components/ui";
import { Layout } from "../Layout";
import { Loading } from "../Loading";
import { FormikInput, FormikPassword } from "@components/FormikWrappers";
import { useAccountInfo, useUpdateAccount } from "@hooks/useAccounts";

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

const quickLinks = [
  {
    title: "Order History",
    description:
      "Look at your order history, manage your current orders, track deliveries, or request a return.",
    href: "/account/orders",
    icon: Package
  },
  {
    title: "Addresses",
    description: "Add or edit billing and shipping addresses here.",
    href: "/account/addresses",
    icon: MapPin
  },
  {
    title: "Favorites",
    description: "View and manage your saved favorite products.",
    href: "/account/favorites",
    icon: Heart
  },
  {
    title: "Payment Methods",
    description: "Add or edit payment methods here.",
    href: "/account/payment",
    icon: CreditCard
  }
];

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
        <div className="section-container py-10">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Failed to load account information. Please try again.
          </div>
        </div>
      </Layout>
    );
  }

  const accountInfo = accountData?.data?.data?.attributes;
  const initialValues = {
    email: accountInfo?.email || "",
    password: "",
    password_confirmation: ""
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-3 font-body text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

  return (
    <Layout>
      <div className="section-container py-10">
        <h1 className="mb-8 font-title text-3xl font-bold uppercase tracking-wider text-foreground">
          My Account
        </h1>

        {/* Quick Links Grid */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                className="group flex flex-col items-start rounded-xl border border-border/30 bg-card p-6 text-left transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md cursor-pointer outline-none"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1 font-title text-sm font-semibold text-foreground">
                  {link.title}
                </h3>
                <p className="font-body text-xs text-muted-foreground">
                  {link.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Account Details Form */}
        <div className="max-w-lg rounded-xl border border-border/30 bg-card p-6">
          <h2 className="mb-6 font-title text-lg font-semibold uppercase tracking-wider text-foreground">
            Account Details
          </h2>

          {updateError && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {updateError}
            </div>
          )}
          {updateSuccess && (
            <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700">
              {updateSuccess}
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              try {
                setUpdateError(null);
                setUpdateSuccess(null);

                const updateData: any = { email: values.email };
                if (values.password) {
                  updateData.password = values.password;
                  updateData.password_confirmation =
                    values.password_confirmation;
                }

                await updateAccount.mutateAsync(updateData);
                setUpdateSuccess("Account updated successfully!");

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
            {({ handleSubmit, isSubmitting }) => (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block font-title text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Email
                  </label>
                  <Field
                    type="email"
                    name="email"
                    placeholder="Email"
                    component={FormikInput}
                    label="Email"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-title text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    New Password
                  </label>
                  <Field
                    name="password"
                    placeholder="New Password (leave blank to keep current)"
                    component={FormikPassword}
                    label="New Password"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-title text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Confirm Password
                  </label>
                  <Field
                    name="password_confirmation"
                    placeholder="Confirm New Password"
                    component={FormikPassword}
                    label="Confirm Password"
                  />
                </div>
                <Button
                  onClick={handleSubmit as any}
                  disabled={isSubmitting}
                  className="mt-2"
                >
                  {isSubmitting ? "Updating..." : "Update Account"}
                </Button>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </Layout>
  );
};
