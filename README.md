# DNA Frontend

## Getting Started

### Running Locally

1. `cp .env.example .env.development`
1. Replace `.env.development` with variables from Aaron
1. `yarn dev`
1. Open [http://localhost:3000](http://localhost:3000) in your browser.

_Gotchas:_

- Does the backend (`dna-admin`) have menus, products, live streams
- Do you have the backend url & api key in `.env`?

## Styles

Always use `@emotion/styled` wherever possible. If regular CSS is required, use one of the following style files.
We manage our global styles in several files:

- `./styles/global-styles.tsx` (global stylesheet)
- `./styles/fonts.css` (global @font-face rules)
- `./styles/all.css` (global styles injected in at app root)
- `./styles/theme.tsx` (global theme variables)
- `./emotion.d.ts` (theme typings)

## Gotchas

- The app has a "Maintenance Mode" (branded fullscreen takeover), simply set `IS_MAINT_MODE=true`, and the `<Header/>` will disappear and `<Home/>` gets taken over by `<ComingSoon/>`. It's fun, try it!
- All the data for the app comes in from our staging server on Heroku, but you can also run the dna-admin CMS+API locally (hint: login only works with a localhost API)
- To run against the local API, set the `SPREE_API_URL` environment
  variable to the local API host/port
- Complains about missing `.next/build-manifest.json` are usually indications
  of a `next` build error. Try running `$(npm bin)/next build` to see the
  exact error.

## Deployment

- Create pipeline in Heroku
- add Github repo
- Create app
- heroku buildpacks:add <https://github.com/heroku/heroku-buildpack-nodejs> -a app-name
- heroku buildpacks:add heroku/nodejs -a app-name

Unset all Heroku env vars:
`heroku config:unset $(heroku config --shell | sed 's/=.*//' | xargs) -a app-name`

## Deploy URLS

POL Admin Interface & API
<http://dna-admin-dev.instinct.is/>
<http://dna-admin-staging.instinct.is/>

POL Frontend Interface
<https://dna-frontend-dev.instinct.is/>
<https://dna-frontend-staging.instinct.is/>

## Keeping Your Code Updated

When there are lots of active changes occuring on this repo, make sure to regularly:

1. Commit (or stash) your local changes on your branch
1. `git fetch origin`
1. `git checkout main`
1. `git pull origin main`
1. `git checkout <your_branch>`
1. `git merge main`
1. Fix merge conflicts (if any)
1. `git add .`
1. `git commit -m 'merge in latest main'`

Done!
…now you will be up-to-date with latest code. Do this before you submit your PR, and you can be sure it will be a clean merge.

## Testing API Endpoints

<https://localhost:8080/apidocs/swagger_ui#/>

## Updating a fork

- `git remote add upstream git@github.com:1instinct/dna-frontend.git`
- `git fetch upstream`
- `git checkout main`
- `git pull upstream main`

## Deploy on Heroku

`cat .env.production | grep -v '^#' | xargs -L 1 heroku config:set -a dna-frontend-prod`

## Deploy on Vercel

- Move data fetching into on `getInitialProps`
- Setup Redux

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Deploy to Pi Cluster (MicroK8s)

All deployment is run **from your Mac** via the Makefile in the parent `dna-infra` repo. You do not need to SSH into the Pis manually.

### Quick Reference

```bash
cd ~/Internal/DNA/code   # dna-infra root

# Full build + deploy
make build-frontend      # rsync to Pi, docker build, push to registry
make deploy-frontend     # Apply K8s manifests, rolling restart

# Just redeploy (no code changes, e.g. env var update)
make deploy-frontend
```

### Update Environment Variables

The source of truth for env vars is **`.env.development`** (gitignored). The K8s cluster reads from `secrets.yml` (base64-encoded version of the same values).

**Recommended workflow — use the sync script:**

```bash
cd ~/Internal/DNA/code

# 1. Edit .env.development with your changes
#    (this is the source of truth)

# 2. Regenerate secrets.yml from .env.development
./maintenance/sync-frontend-secrets.sh

# 3. Deploy
make deploy-frontend
```

Or do both in one step:

```bash
./maintenance/sync-frontend-secrets.sh --deploy
```

The sync script handles base64 encoding and key name mapping automatically (e.g. `_SLUG` keys in `.env.development` become `_URL` keys in secrets with full URLs prepended).

**Manual single-value update** (if you just need to change one key):

```bash
# Encode the new value
echo -n 'your-new-value' | base64

# Edit secrets.yml, paste the base64 string
# Then deploy:
make deploy-frontend
```

**How it works:** `make deploy-frontend` runs `kubectl apply` on secrets + manifests and does a rolling restart, so the pod picks up the new env vars immediately.

### Key Name Mapping

Some keys differ between `.env.development` and `secrets.yml`:

| .env.development | secrets.yml (K8s) |
|---|---|
| `NEXT_PUBLIC_COMING_SOON_TEXT` | `NEXT_PUBLIC_COMING_SOON_COPY` |
| `NEXT_PUBLIC_FACEBOOK_SLUG` | `NEXT_PUBLIC_FACEBOOK_URL` (full URL) |
| `NEXT_PUBLIC_INSTAGRAM_SLUG` | `NEXT_PUBLIC_INSTAGRAM_URL` (full URL) |
| `NEXT_PUBLIC_TWITTER_SLUG` | `NEXT_PUBLIC_TWITTER_URL` (full URL) |

The sync script handles these mappings. If editing `secrets.yml` manually, use the K8s column names.

### First-Time Secret Setup

```bash
# Option A: Generate from .env.development (recommended)
./maintenance/sync-frontend-secrets.sh

# Option B: Copy template and fill in manually
cp secret.example.yml secrets.yml
# Encode each value: echo -n 'value' | base64
```

See `secret.example.yml` for the full list of required `NEXT_PUBLIC_*` variables.

### Build + Deploy Flow

```
Your Mac                          smokey01 (Pi)
────────                          ─────────────
make build-frontend
  1. rsync source ──────────────► ~/build/dna-frontend/
  2.                               docker build → localhost:32000/dna-frontend:latest
  3.                               docker push → internal registry

make deploy-frontend
  4. kubectl apply secrets ─────► K8s Secret updated
  5. kubectl apply manifests ───► Deployment/Service/Ingress updated
  6. kubectl rollout restart ───► New pod pulls latest image + env vars
```

### Verify Deployment

```bash
make status              # Check pod is Running
make logs-frontend       # Tail logs for errors

# Or directly:
ssh smokey01 sudo microk8s kubectl get pods -n default -l app=dna-frontend
ssh smokey01 sudo microk8s kubectl logs -l app=dna-frontend -n default --tail=50
```

### Rollback

If the new deployment is broken, restart with the previous image:

```bash
ssh smokey01 sudo microk8s kubectl rollout undo deployment/dna-frontend -n default
```

### K8s Manifest Files

| File | Purpose |
|------|---------|
| `k8-deployment.yml` | Pod spec, image, env vars, resource limits |
| `k8-service.yml` | ClusterIP service (port 8080 → 3000) |
| `k8-ingress.yml` | NGINX ingress for `dna-frontend.instinct.is` with TLS |
| `secrets.yml` | All `NEXT_PUBLIC_*` env vars (base64-encoded) |
| `secret.example.yml` | Template with placeholder values |

### Production URL

`https://dna-frontend.instinct.is`

# TODO:

- Move data fetching into on `getInitialProps`
- Setup Redux

- ~~Flow / Type Checking~~ (TypeScript)
- ~~React~~
- ~~SSR~~ (NextJS)
- ~~State Mgmt~~ (hooks/useContext... no Redux, yet)
- ~~Request Mgmt~~ (React Query)
- ~~Search~~ (Fuse.js)
- Pusher (real-time sockets)
- ~~Styled Components~~ (@emotion/styled)
- Moving Letters
- UI Sounds (proprietary: "npm install beeper")
- Maps
- File upload (ReactDropzone)
- ~~Form validation (Formik)~~
- Animations / Transitions (ReactSpring, GSAP)
- Gestures
- UI Alerts
- Uptime Monitoring
- Twilio
- Unit Testing
- Chat widget
- RSS feeds
- Chatbot (Rasa)
- Masonry ([react-responsive-masonry](https://www.npmjs.com/package/react-responsive-masonry))
- Browser Feature Detection
- Speed/Performance Benchmarking (GTMetrix.com API?)
- Header tags customization (NextJS: `next/header`)
- ~~Secrets management / Environment variables~~ (`dot-env`)
