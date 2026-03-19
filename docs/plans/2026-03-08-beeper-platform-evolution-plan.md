# Beeper Platform Evolution — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix LogoBlob animation speed/variety, eliminate scroll jank, add homepage ISR performance, simplify signup to minimum Spree fields, build post-login profile page, and add vanity URL routing.

**Architecture:** Phase 1 is pure frontend fixes to existing components (LogoBlob, globals.css, DynamicHome). Phase 2 replaces the multi-step signup wizard with a single-screen form, adds a new `/account/profile` page, and converts `[productSlug].tsx` into a universal `[slug].tsx` resolver. All changes are in the Next.js frontend; no backend work required.

**Tech Stack:** Next.js, React, @react-spring/web, Formik + Yup, Tailwind CSS, react-query, Spree SDK v2

---

## Phase 1: Fix What's Broken

---

### Task 1: LogoBlob — Faster Cycle + 8 Unique Shapes

**Files:**

- Modify: `components/LogoBlob/LogoBlob.tsx`

**Step 1: Add 4 new blob paths and randomize sequencing**

Replace the 4 blob paths and animation config. The new shapes are wilder — spiky tendrils, deep concavities, amoeba-like asymmetry. Cycle is 7s instead of 16s. Morph target is randomized each cycle instead of looping sequentially.

In `components/LogoBlob/LogoBlob.tsx`, replace the blob paths (lines 17-24) and animation logic (lines 33-60):

