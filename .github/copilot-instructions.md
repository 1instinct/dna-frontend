# DNA Frontend - GitHub Copilot Instructions

## Coding Principles

1. Always aim for the ideal. Strive for clean, maintainable, and efficient code that achieves the most advanced and cutting-edge solutions possible within the project's constraints.
1. Prioritize readability and maintainability. Write code that is easy to understand and modify by other developers.
1. Follow established patterns. Adhere to the existing architecture, design patterns, and coding conventions
1. Optimize for performance. Ensure the code is efficient and performs well, especially for critical paths.
1. Ensure responsiveness. Design components and layouts to work seamlessly across various devices and screen sizes.
1. Avoid upgrading locked dependencies. Do not suggest or implement upgrades for dependencies that are explicitly version-locked in the project.
1. Use TypeScript effectively. Leverage TypeScript's type system to enhance code quality and catch potential issues early.
1. Keep `index.ts` files dumb, only exporting from other files without adding logic.
1. Keep `pages/` files focused on routing and high-level composition, avoiding complex logic.
1. Place the majority of markup in capitalized component files and folders within `components/`.
1. Every new

## Project Overview

This is a **production Next.js 13 e-commerce application** using the **Pages Router** (not App Router). The frontend integrates with a custom **Spree 4.2** backend API located in the `dna-admin` repository.

## Critical Version Constraints ⚠️

**DO NOT upgrade or suggest upgrading these dependencies:**

- `next@13.1.1` - Frozen version, uses Pages Router
- `react@18.2.0` - Frozen version
- `@spree/storefront-api-v2-sdk` - Local package at `file:contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz`
  - Custom build for Spree 4.2 backend compatibility
  - Newer versions break backend integration

## Tech Stack

### Core Framework

- **Next.js 13.1.1** with Pages Router (file-based routing in `/pages`)
- **React 18.2.0** with TypeScript strict mode
- **TypeScript 4.9.4** with strict type checking

### Styling

- **Tailwind CSS 3** utility classes, configured in `tailwind.config.ts` (custom breakpoints, `brand` and `gray` colours, `darkMode: "class"`)
- **shadcn/ui** primitives (Radix UI underneath) in `components/ui/`, configured by `components.json`
- Theme tokens are CSS variables (`--background`, `--primary`, ...) in `styles/globals.css`
- `cn()` from `@lib/utils` (clsx + tailwind-merge) composes conditional classes
- `lucide-react` for icons
- Emotion and Material-UI were removed; do not reintroduce them

### State Management

- **React Query 3.6.0** for server state, data fetching, and caching
- **Local Storage** for token management via `config/storage.ts`
- All query keys centralized in `hooks/queryKeys.ts`

### Key Libraries

- `pure-react-carousel` - Image carousels
- `formik` + `yup` - Form handling and validation
- `react-input-mask` - Masked inputs (phone, etc.)
- Custom type definitions in `typings/` folder

## Project Structure

```
components/          # React components
  shared/           # Reusable UI primitives (Button, Logo, etc.)
  ComponentName/
    index.ts                      # Barrel export
    ComponentName.tsx             # Component logic and Tailwind markup
    types/index.d.ts             # TypeScript interfaces

hooks/              # React Query hooks
  useCart/          # Cart operations
  useProducts/      # Product catalog
  useCheckout/      # Checkout flow
  queryKeys.ts      # Centralized query key constants

pages/              # Next.js Pages Router
  _app.tsx          # App wrapper with providers
  _document.tsx     # Custom HTML document
  [productSlug].tsx # Dynamic product pages
  api/              # API routes

config/             # Configuration
  spree.ts          # Spree API client initialization
  storage.ts        # Token/localStorage utilities
  auth.ts           # Auth provider with react-query-auth

typings/            # Custom TypeScript definitions
components/ui/      # shadcn/ui primitives (Button, Dialog, Select, ...)
lib/utils.ts        # cn() class helper
styles/             # globals.css (Tailwind layers, theme CSS variables), fonts.css
utilities/          # Helper functions and constants
```

## Code Patterns & Conventions

### Component Structure

```typescript
// ComponentName.tsx
import React from "react";
import { cn } from "@lib/utils";
import { Button } from "@components/ui";
import { ComponentNameProps } from "./types";

export const ComponentName: React.FC<ComponentNameProps> = ({
  prop1,
  highlighted
}) => (
  <div className="p-5 bg-background sm:p-8">
    <h1 className={cn("text-xl font-semibold", highlighted ? "text-brand" : "text-foreground")}>
      {prop1}
    </h1>
    <Button variant="outline">Action</Button>
  </div>
);

// types/index.d.ts
export interface ComponentNameProps {
  prop1: string;
  highlighted?: boolean;
}

// index.ts
export { ComponentName } from "./ComponentName";
```

