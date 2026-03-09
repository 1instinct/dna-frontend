# Saltea Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deploy Saltea (saltea.co) as a full e-commerce storefront on the DNA platform, using a separate dna-frontend instance with Saltea branding, backed by a Saltea store in Spree.

**Architecture:** Same dna-frontend Docker image, separate K8s deployment with Saltea-specific env vars. Spree multi-store — one Spree instance serves both DNA and Saltea stores. Fresh redesign inspired by the original Saltea brand (burgundy `#916A70`, warm whites, tea-forward).

**Tech Stack:** Next.js 13, Tailwind CSS, Shadcn UI, Spree 4.5, MicroK8s, Let's Encrypt, Docker, NGINX Ingress

**Design Doc:** `docs/plans/2026-03-09-saltea-migration-design.md`

---

## Phase 1: Saltea Branding Assets & Theme Configuration

### Task 1: Add Saltea logo and brand assets to dna-frontend

**Files:**
- Create: `public/images/saltea-logo.svg`
- Create: `public/images/saltea-og.jpg`

**Step 1: Extract or create Saltea logo SVG**

The old site used text "saltea." as the logo (in `components/header.jsx`). Create a clean SVG wordmark. If an existing logo file is available from Cloudinary or the old repo, use that. Otherwise create a minimal text-based SVG:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50">
  <text x="0" y="38" font-family="Karla, sans-serif" font-size="36" font-weight="700" fill="#916A70">saltea.</text>
</svg>
```

Save to `public/images/saltea-logo.svg`.

**Step 2: Copy OG image from old site**

The old site has `public/img/saltea.jpg` (960x960). Copy it:

```bash
cp /Users/smokey/Internal/Saltea/code/saltea-app/public/img/saltea.jpg \
   /Users/smokey/Internal/DNA/code/dna-frontend/public/images/saltea-og.jpg
```

**Step 3: Commit**

```bash
cd /Users/smokey/Internal/DNA/code/dna-frontend
git add public/images/saltea-logo.svg public/images/saltea-og.jpg
git commit -m "feat(saltea): add Saltea logo and OG image assets"
```

---

### Task 2: Create Saltea environment configuration

**Files:**
- Create: `env.saltea.example`

**Step 1: Create Saltea env template**

Create `env.saltea.example` in dna-frontend root, based on `.env.example` but with Saltea-specific values:

```env
# Saltea Environment Configuration
# Copy to .env.development and fill in secrets

# === Feature Flags ===
NEXT_PUBLIC_DARK_MODE=false
NEXT_PUBLIC_IS_MAINT_MODE=false
NEXT_PUBLIC_IS_PREVIEW_MODE=false
NEXT_PUBLIC_SIMPLE_SIGNUP=false
NEXT_PUBLIC_IS_DEBUG_MODE=false

# === Company Info ===
NEXT_PUBLIC_COMPANY_EMAIL=aaron@saltea.co
NEXT_PUBLIC_COMPANY_PHONE=+1-718-314-0730
NEXT_PUBLIC_ENTITY_NAME=Saltea

# === Site Metadata ===
NEXT_PUBLIC_SITE_TITLE=Saltea
NEXT_PUBLIC_SHORT_TITLE=Saltea
NEXT_PUBLIC_PAGE_TITLE=Saltea — Lightly Salted Teas
NEXT_PUBLIC_PAGE_DESCRIPTION=Fresh, lightly salted teas made with real ingredients. The Caribbean Sea, The Rio Grande, The Finger Lakes.
NEXT_PUBLIC_OG_IMAGE_PATH=/images/saltea-og.jpg
NEXT_PUBLIC_OG_IMAGE_WIDTH=960
NEXT_PUBLIC_OG_IMAGE_HEIGHT=960

# === Logo ===
NEXT_PUBLIC_LOGO_PATH=/images/saltea-logo.svg

# === Social ===
NEXT_PUBLIC_FACEBOOK_SLUG=saltea.drinks
NEXT_PUBLIC_INSTAGRAM_SLUG=saltea.co
NEXT_PUBLIC_TWITTER_SLUG=drinksaltea
NEXT_PUBLIC_YOUTUBE_SLUG=