```tsx
// 8 unique SVG blob paths — wilder asymmetry, spiky tendrils, deep concavities
const blobs = [
  // blob1: spiky star-like
  "M43.3,-69.7C51.1,-62.3,49,-41.9,53.7,-26.1C58.4,-10.4,69.9,0.6,68.8,10.1C67.8,19.6,54.4,27.5,43.4,34.4C32.4,41.2,24,46.9,14.5,50.1C5,53.4,-5.6,54,-19.9,55.4C-34.2,56.8,-52.3,58.9,-58.2,51C-64.1,43.1,-57.9,25.3,-58.1,9.7C-58.3,-6,-65,-19.4,-65,-34C-65,-48.6,-58.4,-64.5,-46.4,-70C-34.4,-75.6,-17.2,-70.8,0.3,-71.2C17.7,-71.6,35.5,-77.2,43.3,-69.7Z",
  // blob2: stretched amoeba
  "M40.8,-63.9C54.3,-54.8,67.7,-45.9,76.2,-33.1C84.6,-20.3,88.1,-3.6,82,9C75.9,21.6,60.1,30,48.3,39.5C36.4,49,28.5,59.6,18.1,63.3C7.8,67,-5,63.9,-19.6,61.8C-34.1,59.7,-50.3,58.7,-59.9,50.4C-69.5,42.1,-72.5,26.5,-73.4,11.4C-74.3,-3.7,-73.2,-18.3,-65.9,-28.3C-58.6,-38.3,-45.1,-43.8,-33.1,-53.6C-21.1,-63.4,-10.5,-77.5,1.6,-80C13.7,-82.4,27.3,-73.1,40.8,-63.9Z",
  // blob3: tendril reaching right
  "M36.4,-58.3C45.7,-50.6,51,-38.1,58.4,-25.6C65.9,-13,75.5,-0.4,76.7,13.1C77.9,26.5,70.8,40.9,59.4,48.4C48.1,55.9,32.5,56.7,18.3,59.4C4.2,62.2,-8.5,67.1,-21.3,66.2C-34.1,65.3,-47.1,58.7,-58.1,48.8C-69.1,38.9,-78,25.7,-82.2,10.5C-86.5,-4.7,-85.9,-21.8,-77.9,-34C-69.8,-46.1,-54.3,-53.2,-40.1,-58.7C-25.8,-64.3,-12.9,-68.3,0.3,-68.7C13.5,-69.2,27,-66.1,36.4,-58.3Z",
  // blob4: deep concavity bottom
  "M35.1,-51.8C49.7,-45.2,68.6,-42.6,72.9,-33.3C77.3,-23.9,67,-7.9,62,7.1C57,22.1,57.4,36.1,50.9,44.9C44.4,53.7,31.2,57.4,17.4,63.4C3.5,69.4,-10.9,77.7,-24.1,76.4C-37.4,75.1,-49.5,64.3,-59.3,52C-69.1,39.6,-76.6,25.9,-75.7,12.7C-74.9,-0.5,-65.7,-13.2,-58.4,-25.7C-51.2,-38.3,-45.9,-50.7,-36.5,-59.7C-27.1,-68.7,-13.5,-74.3,-1.6,-71.7C10.2,-69.1,20.5,-58.4,35.1,-51.8Z",
  // blob5: pinched hourglass
  "M29.3,-48.1C38.6,-39.7,47.3,-33.3,55.5,-23.9C63.8,-14.5,71.7,-2.2,71.7,10.7C71.6,23.5,63.5,36.9,52.2,44.7C41,52.5,26.6,54.8,12.4,59.1C-1.8,63.4,-15.8,69.7,-28.5,67.2C-41.3,64.6,-52.8,53.2,-62.2,40.1C-71.7,27,-79,12.2,-78.1,-1.8C-77.3,-15.8,-68.2,-29.1,-56.9,-38.1C-45.7,-47,-32.2,-51.6,-20.1,-58.2C-8,-64.7,2.6,-73.3,13.1,-72.5C23.5,-71.7,33.7,-61.5,29.3,-48.1Z",
  // blob6: wide flat amoeba
  "M44.2,-72.5C55.3,-61.7,61.3,-46.2,67.7,-31.3C74.1,-16.4,80.9,-2,79.5,11.6C78.1,25.2,68.5,38,57,47.8C45.5,57.6,32.2,64.4,17.8,69.2C3.3,74,-12.3,76.8,-25.7,72.3C-39.1,67.8,-50.3,56,-60,43C-69.8,30.1,-78,16,-79.7,0.6C-81.3,-14.7,-76.4,-31.1,-66.2,-42.8C-56.1,-54.5,-40.6,-61.4,-26.3,-70.6C-12,-79.8,1.2,-91.2,14.4,-90C27.5,-88.8,33.1,-83.3,44.2,-72.5Z",
  // blob7: spiky cactus
  "M38.9,-66C49.2,-56.4,55.7,-43.8,62.9,-30.9C70.1,-18,77.8,-4.9,77.2,7.8C76.6,20.5,67.5,32.9,56.8,42.2C46.1,51.5,33.7,57.8,20.5,62.4C7.4,67.1,-6.5,70.2,-20.4,68.9C-34.3,67.6,-48.3,61.8,-56.4,51.1C-64.5,40.3,-66.7,24.7,-69.9,8.8C-73.2,-7.1,-77.5,-23.3,-72.3,-36C-67.1,-48.8,-52.4,-58.1,-38,-65.8C-23.6,-73.5,-9.4,-79.5,3.1,-84.5C15.5,-89.4,28.6,-75.6,38.9,-66Z",
  // blob8: alien/organic
  "M42.7,-73.1C53.1,-63.5,57.8,-47.7,64.8,-33.1C71.7,-18.5,80.8,-5.1,81.1,8.9C81.4,23,72.9,37.7,61.3,47.5C49.8,57.3,35.2,62.3,20.8,66.6C6.3,70.9,-8,74.6,-22.3,72.4C-36.7,70.3,-51,62.3,-60,50.2C-68.9,38,-72.5,21.7,-72.8,5.6C-73.2,-10.5,-70.3,-26.3,-62.1,-38.1C-53.9,-49.9,-40.5,-57.6,-27.5,-66C-14.4,-74.4,-1.8,-83.5,10.2,-83.2C22.2,-82.8,32.4,-82.7,42.7,-73.1Z"
];
```

Replace the animation spring and cycling logic:

```tsx
// Randomized morph: pick a random target shape each cycle
const [shapeIndex, setShapeIndex] = useState(0);
const [nextIndex, setNextIndex] = useState(1);

const { x } = useSpring({
  config: { duration: 7000 },
  x: active ? 1 : 0
});

useEffect(() => {
  const id = setTimeout(() => {
    // Pick a random next shape that isn't the current one
    let next;
    do {
      next = Math.floor(Math.random() * blobs.length);
    } while (next === nextIndex);
    setShapeIndex(nextIndex);
    setNextIndex(next);
    setActive(!active);
  }, 7000);
  return () => clearTimeout(id);
}, [active, nextIndex]);
```