### Data Fetching with React Query

```typescript
// hooks/useResource/index.ts
import { useQuery, useMutation, useQueryClient } from "react-query";
import { QueryKeys } from "@hooks/queryKeys";

// Fetch function
export const fetchResource = async (id: string) => {
  const storage = (await import("../../config/storage")).default;
  const token = await storage.getToken();

  const response = await spreeClient.resource.show(
    { bearerToken: token?.access_token },
    id
  );

  if (response.isSuccess()) {
    return response.success();
  } else {
    throw new Error(response.fail().message || "Request failed");
  }
};

// Query hook
export const useResource = (id: string) => {
  return useQuery([QueryKeys.RESOURCE, id], () => fetchResource(id), {
    enabled: !!id,
    staleTime: 30000
  });
};

// Mutation hook with cache invalidation
export const useUpdateResource = () => {
  const queryClient = useQueryClient();

  return useMutation(updateResource, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.RESOURCE);
    }
  });
};
```

### Theme Usage

Use Tailwind's theme instead of hardcoded values: semantic colours from the CSS variables
(`bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`),
brand colours (`text-brand`, `bg-brand-secondary`, `text-gray-dark`) and the custom breakpoints
(`ss` 375, `xs` 414, `sm` 768, `md` 1024, `lg` 1280, `lgxl` 1440, `xl` 1800 px). Dark mode uses
the `dark:` variant; `NEXT_PUBLIC_DARK_MODE` turns it on.

### Responsive Design

```typescript
import { useMediaQuery } from "react-responsive";

const isMobile = useMediaQuery({ maxWidth: 767 });
const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
const isDesktop = useMediaQuery({ minWidth: 1025 });

// Prefer Tailwind's responsive prefixes in markup:
<div className="p-2.5 xs:p-5" />
```

### API Integration Patterns

```typescript
// All Spree API calls follow this pattern:
const response = await spreeClient.someEndpoint.method(tokens, params);

if (response.isSuccess()) {
  const data = response.success();
  // Handle success
} else {
  const error = response.fail();
  throw new Error(error.message || "Operation failed");
}

// Token management:
import storage from "@config/storage";

// For authenticated users:
const token = await storage.getToken();
const bearerToken = token?.access_token;

// For guest carts:
const orderToken = await storage.getOrderToken();
```

### Environment Variables

Access via `process.env.*`. `NEXT_PUBLIC_*` values are inlined into the browser bundle, so secrets
drop the prefix and are read only in `pages/api/*` or `lib/server/*`:

- `NEXT_PUBLIC_SPREE_API_URL` - Backend API URL
- `SPREE_ACCESS_TOKEN` - Spree storefront key, server-only (used by `pages/api/public/[...path].ts`; never `NEXT_PUBLIC_`)
- `NEXT_PUBLIC_DARK_MODE` - Dark mode toggle
- `NEXT_PUBLIC_IS_MAINT_MODE` - Maintenance mode
- `NEXT_PUBLIC_LOGO_PATH` - Logo image path
- `NEXT_PUBLIC_FEATURED_TAXON` - Spree taxon permalink for the `/browse` Featured shelf (default `collections/featured`)
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry error reporting; empty disables it (the other `SENTRY_*` vars are in `.env.example`)

## Common Tasks

### Adding a New Component

1. Create folder: `components/ComponentName/`
2. Add files: `ComponentName.tsx`, `ComponentName.styles.tsx`, `types/index.d.ts`, `index.ts`
3. Export from `components/components.ts` or `components/index.ts`
4. Use barrel exports for cleaner imports

### Adding a New API Hook

1. Create `hooks/useResourceName/index.ts`
2. Add query key to `hooks/queryKeys.ts`
3. Export from `hooks/index.ts`
4. Follow React Query patterns with proper error handling

### Working with Forms

```typescript
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().min(8).required()
});

<Formik
  initialValues={{ email: "", password: "" }}
  validationSchema={validationSchema}
  onSubmit={handleSubmit}
>
  {({ errors, touched }) => (
    <Form>
      <Field name="email" type="email" />
      {errors.email && touched.email && <div>{errors.email}</div>}
    </Form>
  )}
</Formik>;
```

### Image Handling

```typescript
import Image from "next/image";

// For static images:
<Image
  src="/images/logo.png"
  alt="Logo"
  width={141}
  height={35}
  priority
/>

// For dynamic images with proper aspect ratio:
<Image
  src={imagePath}
  alt={altText}
  width={0}
  height={0}
  sizes="(max-width: 768px) 100vw, 50vw"
  style={{ width: 'auto', height: '35px' }}
/>
```

