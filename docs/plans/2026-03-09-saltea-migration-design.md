# Saltea Migration to DNA Platform

**Date:** 2026-03-09
**Status:** Approved

## Context

Saltea is a bottled tea brand (est. 2016) currently running a Meteor+React marketing site on AWS (52.39.27.183). The goal is to rebuild it as a full e-commerce storefront on the DNA platform (dna-frontend + dna-admin/Spree) and deploy to the on-premises Kubernetes cluster, then swap DNS.

**Source repo:** `Saltea/saltea-app` — Meteor+React, 12 components, LESS styling, no cart/checkout.

## Approach: Separate Deployment

Deploy a separate instance of dna-frontend with Saltea-specific environment variables, pointing to a Saltea store within the shared Spree instance.

### Architecture

```
┌─────────────────────────────────────────────────┐
│              On-Prem K8s Cluster                │
│                                                 │
│  ┌──────────────┐       ┌──────────────────┐    │
│  │ dna-frontend │       │    dna-admin     │    │
│  │ (Saltea env) │──API──│  (Spree + Saltea │    │
│  │  saltea.co   │       │    Store)        │    │
│  └──────────────┘       └──────────────────┘    │
│         │                        │              │
│  ┌──────────────┐       ┌──────────────────┐    │
│  │ dna-frontend │──API──│  (Spree + DNA    │    │
│  │  (DNA env)   │       │    Store)        │    │
│  └──────────────┘       └──────────────────┘    │
│         │                                       │
│  ┌──────────────┐                               │
│  │ NGINX Ingress│ ← saltea.co / instinct.is     │
│  └──────────────┘                               │
└─────────────────────────────────────────────────┘
```

- **Shared codebase** — same dna-frontend Docker image, different env vars
- **Shared dna-admin** — Spree multi-store; Saltea is a separate Store in the same Spree instance
- **Separate K8s deployments** — `saltea-frontend` deployment + service + ingress
- **Shared database** — one Spree DB, two stores

## Brand Theme (Fresh Redesign)

### Color Palette

Modernized from original Saltea site (`@brand: #916A70`):

| Token | Value | Notes |
|-------|-------|-------|
| `--primary` | `#916A70` | Burgundy — earthy, tea-appropriate |
| `--secondary` | `#F0E8E5` | Warm white (lightened from `#E6DDDE`) |
| `--accent` | TBD sage/teal | Natural, tea-aligned complementary |
| `--background` | `#FAFAF8` | Clean warm white |
| `--foreground` | `#2D2D2D` | Soft dark |

### Typography

Use fonts already in dna-frontend or select a refined pairing:
- Display/headings: one serif or distinctive sans
- Body: clean sans-serif (Anybody or Roboto from existing set)

### Products (3 Flavors)

1. **The Caribbean Sea** — strawberries, dried rose petals, hibiscus tea, himalayan crystal sea salt, pure cane sugar
2. **The Rio Grande** — fresh lemons, fresh mint, himalayan crystal sea salt, pure cane sugar
3. **The Finger Lakes** — fresh green apples, fresh rosemary, jasmine green tea, himalayan crystal sea salt, pure cane sugar

### Content to Migrate

- Product copy, health claims, origin story → Spree product descriptions + CMS pages
- Cloudinary-hosted images/video → keep on Cloudinary
- Social links (FB: saltea.drinks, IG: saltea.co, Twitter: drinksaltea)
- Contact: aaron@saltea.co, +1-718-314-0730
- MailChimp newsletter integration

## Pages

| Page | Old Source | DNA Route | Work Required |
|------|-----------|-----------|---------------|
| Home (hero + products) | `home.jsx` | `/` | Theme + content |
| Product detail | new | `/[productSlug]` | Exists — theme only |
| Browse/shop | new | `/browse` | Exists — theme only |
| Cart | new | `/cart` | Exists — theme only |
| Checkout | new | `/checkout` | Exists — theme only |
| About/story | `what-is-this.jsx` | `/about` | Content migration |
| Contact | `contact.jsx` | New page or env config | Build or configure |
| Legal | `legal.jsx` | `/terms` | Content migration |

Most pages already exist in dna-frontend. Primary work is theming via CSS variables and Spree store setup.

## K8s Deployment

### New Manifests

- `saltea-frontend-deployment.yml`
- `saltea-frontend-service.yml`
- `saltea-frontend-ingress.yml`
- `saltea-frontend-secrets.yml`

### Environment Variables

```
NEXT_PUBLIC_SITE_TITLE=Saltea
NEXT_PUBLIC_SHORT_TITLE=Saltea
NEXT_PUBLIC_ENTITY_NAME=Saltea
NEXT_PUBLIC_SPREE_API_URL=<shared dna-admin URL>
NEXT_PUBLIC_SPREE_ACCESS_TOKEN=<saltea store token>
NEXT_PUBLIC_COMPANY_EMAIL=aaron@saltea.co
NEXT_PUBLIC_COMPANY_PHONE=+1-718-314-0730
NEXT_PUBLIC_LOGO_PATH=/images/saltea-logo.svg
NEXT_PUBLIC_FACEBOOK_SLUG=saltea.drinks
NEXT_PUBLIC_INSTAGRAM_SLUG=saltea.co
```

## DNS Cutover Plan

1. Deploy Saltea frontend on K8s, verify at internal URL
2. Update `saltea.co` DNS: AWS `52.39.27.183` → K8s cluster ingress IP
3. Let's Encrypt auto-provisions TLS cert via cert-manager
4. Verify HTTPS on `saltea.co`
5. Decommission AWS instance (and `salteablog`/`sole` hosts if unused)

## Spree Store Setup

1. Create "Saltea" store in Spree admin
2. Add 3 products with variants (flavor, size)
3. Upload product images (from Cloudinary)
4. Configure shipping zones and rates
5. Configure tax settings
6. Set up Stripe payment integration
7. Generate Saltea-specific API access token

## Out of Scope (for now)

- Blog (was at blog.saltea.co)
- User roles/reseller flow from old site
- MailChimp integration (can add later)
- Mobile app