Update the `<animated.path>` `d` interpolation to morph between current and next:

```tsx
d={x.to([0, 1], [blobs[shapeIndex], blobs[nextIndex]])}
```

**Step 2: Brighten border glow + add neon-cyan accent**

Replace `BLOB_BOX_SHADOW` (lines 10-15):

```tsx
const BLOB_BOX_SHADOW = [
  "0 0 30px rgba(124, 58, 237, 0.6)",
  "0 0 20px rgba(124, 58, 237, 0.7)",
  "0 0 12px rgba(255, 0, 138, 0.6)",
  "0 0 8px rgba(255, 0, 138, 0.7)",
  "0 0 25px rgba(0, 255, 255, 0.4)",
  "0 0 15px rgba(0, 255, 255, 0.3)"
].join(", ");
```

**Step 3: Remove feTurbulence SVG filter — use CSS blur**

Remove the entire `AnimFeTurbulence` and `AnimFeDisplacementMap` imports and animated element declarations (lines 6-8). Remove the `freq`/`factor` spring (lines 37-41). Remove the `<filter id="water-animated">` and `<filter id="water-default">` definitions from both SVG blocks.

Keep only:

```tsx
<defs>
  <filter id="blur-animated">
    <feGaussianBlur stdDeviation="3" />
  </filter>
</defs>
```

The `<g filter="url(#blur-animated)">` stays, providing the hazy edge via standard (non-animated) Gaussian blur at a fraction of the GPU cost.

**Step 4: Verify it builds**

Run: `npx next build 2>&1 | head -30`
Expected: Build succeeds, no LogoBlob errors.

**Step 5: Commit**

```bash
git add components/LogoBlob/LogoBlob.tsx
git commit -m "feat: faster LogoBlob animation — 7s cycle, 8 shapes, brighter glow, no feTurbulence"
```

---

### Task 2: Fix Scroll Jank

**Files:**

- Modify: `styles/globals.css`
- Modify: `components/Home/DynamicHome.tsx`

**Step 1: Replace `overflow-x: clip` with `overflow-x: hidden` on `#__next`**

In `styles/globals.css` line 91, change:

```css
overflow-x: clip;
```

to:

```css
overflow-x: hidden;
```

**Why:** `overflow-x: clip` creates implicit scroll containment that confuses the compositor about scroll layers, especially combined with `overflow-x: hidden` on html/body and heavy SVG filters. `overflow-x: hidden` achieves the same visual clipping without creating a scroll container.

**Step 2: Add `will-change: transform` to fixed video background**

In `components/Home/DynamicHome.tsx` line 252, update the video background container:

```tsx
<div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" style={{ willChange: "transform" }}>
```

**Why:** Promotes the fixed video background to its own compositor layer, preventing it from interfering with the main content scroll layer.

**Step 3: Add `contain: layout style paint` to heavy animation containers**

In `components/Home/DynamicHome.tsx`, add containment to the LogoBlob section (line 279):

```tsx
<section className="flex items-center justify-center py-16 md:py-20" style={{ contain: "layout style paint" }}>
```

**Step 4: Verify scroll behavior**

Run: `npx next build && npx next start`
Test: Navigate to homepage, scroll up/down rapidly. Should feel smooth without sticking.

**Step 5: Commit**

```bash
git add styles/globals.css components/Home/DynamicHome.tsx
git commit -m "fix: scroll jank — replace overflow-x:clip, promote video layer, add containment"
```

---

### Task 3: Homepage Performance — ISR + staleTime

**Files:**

- Modify: `pages/home.tsx`
- Modify: `components/Home/DynamicHome.tsx`
- Modify: `hooks/useProductFeed/useProductFeed.ts`
- Modify: `components/Home/index.ts`

**Step 1: Add `getStaticProps` with ISR to `pages/home.tsx`**

Replace `pages/home.tsx` entirely:

