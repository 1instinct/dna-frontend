# Logo Components

## Usage

### Standard Logo

```tsx
import { Logo } from "./components/Logo";

<Logo />;
```

### Animated Logo

```tsx
import { Logo } from './components/Logo';

// With animation
<Logo animated={true} />

// With animation and tagline
<Logo animated={true} showTagline={true} />
```

### LogoBlob

```tsx
import { LogoBlob } from './components/LogoBlob';

// Standard
<LogoBlob />

// With animation
<LogoBlob isAnimated={true} />

// With animation and tagline
<LogoBlob isAnimated={true} showTagline={true} />
```

## Props

Both `Logo` and `LogoBlob` components accept the following props:

- `animated` (boolean): Enable the hovering letter animation. Default: `false`
- `showTagline` (boolean): Display the "PLAYWITHMUSIC" tagline below the logo. Default: `false`
- `hasBlob` (any): Legacy prop for blob behavior
- `isDark` (any): Legacy prop for dark mode

## Animation Details

When `animated={true}`:

- Each letter/element animates independently
- Letters hover up and down in a smooth sine wave motion
- Each letter has a staggered delay for a wave-like effect
- Animation loops infinitely
- Duration: 2 seconds per cycle
- Movement: 8px vertical displacement

When `showTagline={true}`:

- The SVG viewBox expands from `0 0 385 127` to `0 0 385 165`
- Additional tagline paths are rendered and animated
- Each tagline letter also participates in the hovering animation
