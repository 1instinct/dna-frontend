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