```tsx
import { Home, DynamicHome } from "../components/Home";
import { FEED_CONFIGS, fetchProductFeed } from "@hooks/useProductFeed";

export async function getStaticProps() {
  try {
    const feedData = await fetchProductFeed({
      ...FEED_CONFIGS.latest,
      per_page: 8
    });
    return {
      props: { initialProducts: feedData || null },
      revalidate: 60
    };
  } catch {
    return {
      props: { initialProducts: null },
      revalidate: 60
    };
  }
}

export default function HomePage({
  initialProducts
}: {
  initialProducts: any;
}) {
  return <DynamicHome initialProducts={initialProducts} />;
}
```

**Note:** `fetchProductFeed` uses `spreeClient` which on the server will use `NEXT_PUBLIC_SPREE_API_URL`. This works because `getStaticProps` runs at build time and during ISR revalidation on the server.

**Step 2: Update `DynamicHome` to accept `initialProducts` prop**

In `components/Home/DynamicHome.tsx`, change the component signature:

```tsx
interface DynamicHomeProps {
  initialProducts?: any;
}

export const DynamicHome = ({ initialProducts }: DynamicHomeProps = {}) => {
```

Update the product feed hook call (line 196) to use `initialData`:

```tsx
const { data: feedData } = useProductFeed(
  "latest",
  { per_page: 8 },
  true,
  initialProducts
);
```

**Step 3: Update `useProductFeed` to accept `initialData`**

In `hooks/useProductFeed/useProductFeed.ts`, update the hook signature and options:

```tsx
export const useProductFeed = (
  feedType: FeedType,
  customParams?: Partial<ProductFeedParams>,
  enabled: boolean = true,
  initialData?: any
) => {
  const feedConfig = FEED_CONFIGS[feedType] || {};
  const mergedParams: ProductFeedParams = {
    ...feedConfig,
    ...customParams,
    filter: {
      ...feedConfig.filter,
      ...customParams?.filter
    }
  };

  const queryKey = [QueryKeys.PRODUCT_FEED, feedType, mergedParams];

  return useQuery(queryKey, () => fetchProductFeed(mergedParams), {
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes — prevents refetch on route changes
    initialData,
    onError: (error: any) => {
      console.error(`Failed to fetch ${feedType} feed:`, error.message);
    },
    onSuccess: (data) => {
      constants.IS_DEBUG && console.log(`${feedType} feed fetched:`, data);
    }
  });
};
```

**Key change:** `staleTime` goes from `60000` (1 min) to `5 * 60 * 1000` (5 min). Combined with ISR `initialData`, the homepage renders instantly and only background-revalidates every 5 minutes.

**Step 4: Update Home index to pass props through**

In `components/Home/index.ts`, the `DynamicHome` export needs to be used directly from `pages/home.tsx` (already done in step 1). The `index.ts` file stays as-is for other pages that import `<Home>`.

**Step 5: Clean up diagnostic console.logs in useProductFeed**

In `hooks/useProductFeed/useProductFeed.ts`, guard the raw console.logs at lines 120-122 behind `constants.IS_DEBUG`:

```tsx
constants.IS_DEBUG && console.log("Product feed response:", response);
constants.IS_DEBUG && console.log("Is success:", response.isSuccess());
```

And line 126:

```tsx
constants.IS_DEBUG && console.log("Product feed success data:", data);
constants.IS_DEBUG && console.log("Products count:", data?.data?.length);
```

**Step 6: Verify ISR works**

Run: `npx next build && npx next start`
Expected: `pages/home` shows `(ISR: 60 Seconds)` in the build output. Page loads instantly on first visit. Navigating away and back doesn't refetch.

**Step 7: Commit**

```bash
git add pages/home.tsx components/Home/DynamicHome.tsx hooks/useProductFeed/useProductFeed.ts
git commit -m "perf: homepage ISR (60s revalidation) + 5min staleTime on product feed"
```

---

## Phase 2: Simplified Onboarding

---

### Task 4: Simplify Signup to Single Screen

**Files:**

- Modify: `components/SignupWizard/SignupWizard.tsx` (full rewrite)
- Modify: `components/AuthForm/AuthForm.tsx` (remove `NEXT_PUBLIC_SIMPLE_SIGNUP` toggle)
- Modify: `config/auth.ts` (auto-login after register)