# === Legal ===
NEXT_PUBLIC_PRIVACY_SLUG=privacy
NEXT_PUBLIC_TERMS_SLUG=terms

# === Spree API ===
NEXT_PUBLIC_SPREE_API_URL=https://dna-admin.instinct.is
NEXT_PUBLIC_SPREE_ACCESS_TOKEN=xxx

# === Analytics (disable for now) ===
NEXT_PUBLIC_GA_TRACKING_CODE=
NEXT_PUBLIC_GA_DEBUG_MODE=false
NEXT_PUBLIC_TRACK_GA=false
NEXT_PUBLIC_TRACK_KONTENT=false
NEXT_PUBLIC_FB_APP_ID=
NEXT_PUBLIC_FB_PIXEL_ID=

# === Mailchimp (Saltea list) ===
NEXT_PUBLIC_MAILCHIMP_API_KEY=xxx
NEXT_PUBLIC_MAILCHIMP_AUDIENCE_ID=ed6f4004a9
NEXT_PUBLIC_MAILCHIMP_CLIENT_KEY=xxx
NEXT_PUBLIC_MAILER=mailchimp

# === Kontent CMS (disabled for now) ===
NEXT_PUBLIC_KONTENT_PROJECT_ID=
NEXT_PUBLIC_KONTENT_MANAGEMENT_KEY=

# === Google Maps ===
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# === Mux (disabled) ===
NEXT_PUBLIC_MUX_ACCESS_TOKEN=
NEXT_PUBLIC_MUX_SECRET_KEY=
```

**Step 2: Commit**

```bash
git add env.saltea.example
git commit -m "feat(saltea): add Saltea environment variable template"
```

---

## Phase 2: K8s Deployment Manifests

### Task 3: Create Saltea frontend K8s deployment manifest

**Files:**
- Create: `k8/saltea-frontend-deployment.yml`

**Step 1: Create the deployment manifest**

Based on the existing `k8-deployment.yml`, create `k8/saltea-frontend-deployment.yml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: saltea-frontend
  namespace: default
  labels:
    app: saltea-frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: saltea-frontend
  template:
    metadata:
      labels:
        app: saltea-frontend
    spec:
      containers:
        - name: saltea-frontend
          image: localhost:32000/dna-frontend:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
            - name: DEPLOY_ENV
              value: "prod"
            - name: PORT
              value: "3000"
          envFrom:
            - secretRef:
                name: saltea-frontend-secrets
```

Note: Uses the same `dna-frontend:latest` image — only the secrets differ.

**Step 2: Commit**

```bash
mkdir -p k8
git add k8/saltea-frontend-deployment.yml
git commit -m "feat(saltea): add K8s deployment manifest for saltea-frontend"
```

---

### Task 4: Create Saltea frontend K8s service manifest

**Files:**
- Create: `k8/saltea-frontend-service.yml`

**Step 1: Create the service manifest**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: saltea-frontend
  namespace: default
spec:
  selector:
    app: saltea-frontend
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 3000
  type: ClusterIP
```

**Step 2: Commit**

```bash
git add k8/saltea-frontend-service.yml
git commit -m "feat(saltea): add K8s service manifest for saltea-frontend"
```

---

### Task 5: Create Saltea frontend K8s ingress manifest

**Files:**
- Create: `k8/saltea-frontend-ingress.yml`

**Step 1: Create the ingress manifest**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: saltea-frontend
  namespace: default
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    acme.cert-manager.io/http01-edit-in-place: "true"
  labels:
    app: saltea-frontend
spec:
  ingressClassName: nginx
  rules:
    - host: saltea.co
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: saltea-frontend
                port:
                  number: 8080
    - host: www.saltea.co
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: saltea-frontend
                port:
                  number: 8080
  tls:
    - hosts:
        - saltea.co
        - www.saltea.co
      secretName: saltea-frontend-tls