## Code Style

- Use **functional components** with hooks
- Prefer **named exports** over default exports
- Use **TypeScript interfaces** for all props
- Avoid `any` type - use proper types or `unknown`
- Use **React Query** for all server state
- Use **local state** (useState) only for UI state
- Import paths use aliases: `@components`, `@hooks`, `@config`, `@utilities`
- Format with Prettier (run `yarn format`)
- Lint with ESLint (run `yarn lint`)

## Testing & Development

```bash
yarn dev                # Development server
yarn build              # Production build
yarn lint               # ESLint check
yarn format             # Format with Prettier
yarn pre-commit         # Run all checks
```

## Important Notes

- **Spree API responses** use custom format (not standard JSON:API)
- **Cart merging** happens automatically on login (see `config/auth.ts`)
- **Menu system** uses `menu_location` API with ids (1=main menu, 2=footer)
- **Authentication** uses OAuth bearer tokens stored in localStorage
- **Guest carts** use order tokens for anonymous users
- **Theme** supports dark mode through Tailwind's `dark:` variant (`NEXT_PUBLIC_DARK_MODE`)

## When Suggesting Code

✅ **Do:**

- Use existing patterns from the codebase
- Style with Tailwind classes and compose them with `cn()`
- Reach for a `components/ui` primitive before building a new one
- Use React Query for data fetching
- Follow the established folder structure
- Use TypeScript with proper types
- Use theme colours and breakpoints before hardcoding values
- Consider mobile responsiveness
- Handle loading and error states

❌ **Don't:**

- Suggest upgrading locked dependencies
- Use App Router patterns (this uses Pages Router)
- Add Emotion, Material-UI or another CSS-in-JS library back
- Forget to invalidate queries after mutations
- Use inline styles where a Tailwind class exists
- Hardcode API URLs (use env vars)
- Skip TypeScript types
- Ignore existing component patterns

## Spree Storefront API v2 SDK Integration

### Overview

- **SDK Location:** `contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz` (do not upgrade).
- **Purpose:** All Spree backend API calls must use this SDK.

### Client Structure

- Create the client with `makeClient`.
- Main endpoint groups:
  - `products`, `taxons`, `countries`, `cart`, `checkout`, `authentication`, `account`, `order`
- Each group matches Spree API endpoints (e.g., `cart.addItem`, `checkout.orderUpdate`).

### Authentication

- Most methods require a token:
  - **Bearer token** (logged-in user): `{ bearerToken }`
  - **Order token** (guest cart): `{ orderToken }`

### Response Handling

- All SDK methods return a result object.
- Use `.isSuccess()` and `.success()` to check and extract data.
- Use `.isFail()` and `.fail()` to handle errors (`SpreeSDKError` or subclass).

### Example Usage

```typescript
const response = await spreeClient.cart.addItem(
  { orderToken },
  { variant_id: "1", quantity: 2 }
);
if (response.isSuccess()) {
  const cart = response.success();
} else {
  const error = response.fail();
  // handle error
}
```

### Endpoint Highlights

- **Authentication:** `getToken`, `refreshToken`
- **Account:** `create`, `update`, `accountInfo`, `addressesList`, `createAddress`, `removeAddress`
- **Cart:** `create`, `show`, `addItem`, `setQuantity`, `removeItem`, `emptyCart`, `applyCouponCode`, `removeCouponCode`
- **Checkout:** `orderUpdate`, `orderNext`, `advance`, `complete`, `addStoreCredits`, `removeStoreCredits`, `paymentMethods`, `shippingMethods`
- **Products:** `list`, `show`
- **Taxons:** `list`, `show`
- **Order:** `status`

### TypeScript Types

- All responses and parameters are strongly typed.
- Use provided interfaces (e.g., `IOrderResult`, `IProductResult`, `IAccountResult`).
- Tokens: `{ bearerToken?: string; orderToken?: string }`.

### Error Handling

- Errors are never thrown; always check `.isFail()` and use `.fail()` for details.
- Error types: `SpreeSDKError`, `MisconfigurationError`, `NoResponseError`, `SpreeError`, `BasicSpreeError`, `ExpandedSpreeError`.

### Do Not

- Do not upgrade or replace the SDK.
- Do not bypass `.isSuccess()`/`.isFail()` pattern.
- Do not use raw fetch or axios for Spree API calls—always use the SDK.

### Store Info

- The SDK does **not** provide a `/store` endpoint.
- Use a custom fetch (see `hooks/useStore/useStore.ts`) for store info.
