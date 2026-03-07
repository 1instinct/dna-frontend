# Header, Logo Animation & Splash Page Design

## Summary

Four related changes to the header and logo system:

1. **AnimatedLogo `animate` prop** — Toggle the per-letter sine-wave bobbing on/off
2. **Transparent header on splash page** — Remove background/border/logo on home page, keep all other elements (cart, search, auth, social links, favorites)
3. **Header logo loading animation** — Bobbing animation activates during route changes via Next.js Router events
4. **Slogan under header logo** — "PLAY WITH MUSIC" tagline tightly beneath the header AnimatedLogo, scaled down for header context

## Components Affected

- `components/Logo/AnimatedLogo.tsx` — Add `animate` prop
- `components/Header/Header.tsx` — Transparent mode, loading state, slogan
- `components/LogoBlob/LogoBlob.tsx` — Pass through `animate` prop

## Design Details

### AnimatedLogo `animate` prop

- New boolean prop `animate` (default: `true`)
- When `false`: letters render at resting Y=0, no spring animation
- When `true`: existing sine-wave bobbing runs unchanged

### Transparent header on splash page

- Detect home page via `useRouter().pathname === '/'`
- When on `/`: remove `glass-panel` class, `border-glass-border`, hide center AnimatedLogo + slogan
- All other header elements remain visible and functional
- Header stays sticky but fully transparent

### Header logo loading state

- Use Next.js `Router.events` (`routeChangeStart` / `routeChangeComplete` / `routeChangeError`)
- Drive `isLoading` boolean state
- Pass `animate={isLoading}` to header's AnimatedLogo
- On splash page the logo is hidden, so no visual conflict

### Slogan under header logo

- Use `showTagline={true}` on header's AnimatedLogo
- Scale tagline down for header context
- Hidden on splash page along with the logo