**Step 1: Rewrite SignupWizard as single-screen form**

Replace `components/SignupWizard/SignupWizard.tsx` entirely:

```tsx
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Formik, Form, Field } from "formik";
import { object, string, bool, ref } from "yup";

import { useAuth } from "../../config/auth";
import { FormikInput, FormikPassword, FormikCheckbox } from "../FormikWrappers";
import { Alert } from "../Alerts";
import constants from "@utilities/constants";

const SignupSchema = object().shape({
  email: string().email("Invalid email").required("Required"),
  password: string()
    .min(6, "Too Short")
    .matches(
      constants.PASSWORD_REGEX,
      "Must include uppercase, lowercase, and number"
    )
    .required("Required"),
  passwordConfirm: string()
    .required("Required")
    .oneOf([ref("password"), null], "Passwords must match"),
  acceptTerms: bool().oneOf([true], "You must accept the terms")
});

export const SignupWizard = () => {
  const router = useRouter();
  const { register, login } = useAuth();
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    setServerError("");
    try {
      await register({
        user: {
          email: values.email,
          password: values.password,
          password_confirmation: values.passwordConfirm
        }
      });

      // Auto-login after successful registration
      try {
        await login({ username: values.email, password: values.password });
        router.push("/account/profile");
      } catch {
        // If auto-login fails, redirect to login page
        router.push("/login");
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      setServerError(msg);
      Alert.fire({ icon: "error", title: "Registration failed", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-gradient-shift flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="font-pressstart text-center text-lg text-white mb-2">
          Create Account
        </h1>
        <p className="font-micro5 text-center text-xs tracking-widest text-white/50 mb-8">
          Join the Beeper marketplace
        </p>

        <Formik
          initialValues={{
            email: "",
            password: "",
            passwordConfirm: "",
            acceptTerms: false
          }}
          validationSchema={SignupSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values }) => (
            <Form>
              <div className="glass-panel p-6 sm:p-8 space-y-4">
                {serverError && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                    {serverError}
                  </div>
                )}

                <Field name="email" component={FormikInput} label="Email" />
                <Field
                  name="password"
                  component={FormikPassword}
                  label="Password"
                />
                <Field
                  name="passwordConfirm"
                  component={FormikPassword}
                  label="Confirm Password"
                />

                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Field
                      type="checkbox"
                      name="acceptTerms"
                      className="mt-1 accent-cyan-400"
                    />
                    <span className="text-xs text-white/60">
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-neon-cyan hover:underline"
                      >
                        Terms & Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-neon-cyan hover:underline"
                      >
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !values.acceptTerms}
                  className="neon-btn w-full text-center text-xs disabled:pointer-events-none disabled:opacity-40"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </button>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="font-title text-xs text-white/40 transition-colors hover:text-neon-cyan"
                >
                  Already have an account?
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
```

**Step 2: Remove `NEXT_PUBLIC_SIMPLE_SIGNUP` toggle**

In `components/AuthForm/AuthForm.tsx`, simplify — always use SignupWizard (which is now the single-screen form):

```tsx
import * as React from "react";
import { SignupWizard } from "../SignupWizard";
import { Login } from "../Login";
import { ResetPassword } from "../ResetPassword";
import { AuthFormType } from "./constants";

interface Props {
  formType: AuthFormType;
}

export const AuthForm = ({ formType }: Props) => {
  switch (formType) {
    case AuthFormType.login:
      return <Login />;
    case AuthFormType.signup:
      return <SignupWizard />;
    case AuthFormType.reset_password:
      return <ResetPassword />;
    default:
      return null;
  }
};
```

**Step 3: Enable auto-login in `config/auth.ts`**

The `registerFn` in `config/auth.ts` (line 186) currently does NOT auto-login after registration. The new `SignupWizard` handles this by calling `login()` after `register()` succeeds. No changes needed to `auth.ts` itself — the `useAuth()` hook already exposes `login`.

**Step 4: Verify signup flow**

Run: `npx next build && npx next start`
Test:

1. Navigate to `/signup` → single-screen form renders
2. Fill email/password/confirm/terms → click "Create Account"
3. On success → auto-login → redirect to `/account/profile`
4. Invalid email → shows validation error
5. Passwords don't match → shows error
6. Terms unchecked → button disabled

