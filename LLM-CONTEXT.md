# DNA Frontend - LLM Context File

## Project Overview

Next.js-based e-commerce frontend for DNA, integrated with a **custom Spree 4.2 backend**. This is a production application with specific version constraints due to backend compatibility requirements.

## Critical Constraints ⚠️

### DO NOT Upgrade These Dependencies

- **@spree/storefront-api-v2-sdk**: Pinned to local version `file:contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz`
  - Custom-built for compatibility with Spree 4.2 backend (dna-admin repo)
  - Breaking changes in newer versions are incompatible with backend
- **Next.js 13.1.1**: Frozen version
- **React 18.2.0**: Frozen version
- **Material-UI v4.12.3**: Legacy version, not v5+

### Backend Integration

- Backend repo: `dna-admin` (separate repository)
- Backend uses custom Spree 4.2 fork
- API endpoint: `http://localhost:8080/api/v2/storefront/`
- API responses follow Spree 4.x structure (not standard JSON:API)

## Tech Stack

### Core

- **Next.js 13.1.1**: SSR framework with custom webpack configuration
- **React 18.2.0**: With TypeScript strict mode
- **TypeScript 4.9.4**: Strict type checking enabled

### Styling

- **Emotion 11.13.3**: CSS-in-JS (`@emotion/styled`, `@emotion/react`)
- **Material-UI v4.12.3**: Legacy UI components
- **Styled Components pattern**: Use `shouldForwardProp` to filter props

### State & Data

- **React Query 3.6.0**: Data fetching, caching, mutations
- **Local Storage**: Token management via `config/storage.ts`

### UI Components

- **react-burger-menu**: Mobile navigation (custom type definitions in `typings/`)
- **react-input-mask**: Phone input (custom type definitions in `typings/`)
- **pure-react-carousel**: Image galleries
- Custom component library in `components/`

## Architecture Patterns

### Data Fetching

```typescript
// Use React Query hooks from hooks/
import { useCart } from "@hooks/useCart";
import { useProducts } from "@hooks/useProducts";

// All query keys centralized in hooks/queryKeys.ts
import { QueryKeys } from "@hooks/queryKeys";
```

### Mutations with Cache Invalidation

```typescript
const mutation = useMutation(apiFunction, {
  onSuccess: () => {
    queryClient.invalidateQueries(QueryKeys.CART);
  }
});
```

### Emotion Styled Components

```typescript
import styled from "@emotion/styled";
import isPropValid from "@emotion/is-prop-valid";

// Filter custom props to prevent DOM warnings
const StyledDiv = styled("div", {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== "customProp"
})<{ customProp?: boolean }>`
  // styles
`;
```

## Spree API Structure

### Cart Response Shape

```typescript
{
  data: {
    id: "46",
    type: "cart",
    attributes: {
      item_count: 6,
      display_total: "$343.94",
      // ... other cart attributes
    },
    relationships: {
      line_items: {
        data: [
          { id: "53", type: "line_item" },
          { id: "54", type: "line_item" }
        ]
      },
      variants: {
        data: [
          { id: "117", type: "variant" },
          { id: "118", type: "variant" }
        ]
      }
    }
  },
  included: [] // Often empty in Spree 4.x responses
}
```

### Important API Quirks

1. **Line Item IDs ≠ Variant IDs**: Use line_item.id for quantity updates, not variant.id
2. **Included Array**: Often empty - cannot rely on it for line item details
3. **Include Parameter**: Pass in params, not token: `cart.show({ orderToken }, { include: 'line_items,variants' })`
4. **CORS on DELETE**: Use `setQuantity(itemId, 0)` instead of `removeItem(itemId)` to avoid CORS errors
5. **Token Types**:
   - User: `bearerToken` (OAuth)
   - Guest: `orderToken` (stored in localStorage)

## File Structure

### Key Directories

```
components/        # React components (atomic design approach)
  shared/         # Reusable UI primitives
  CartSidebar/    # Cart slide-out panel
  Header/         # Main navigation

hooks/            # React Query hooks and custom hooks
  useCart/        # Cart data & mutations
  useProducts/    # Product catalog
  queryKeys.ts    # Centralized query key constants

pages/            # Next.js pages (file-based routing)
  _app.tsx        # Global app wrapper
  _document.tsx   # Custom HTML document

config/           # Configuration modules
  spree.ts        # Spree client initialization
  storage.ts      # Token management
  auth.ts         # Authentication helpers

typings/          # Custom TypeScript definitions
  react-burger-menu.d.ts
  react-input-mask.d.ts

contrib/          # Local dependency packages
  spree-storefront-api-v2-sdk-4.5.1003.tgz
```