```

**Step 2: Commit**

```bash
git add k8/saltea-frontend-ingress.yml
git commit -m "feat(saltea): add K8s ingress manifest for saltea.co"
```

---

### Task 6: Create Saltea frontend K8s secrets template

**Files:**
- Create: `k8/saltea-frontend-secrets.example.yml`

**Step 1: Create the secrets template**

Based on `secret.example.yml`, with Saltea-specific values. All values must be base64-encoded in the real `secrets.yml` (not committed).

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: saltea-frontend-secrets
  namespace: default
type: Opaque
data:
  # Base64-encode all values: echo -n 'value' | base64
  #
  # Feature Flags
  NEXT_PUBLIC_DARK_MODE: xxx
  NEXT_PUBLIC_IS_MAINT_MODE: xxx
  NEXT_PUBLIC_IS_PREVIEW_MODE: xxx
  NEXT_PUBLIC_SIMPLE_SIGNUP: xxx
  NEXT_PUBLIC_IS_DEBUG_MODE: xxx
  #
  # Company
  NEXT_PUBLIC_COMPANY_EMAIL: xxx    # aaron@saltea.co
  NEXT_PUBLIC_COMPANY_PHONE: xxx    # +1-718-314-0730
  NEXT_PUBLIC_ENTITY_NAME: xxx      # Saltea
  #
  # Site Metadata
  NEXT_PUBLIC_SITE_TITLE: xxx       # Saltea
  NEXT_PUBLIC_SHORT_TITLE: xxx      # Saltea
  NEXT_PUBLIC_PAGE_TITLE: xxx       # Saltea — Lightly Salted Teas
  NEXT_PUBLIC_PAGE_DESCRIPTION: xxx
  NEXT_PUBLIC_OG_IMAGE_PATH: xxx    # /images/saltea-og.jpg
  NEXT_PUBLIC_OG_IMAGE_WIDTH: xxx   # 960
  NEXT_PUBLIC_OG_IMAGE_HEIGHT: xxx  # 960
  #
  # Logo
  NEXT_PUBLIC_LOGO_PATH: xxx        # /images/saltea-logo.svg
  #
  # Social
  NEXT_PUBLIC_FACEBOOK_SLUG: xxx    # saltea.drinks
  NEXT_PUBLIC_INSTAGRAM_SLUG: xxx   # saltea.co
  NEXT_PUBLIC_TWITTER_SLUG: xxx     # drinksaltea
  NEXT_PUBLIC_YOUTUBE_SLUG: xxx
  #
  # Legal
  NEXT_PUBLIC_PRIVACY_SLUG: xxx     # privacy
  NEXT_PUBLIC_TERMS_SLUG: xxx       # terms
  #
  # Spree API
  NEXT_PUBLIC_SPREE_API_URL: xxx    # https://dna-admin.instinct.is
  NEXT_PUBLIC_SPREE_ACCESS_TOKEN: xxx
  #
  # Analytics (disabled initially)
  NEXT_PUBLIC_GA_TRACKING_CODE: xxx
  NEXT_PUBLIC_GA_DEBUG_MODE: xxx
  NEXT_PUBLIC_TRACK_GA: xxx
  NEXT_PUBLIC_TRACK_KONTENT: xxx
  NEXT_PUBLIC_FB_APP_ID: xxx
  NEXT_PUBLIC_FB_PIXEL_ID: xxx
  #
  # Mailchimp
  NEXT_PUBLIC_MAILCHIMP_API_KEY: xxx
  NEXT_PUBLIC_MAILCHIMP_AUDIENCE_ID: xxx  # ed6f4004a9
  NEXT_PUBLIC_MAILCHIMP_CLIENT_KEY: xxx
  NEXT_PUBLIC_MAILER: xxx           # mailchimp
  #
  # Kontent CMS (disabled)
  NEXT_PUBLIC_KONTENT_PROJECT_ID: xxx
  NEXT_PUBLIC_KONTENT_MANAGEMENT_KEY: xxx
  #
  # Google Maps
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: xxx
```

**Step 2: Commit**