**Step 5: Commit**

```bash
git add components/SignupWizard/SignupWizard.tsx components/AuthForm/AuthForm.tsx
git commit -m "feat: simplified signup — single screen, email+password only, auto-login"
```

---

### Task 5: Post-Login Profile Page

**Files:**

- Create: `pages/account/profile.tsx`
- Create: `components/AccountProfile/AccountProfile.tsx`
- Modify: `hooks/useAccounts/index.ts` (add first_name, last_name to updateAccountInfo)

**Step 1: Extend `updateAccountInfo` to support profile fields**

In `hooks/useAccounts/index.ts`, update the params interface (line 30):

```tsx
export const updateAccountInfo = async (params: {
  email?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  password_confirmation?: string;
}) => {
```

**Step 2: Create AccountProfile component**

Create `components/AccountProfile/AccountProfile.tsx`:

```tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { Formik, Form, Field } from "formik";
import { object, string } from "yup";

import { useAccountInfo, useUpdateAccount } from "@hooks/useAccounts";
import { FormikInput } from "../FormikWrappers";
import { Layout } from "../Layout";
import { Loading } from "../Loading";
import { Alert } from "../Alerts";

const ProfileSchema = object().shape({
  first_name: string(),
  last_name: string(),
  display_name: string(),
  bio: string().max(280, "Bio must be 280 characters or less")
});

export const AccountProfile = () => {
  const router = useRouter();
  const { data: account, isLoading } = useAccountInfo();
  const updateAccount = useUpdateAccount();
  const isWelcome = router.query.welcome === "true";

  if (isLoading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  const attrs = account?.data?.attributes || {};

  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-4 py-12">
        {isWelcome && (
          <div className="mb-8 rounded-lg border border-neon-cyan/30 bg-neon-cyan/5 p-4 text-center">
            <h2 className="font-pressstart text-sm text-neon-cyan mb-2">
              Welcome to Beeper!
            </h2>
            <p className="text-xs text-white/60">
              Complete your profile below, or skip and come back later.
            </p>
          </div>
        )}

        <h1 className="font-pressstart text-lg text-white mb-8">
          Your Profile
        </h1>

        <Formik
          initialValues={{
            first_name: attrs.first_name || "",
            last_name: attrs.last_name || "",
            display_name: "",
            bio: ""
          }}
          validationSchema={ProfileSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await updateAccount.mutateAsync({
                first_name: values.first_name,
                last_name: values.last_name
              });
              Alert.fire({ icon: "success", title: "Profile updated!" });
            } catch (err: any) {
              Alert.fire({
                icon: "error",
                title: "Update failed",
                text: err.message
              });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              {/* Basic Info */}
              <div className="glass-panel p-6">
                <h2 className="font-micro5 text-xs tracking-widest text-white/50 mb-4">
                  BASIC INFO
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    name="first_name"
                    component={FormikInput}
                    label="First Name"
                  />
                  <Field
                    name="last_name"
                    component={FormikInput}
                    label="Last Name"
                  />
                </div>
                <div className="mt-4">
                  <Field
                    name="display_name"
                    component={FormikInput}
                    label="Display Name"
                  />
                </div>
                <div className="mt-4">
                  <Field name="bio" component={FormikInput} label="Bio" />
                </div>
              </div>

              {/* Shipping (optional) */}
              <div className="glass-panel p-6">
                <h2 className="font-micro5 text-xs tracking-widest text-white/50 mb-2">
                  SHIPPING ADDRESS
                </h2>
                <p className="text-xs text-white/40 mb-4">
                  Optional — you can add this at checkout.
                </p>
                <Field name="address" component={FormikInput} label="Address" />
                <div className="mt-4">
                  <Field
                    name="unit"
                    component={FormikInput}
                    label="Apt / Unit"
                  />
                </div>
              </div>

              {/* Creator Section (stub — requires Phase 3 backend) */}
              <div className="glass-panel p-6 opacity-50">
                <h2 className="font-micro5 text-xs tracking-widest text-white/50 mb-2">
                  CREATOR PROFILE
                </h2>
                <p className="text-xs text-white/40">
                  Coming soon — sell sample packs, presets, and visualizers on
                  Beeper.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="neon-btn text-xs disabled:pointer-events-none disabled:opacity-40"
                >
                  {isSubmitting ? "Saving..." : "Save Profile"}
                </button>
                {isWelcome && (
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="text-xs text-white/40 hover:text-white transition-colors"
                  >
                    Skip for now
                  </button>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Layout>
  );
};
```