### Component Structure Pattern

```
ComponentName/
  index.ts              # Exports
  ComponentName.tsx     # Main component
  ComponentName.styles.tsx  # Emotion styled components
```

## Common Issues & Solutions

### TypeScript JSX Errors

- **Problem**: `X cannot be used as a JSX component`
- **Solution**: Create custom type definitions in `typings/` folder

### React Prop Warnings

- **Problem**: `React does not recognize the customProp prop on a DOM element`
- **Solution**: Add `shouldForwardProp` filter to styled components

### Material-UI Deprecations

- **Badge overlap**: Use `overlap="rectangular"` not `overlap={true}`
- **Old API**: Stick to v4 patterns, do not use v5 documentation

### Cart State Issues

- **Quantities not updating**: Use local state for optimistic updates since `included` array is often empty
- **Wrong IDs**: Always use `line_item.id` for mutations, not `variant.id`
- **CORS errors**: Avoid `removeItem()`, use `setQuantity(itemId, 0)` instead

### Module Resolution

- Webpack configured to ensure single React instance
- Custom resolution hacks for legacy dependencies
- See `next.config.js` for details

## Development Workflow

### Running the App

```bash
yarn dev          # Start dev server on http://localhost:3000
yarn build        # Production build
yarn start        # Production server
```

### Backend Required

- Must run `dna-admin` backend on `http://localhost:8080`
- Frontend will not function without backend running

### Debugging

- `constants.IS_DEBUG`: Toggle console logging (imported from `@utilities/constants`)
- React Query DevTools: Available in development
- Chrome DevTools: Check network tab for Spree API calls

## Code Style Guidelines

### TypeScript

- Use strict types, avoid `any` when possible
- Define interfaces for component props
- Use type imports: `import type { IProduct } from '@spree/...'`

### React

- Functional components with hooks
- Use React Query for server state
- Use local state for UI-only state
- Proper cleanup in useEffect

### Styling

- Emotion styled components
- Mobile-first responsive design
- Consistent spacing using theme values
- Filter custom props from DOM

### Error Handling

```typescript
try {
  const result = await apiCall();
  if (result.isSuccess()) {
    return result.success();
  } else {
    throw new Error(result.fail().message);
  }
} catch (error) {
  console.error("Operation failed:", error);
  // Handle error appropriately
}
```

## Security Notes

- Tokens stored in localStorage (see `config/storage.ts`)
- OAuth bearer tokens for authenticated users
- Order tokens for guest carts
- No sensitive data in Redux/state management

## Performance Considerations

- React Query caching reduces API calls
- Image optimization via Next.js Image component
- Code splitting via Next.js dynamic imports
- Lazy load components when appropriate

## Testing

- No test suite currently implemented
- Manual testing against local backend required
- Test cart operations thoroughly (add, update, remove)

## Deployment

- Dockerfile included for containerization
- Kubernetes configs: `k8-*.yml`
- Heroku ready: `Procfile`
- Environment-specific configs in `config/`

## Recent Changes & Known Issues

### Fixed Issues

✅ TypeScript JSX component errors (custom type definitions)
✅ React key warnings (unique keys using `id + index`)
✅ Badge deprecation warnings (`overlap="rectangular"`)
✅ Prop forwarding to DOM (shouldForwardProp filters)
✅ Facebook Pixel syntax error (removed HTML comments)
✅ react-responsive-masonry replacement (CSS grid)
✅ Cart 404 errors (auto-create cart on error)
✅ Cart display (proper line_item to variant mapping)

### Current State

- Cart sidebar functional with optimistic UI updates
- Quantity buttons use local state tracking
- Line item quantities tracked client-side
- CORS workaround using setQuantity(0) for removal

### Known Limitations

- `included` array often empty in API responses
- Cannot rely on server-provided line item quantities
- Must track quantities locally for responsive UI
- Backend CORS blocks DELETE on removeItem endpoint

## Additional Resources

- Spree API Docs: https://api.spreecommerce.org/docs/api-v2/
- Next.js 13 Docs: https://nextjs.org/docs (v13 specific)
- React Query v3 Docs: https://react-query-v3.tanstack.com/
- Emotion Docs: https://emotion.sh/docs/introduction

## Questions or Updates?

When making changes to this codebase:

1. Check dependency constraints before upgrading anything
2. Test against running backend (dna-admin)
3. Verify cart operations work end-to-end
4. Check for TypeScript errors with `yarn tsc --noEmit`
5. Ensure no React warnings in console

---

_Last updated: December 2025_
