# dna-frontend

Upstream boilerplate for the DNA platform's storefront: Next.js 13.1 (Pages Router), React 18.2
and TypeScript, styled with Tailwind CSS and shadcn/ui, reading `dna-admin` through the Spree
Storefront API (a pinned local SDK in `contrib/`) and React Query. Detailed conventions live in
[.github/copilot-instructions.md](.github/copilot-instructions.md) and
[LLM-CONTEXT.md](LLM-CONTEXT.md); this file holds the rules that decide where work goes.

## Where this repo sits

The DNA boilerplates are **dna-frontend** (this repo), `1instinct/dna-admin` (its backend) and
`1instinct/expo-juce` (a native audio module). Each product forks them into its own
organization and builds its product-specific features there; a fork's own CLAUDE.md names the
product. Forks merge `main` from here to inherit features and fixes, so anything committed here
lands in every fork on its next upstream merge.

## The rule: generalized, product-agnostic features only

A change belongs here only if any product built on DNA would want it as is.

1. No product names, domains, app store links, logos, copy, colours or hardware concepts in
   code, tests, docs or assets. Use neutral examples (`example.com`).
1. Anything a product needs to differ is configuration: a `NEXT_PUBLIC_*` env var (site title,
   logo path, social links, feature flags), content managed in `dna-admin` (menus, homepage
   sections, static pages), or the Tailwind theme tokens a fork overrides.
1. A feature that is part generic and part product specific is split: the generic component,
   hook or page lands here first and reaches the fork through an upstream merge; the product
   layer is built in the fork on top of it.
1. A bug in inherited code is fixed here, then merged down. Fixing it only in a fork makes
   the two drift apart.
1. Deleting or renaming a file here deletes or renames it in every fork on the next merge.
   Say so in the PR when a fork may still depend on it.

## Working here

1. `main` is the trunk; branch from it and open PRs against it.
1. Do not upgrade the frozen dependencies: `next@13.1.1`, `react@18.2.0` and the local
   `@spree/storefront-api-v2-sdk` tarball.
1. Style with Tailwind classes and the primitives in `components/ui/`, composed with `cn()`
   from `@lib/utils`. Emotion and Material-UI were removed; do not bring them back.
1. Keep `pages/` thin (routing and composition), markup in `components/<Name>/`, and query keys
   in `hooks/queryKeys.ts`.
1. Local setup: `cp .env.example .env.development`, fill it in, `yarn dev`. Checks:
   `yarn lint-check` (tsc and eslint) and `yarn build`.

## Commits and PRs

No attribution lines (no `Co-Authored-By`, no generated-by footers). Lists use repeated `1.` so
items can be reordered without renumbering.

```
[Feature|Fix|Chore]: Sentence-case summary of the outcome, changes:
1. What changed, naming the file or symbol, and why
1. Next change
```

PR titles match the commit subject. PR bodies use `## What`, `## Why`, `## Changes` and
`## Verify` sections with `1.` lists, and say which forks are affected when it matters.