**Step 3: Create the profile page route**

Create `pages/account/profile.tsx`:

```tsx
import { AccountProfile } from "@components/AccountProfile/AccountProfile";

export default AccountProfile;
```

**Step 4: Update signup redirect**

The SignupWizard from Task 4 already redirects to `/account/profile` after auto-login. To pass the welcome state, update the redirect in `SignupWizard.tsx`:

```tsx
router.push("/account/profile?welcome=true");
```

**Step 5: Verify profile flow**

Run: `npx next build && npx next start`
Test:

1. Sign up → auto-login → redirected to `/account/profile?welcome=true`
2. Welcome banner shows
3. Fill first/last name → Save → success alert
4. "Skip for now" → goes to homepage
5. Navigate back to `/account/profile` later → no welcome banner, fields pre-filled

**Step 6: Commit**

```bash
git add pages/account/profile.tsx components/AccountProfile/AccountProfile.tsx hooks/useAccounts/index.ts components/SignupWizard/SignupWizard.tsx
git commit -m "feat: post-login profile page with basic info, shipping, creator stub"
```

---

### Task 6: Vanity URL Routing

**Files:**

- Rename: `pages/[productSlug].tsx` → `pages/[slug].tsx`
- Modify: `pages/[slug].tsx` (add server-side resolution)
- Modify: `pages/user/[username].tsx` (redirect to vanity URL)

**Step 1: Rename and convert `[productSlug].tsx` to `[slug].tsx`**

Rename the file:

```bash
git mv pages/[productSlug].tsx pages/[slug].tsx
```

**Step 2: Add slug resolution logic**

Replace `pages/[slug].tsx`:

```tsx
import { GetServerSideProps } from "next";
import { ProductDetails } from "../components/ProductDetails";
import { UserProfile } from "../components/UserProfile";
import { Layout } from "@components/Layout";

// Reserved slugs that have dedicated page files — Next.js file routing
// gives them priority, but we list them here for the 404 guard.
const RESERVED_SLUGS = [
  "cart",
  "checkout",
  "login",
  "signup",
  "account",
  "browse",
  "about",
  "terms",
  "privacy",
  "home",
  "reset-password",
  "thank-you",
  "update-email",
  "update-password"
];

interface SlugPageProps {
  type: "product" | "profile";
  slug: string;
  productData?: any;
  profileData?: any;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;

  if (!slug || RESERVED_SLUGS.includes(slug)) {
    return { notFound: true };
  }

  // 1. Try product lookup by slug
  const spreeUrl =
    process.env.NEXT_PUBLIC_SPREE_API_URL || "http://localhost:8080";
  try {
    const productRes = await fetch(
      `${spreeUrl}/api/v2/storefront/products?filter[slug]=${slug}&include=images,variants,option_types`,
      { headers: { "Content-Type": "application/vnd.api+json" } }
    );
    if (productRes.ok) {
      const productData = await productRes.json();
      if (productData.data && productData.data.length > 0) {
        return {
          props: { type: "product", slug, productData }
        };
      }
    }
  } catch {
    // Product lookup failed, try profile
  }

  // 2. Try creator profile lookup by username
  // (Phase 3: when spree_creator_profiles is ready, fetch from /api/v1/creator_profiles/:username)
  // For now, try the existing user profile endpoint
  try {
    const profileRes = await fetch(
      `${spreeUrl}/api/v1/users/by_username/${slug}`,
      { headers: { "Content-Type": "application/json" } }
    );
    if (profileRes.ok) {
      const profileData = await profileRes.json();
      return {
        props: { type: "profile", slug, profileData }
      };
    }
  } catch {
    // Profile lookup failed
  }

  // 3. Neither product nor profile found
  return { notFound: true };
};

export default function SlugPage({
  type,
  slug,
  productData,
  profileData
}: SlugPageProps) {
  if (type === "product") {
    return <ProductDetails initialData={productData} />;
  }

  if (type === "profile") {
    return (
      <Layout>
        <UserProfile username={slug} initialData={profileData} />
      </Layout>
    );
  }

  return null;
}
```