```bash
git add k8/saltea-frontend-secrets.example.yml
git commit -m "feat(saltea): add K8s secrets template for saltea-frontend"
```

---

### Task 7: Create Saltea build-deploy script

**Files:**
- Create: `k8/saltea-build-deploy.sh`

**Step 1: Create the build and deploy script**

Based on `k8-build-deploy.sh`, adapted for Saltea:

```bash
#!/bin/bash
set -euo pipefail

# Saltea Frontend Build & Deploy
# Uses the same dna-frontend image — only K8s secrets differ.
# Run from dna-frontend root directory.

REGISTRY_HOST="${REGISTRY_HOST:-smokey01}"
REGISTRY_PORT="32000"
IMAGE_NAME="dna-frontend"
TAG="${TAG:-latest}"
KUBECTL_NODE="${KUBECTL_NODE:-smokey01}"
KUBECTL="ssh ${KUBECTL_NODE} sudo microk8s kubectl"

echo "=== Deploying Saltea Frontend ==="
echo "Using image: localhost:${REGISTRY_PORT}/${IMAGE_NAME}:${TAG}"

# Step 1: Apply Saltea K8s manifests
echo "Applying K8s manifests..."
${KUBECTL} apply -f - < k8/saltea-frontend-secrets.yml
${KUBECTL} apply -f - < k8/saltea-frontend-service.yml
${KUBECTL} apply -f - < k8/saltea-frontend-deployment.yml
${KUBECTL} apply -f - < k8/saltea-frontend-ingress.yml

# Step 2: Rollout restart & verify
echo "Rolling out..."
${KUBECTL} rollout restart deployment/saltea-frontend -n default
${KUBECTL} rollout status deployment/saltea-frontend -n default --timeout=120s

# Step 3: Summary
echo ""
echo "=== Saltea Frontend Deployed ==="
${KUBECTL} get pods -n default -l app=saltea-frontend -o wide
echo ""
echo "URL: https://saltea.co (after DNS cutover)"
echo "Internal: Check ingress with: ${KUBECTL} get ingress saltea-frontend"
```

**Step 2: Make executable and commit**

```bash
chmod +x k8/saltea-build-deploy.sh
git add k8/saltea-build-deploy.sh
git commit -m "feat(saltea): add build-deploy script for saltea-frontend"
```

---

### Task 8: Add Saltea targets to parent Makefile

**Files:**
- Modify: `/Users/smokey/Internal/DNA/code/Makefile`

**Step 1: Add Saltea deploy target**

Add after the existing `deploy-frontend` target:

```makefile
deploy-saltea: ## Deploy saltea-frontend (same image as dna-frontend, different secrets)
	$(KUBECTL) apply -f - < dna-frontend/k8/saltea-frontend-secrets.yml
	$(KUBECTL) apply -f - < dna-frontend/k8/saltea-frontend-service.yml
	$(KUBECTL) apply -f - < dna-frontend/k8/saltea-frontend-deployment.yml
	$(KUBECTL) apply -f - < dna-frontend/k8/saltea-frontend-ingress.yml
	$(KUBECTL) rollout restart deployment/saltea-frontend -n default
	@echo "saltea-frontend deployed. URL: https://saltea.co"

logs-saltea: ## Tail logs for saltea-frontend
	$(KUBECTL) logs -f deployment/saltea-frontend -n default
```

**Step 2: Commit**

```bash
cd /Users/smokey/Internal/DNA/code
git add Makefile
git commit -m "feat(saltea): add deploy-saltea and logs-saltea Makefile targets"
```

---

## Phase 3: Add saltea.co to Parent Ingress

### Task 9: Update app-level ingress to include saltea.co

**Files:**
- Modify: `/Users/smokey/Internal/DNA/code/dna-ingress.yml`

**Step 1: Add saltea.co rules to the consolidated ingress**

Add to the `rules` array:

```yaml
  - host: saltea.co
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: saltea-frontend
            port:
              number: 8080
  - host: www.saltea.co
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: saltea-frontend
            port:
              number: 8080
```

Add to the `tls.hosts` array:

```yaml
    - saltea.co
    - www.saltea.co
```

**Step 2: Commit**

```bash
cd /Users/smokey/Internal/DNA/code
git add dna-ingress.yml
git commit -m "feat(saltea): add saltea.co to cluster ingress routing"
```

---

## Phase 4: Spree Store Setup (Manual — dna-admin)

### Task 10: Create Saltea store in Spree

This task is performed in the Spree admin UI or Rails console. Documenting steps here for the implementer.

**Step 1: Access Spree admin**

Navigate to `https://dna-admin.instinct.is/admin` and log in.

**Step 2: Create new store**

Go to Settings → Stores → New Store:
- **Name:** Saltea
- **URL:** saltea.co
- **Mail from:** aaron@saltea.co
- **Default currency:** USD
- **Supported currencies:** USD
- **Default locale:** en
- **SEO title:** Saltea — Lightly Salted Teas
- **Meta description:** Fresh, lightly salted teas made with real ingredients. The Caribbean Sea, The Rio Grande, The Finger Lakes.

**Step 3: Generate API access token**

In Rails console (`cd dna-admin && rails c`):

```ruby
store = Spree::Store.find_by(name: 'Saltea')
token = Spree::OauthAccessToken.create!(
  resource_owner_id: nil,
  application_id: nil,
  scopes: 'storefront'
)
puts token.token
# Save this token for saltea-frontend-secrets.yml
```

**Step 4: Create Saltea taxonomy**

In admin → Products → Taxonomies:
- Create taxonomy: "Saltea Flavors"
- Add taxons: "All Teas", "Signature Blends"

**Step 5: Create products**

Create 3 products in Spree admin under the Saltea store:

**Product 1: The Caribbean Sea**
- Name: The Caribbean Sea
- Description: Fresh strawberries, dried rose petals, hibiscus tea, a touch of pure himalayan crystal sea salt, and a touch of pure cane sugar.
- Price: TBD
- Slug: the-caribbean-sea
- Images: Upload from Cloudinary or `/Users/smokey/Internal/Saltea/code/saltea-app/public/img/caribbean.gif`

**Product 2: The Rio Grande**
- Name: The Rio Grande
- Description: Fresh lemons, fresh mint, a touch of pure himalayan crystal sea salt, and a touch of pure cane sugar.
- Price: TBD
- Slug: the-rio-grande
- Images: Upload from `/Users/smokey/Internal/Saltea/code/saltea-app/public/img/rio-grande.gif`

**Product 3: The Finger Lakes**
- Name: The Finger Lakes
- Description: Fresh green apples, fresh rosemary, jasmine green tea, a touch of pure himalayan crystal sea salt, and a touch of pure cane sugar.
- Price: TBD
- Slug: the-finger-lakes
- Images: Upload from `/Users/smokey/Internal/Saltea/code/saltea-app/public/img/finger-lakes.gif`

**Step 6: Configure shipping**

In admin → Settings → Shipping:
- Create shipping category: "Bottled Tea"
- Create shipping method: "Standard Shipping" (flat rate TBD)
- Create zone: "US" (all US states)

**Step 7: Configure payments**

In admin → Settings → Payments:
- Add payment method: Stripe
- Configure Stripe API keys (from Saltea Stripe account)

---

## Phase 5: Populate Secrets & Deploy

### Task 11: Create real saltea-frontend-secrets.yml

**Files:**
- Create: `k8/saltea-frontend-secrets.yml` (NOT committed — gitignored)

**Step 1: Generate base64 values and populate secrets**

```bash
cd /Users/smokey/Internal/DNA/code/dna-frontend

# Generate base64 values for each env var
echo -n 'false' | base64          # ZmFsc2U=
echo -n 'aaron@saltea.co' | base64  # YWFyb25Ac2FsdGVhLmNv
echo -n '+1-718-314-0730' | base64   # KzEtNzE4LTMxNC0wNzMw
echo -n 'Saltea' | base64          # U2FsdGVh
echo -n 'Saltea — Lightly Salted Teas' | base64
echo -n '/images/saltea-logo.svg' | base64
echo -n '/images/saltea-og.jpg' | base64
echo -n 'saltea.drinks' | base64
echo -n 'saltea.co' | base64
echo -n 'drinksaltea' | base64
echo -n 'https://dna-admin.instinct.is' | base64
# ... etc for all values from env.saltea.example
```

