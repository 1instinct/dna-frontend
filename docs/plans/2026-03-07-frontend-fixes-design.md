# Frontend Fixes Design — 2026-03-07

## Round 2 Issues (Current)

6. **Cart bug** — guest `cart.create()` missing `include` param in `addItemToCart()`
7. **Cart error on page load** — stale guest tokens not cleared on failure
8. **Signup mobile layout** — TipBot overlaps inputs, vertical spacing too compressed
9. **Background gradient animation** — signup wizard needs subtle animated gradient

## Round 1 Issues (Completed)

1. **Network errors** → broken routing, cart error on load, add-to-cart silent failure
2. **Cart icon cut off** — header `overflow-x-clip` clips absolute-positioned badge
3. **Gallery not swipeable** — no touch/swipe, lightbox has no navigation
4. **No variant-based image switching** — color selection doesn't filter gallery images
5. **Add-to-cart doesn't update variant** — always sends first variant ID regardless of color/size selection

## Implementation

### 1. Network resilience + routing fix

**Files:** `hooks/useCart/index.ts`, `pages/[productSlug].tsx`, `components/CartSidebar/CartSidebar.tsx`

- `useCart`: add `retry: 2`, `retryDelay: 1000` to react-query config
- `[productSlug].tsx` `getServerSideProps`: wrap `fetchStreams`/`fetchProducts` in try/catch so SSR errors don't block client-side navigation
- `CartSidebar`: replace "Cart Error" text with retry button

### 2. Cart icon overflow fix

**File:** `components/Header/Header.tsx`

- Remove `overflow-x-clip` from header, or add `overflow-visible` to the cart container div

### 3. Swipeable gallery + lightbox

**File:** `components/ProductDetails/ProductGallery.tsx`

- Replace static image with Embla Carousel (already installed)
- Main gallery: swipe on mobile, click thumbnails on desktop, arrow key navigation
- Lightbox: full-screen Embla carousel with swipe, prev/next arrows, keyboard nav, thumbnail strip
- Keep existing hover zoom on desktop (non-touch)

### 4. Variant-based image switching

**Files:** `hooks/useProduct/index.ts`, `components/ProductDetails/RetailProductDetails.tsx`

- Add `variants.images` to product fetch include param
- When `selectedColor` changes, find matching variant, get its image IDs, filter gallery
- No color selected = show all product images

### 5. Add-to-cart variant selection + feedback

**File:** `components/ProductDetails/RetailProductDetails.tsx`

- When selectedColor/selectedSize change, find matching variant, update `addItem.variant_id`
- Add loading/success/error states to ADD TO CART button
- Show toast or button text change on success ("Added!")

## Round 2 Implementation

### 6. Cart bug — missing include parameter

**File:** `hooks/useCart/index.ts:155`

- Change `spreeClient.cart.create()` → `spreeClient.cart.create(undefined, { include: "line_items,variants" })`
- This is the only `cart.create()` in the file missing the include param

### 7. Stale guest token cleanup

**File:** `hooks/useCart/index.ts` lines 82-96

- When `cart.show` fails for a guest, call `storage.setGuestOrderToken("")` before creating new cart
- Prevents repeated failures from a corrupted/expired token

### 8. Signup mobile layout

**File:** `components/SignupWizard/Questions/Questions.styles.tsx`

- `InputGroupWrapper`: `mt-0` on mobile (was `-mt-20`), keep `sm:mt-32`
- `QuestionWrapper`: `mt-2` on mobile (was `-mt-5`)
- `InputWrapper`: `my-3` (was `my-2.5`)

### 9. Background gradient animation

**Files:** `styles/synthwave.css`, `components/SignupWizard/SignupWizard.tsx`

- Add `@keyframes gradient-shift` — slow 20s loop moving background-position on oversized gradient
- Add `.animate-gradient-shift` class
- Apply to signup wizard outer container