**Note:** The profile lookup (`/api/v1/users/by_username/:slug`) may not exist yet in Spree. That's fine — it will 404 gracefully, and the page falls through to the `notFound: true` return. When Phase 3's `spree_creator_profiles` extension is built, update the URL to `/api/v1/creator_profiles/:username`.

**Step 3: Update `pages/user/[username].tsx` to redirect to vanity URL**

Replace `pages/user/[username].tsx` with a redirect:

```tsx
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const username = params?.username as string;
  return {
    redirect: {
      destination: `/${username}`,
      permanent: true
    }
  };
};

export default function UserRedirect() {
  return null;
}
```

**Step 4: Update ProductDetails to accept optional `initialData` prop**

This is a minimal change — `ProductDetails` currently reads slug from `router.query.productSlug`. Update it to also check `router.query.slug`:

In `components/ProductDetails/ProductDetails.tsx` (or wherever the slug is read), look for references to `productSlug` and update to also check `slug`:

```tsx
const { slug, productSlug } = router.query;
const activeSlug = (slug || productSlug) as string;
```

**Step 5: Verify routing**

Run: `npx next build && npx next start`
Test:

1. `/{product-slug}` → renders product detail page
2. `/user/{username}` → 301 redirects to `/{username}`
3. `/{non-existent-slug}` → 404 page
4. `/cart`, `/login`, etc. → still work (file-based routing priority)

**Step 6: Commit**

```bash
git add pages/[slug].tsx pages/user/[username].tsx
git commit -m "feat: vanity URL routing — [slug].tsx resolves products + profiles"
```

---

## Phase 3: Creator Profiles (Backend Required — Plan Only)

Phase 3 requires the `spree_creator_profiles` Rails engine in beeper-admin. This is documented in the design doc at `docs/plans/2026-03-08-beeper-platform-evolution-design.md` sections 3a-3c.

**When Phase 3 backend is ready**, the frontend work is:

1. Update `pages/[slug].tsx` getServerSideProps to call `/api/v1/creator_profiles/:username`
2. Create `components/CreatorProfile/CreatorProfile.tsx` with hero banner, tabs (Sample Packs, Presets, Visualizers, Products), social links
3. Enable the "Creator Profile" section in `components/AccountProfile/AccountProfile.tsx` (currently stubbed as "Coming soon")
4. Add `useCreatorProfile` hook fetching from the new API endpoints

---

## Verification Checklist

### Phase 1

- [ ] LogoBlob: morphs through 8 unique shapes at ~7s cycle
- [ ] LogoBlob: shapes are randomized (not sequential loop)
- [ ] LogoBlob: border glow is noticeably brighter with cyan accent
- [ ] LogoBlob: no feTurbulence filter in SVG (check with browser devtools)
- [ ] Scroll: no jank or sticking on homepage
- [ ] Scroll: `#__next` has `overflow-x: hidden` (not `clip`)
- [ ] Homepage: loads instantly (ISR pre-rendered)
- [ ] Homepage: no refetch on route change back to `/`
- [ ] Homepage: build output shows `(ISR: 60 Seconds)` for `/home`

### Phase 2

- [ ] Signup: single screen with email, password, confirm, terms
- [ ] Signup: no wizard steps, no TipBot, no DOB/income/address fields
- [ ] Signup: auto-login → redirect to `/account/profile?welcome=true`
- [ ] Profile: welcome banner shows on first visit after signup
- [ ] Profile: basic info (first/last name, display name, bio) saves to Spree
- [ ] Profile: shipping section present but optional
- [ ] Profile: creator section shows "Coming soon" stub
- [ ] Profile: "Skip for now" returns to homepage
- [ ] Vanity URLs: `/{product-slug}` → product page
- [ ] Vanity URLs: `/user/{username}` → 301 to `/{username}`
- [ ] Vanity URLs: reserved slugs (`/cart`, `/login`) still work
- [ ] Vanity URLs: unknown slug → 404