Copy `k8/saltea-frontend-secrets.example.yml` to `k8/saltea-frontend-secrets.yml` and replace all `xxx` with real base64 values.

**Step 2: Ensure secrets file is gitignored**

Check that `k8/saltea-frontend-secrets.yml` is in `.gitignore`:

```bash
echo 'k8/saltea-frontend-secrets.yml' >> .gitignore
git add .gitignore
git commit -m "chore: gitignore saltea secrets"
```

---

### Task 12: Build and deploy saltea-frontend

**Step 1: Build dna-frontend image (if not recently built)**

```bash
cd /Users/smokey/Internal/DNA/code
make build-frontend
```

**Step 2: Deploy Saltea**

```bash
make deploy-saltea
```

Or from dna-frontend:

```bash
cd /Users/smokey/Internal/DNA/code/dna-frontend
./k8/saltea-build-deploy.sh
```

**Step 3: Verify deployment**

```bash
ssh smokey01 sudo microk8s kubectl get pods -l app=saltea-frontend
ssh smokey01 sudo microk8s kubectl get ingress saltea-frontend
ssh smokey01 sudo microk8s kubectl logs deployment/saltea-frontend --tail=50
```

Expected: Pod running, ingress created for saltea.co.

**Step 4: Test internally**

Before DNS cutover, test via port-forward:

```bash
ssh smokey01 sudo microk8s kubectl port-forward deployment/saltea-frontend 3001:3000
# Then visit http://smokey01:3001 to verify Saltea branding loads
```

---

## Phase 6: DNS Cutover

### Task 13: Update DNS records for saltea.co

**Step 1: Identify cluster ingress IP**

```bash
ssh smokey01 sudo microk8s kubectl get svc -n ingress nginx-ingress-microk8s-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
# Or check the node IP used by other ingresses
```

**Step 2: Update DNS**

At the domain registrar (wherever saltea.co is managed):

- **A record:** `saltea.co` → cluster ingress IP (replace `52.39.27.183`)
- **A record:** `www.saltea.co` → cluster ingress IP
- **Remove or update:** any other DNS records pointing to old AWS instances

**Step 3: Wait for propagation and verify**

```bash
# Check DNS propagation
dig saltea.co A +short
dig www.saltea.co A +short

# Verify TLS certificate (may take a few minutes after DNS propagation)
curl -I https://saltea.co
```

**Step 4: Verify site loads**

Open `https://saltea.co` in browser. Confirm:
- Saltea branding (logo, title)
- Products load from Spree
- Cart/checkout functional
- TLS certificate valid

---

## Phase 7: Decommission Old Infrastructure

### Task 14: Shut down old AWS resources

**Step 1: Verify new site is fully functional for at least 24-48 hours**

Monitor logs:

```bash
make logs-saltea
```

**Step 2: Stop old Meteor app**

```bash
ssh saltea "sudo docker stop saltea"
# or via mup: cd saltea-app && mup stop
```

**Step 3: Clean up SSH config (optional)**

Remove or comment out old entries in `~/.ssh/config`:

```
# Host saltea
#     HostName: 52.39.27.183
#     User: ubuntu
#     IdentityFile: ~/.ssh/saltea-app.pem
```

**Step 4: Terminate AWS instance**

Via AWS console or CLI — terminate the EC2 instance at `52.39.27.183` (and `34.211.83.98` / `52.25.50.230` if also unused).

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-2 | Brand assets and env config |
| 2 | 3-8 | K8s deployment manifests and build scripts |
| 3 | 9 | Cluster ingress update |
| 4 | 10 | Spree store setup (manual) |
| 5 | 11-12 | Populate secrets and deploy |
| 6 | 13 | DNS cutover |
| 7 | 14 | Decommission old infra |
