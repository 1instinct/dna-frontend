#!/bin/bash
set -euo pipefail

# ============================================================
# dna-frontend: Build, Push, and Deploy to MicroK8s cluster
# Builds natively on Pi (no cross-compilation needed).
# Run from the dna-frontend directory on the dev machine.
# ============================================================

REGISTRY_HOST="${REGISTRY_HOST:-smokey01}"
REGISTRY_PORT="32000"
IMAGE_NAME="dna-frontend"
TAG="${TAG:-latest}"
KUBECTL_NODE="${KUBECTL_NODE:-smokey01}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Step 1: Sync source to ${REGISTRY_HOST} ==="
rsync -avz --exclude node_modules --exclude .git --exclude .next \
  ./ "${REGISTRY_HOST}:~/build/${IMAGE_NAME}/"

echo "=== Step 2: Build image on ${REGISTRY_HOST} ==="
ssh "${REGISTRY_HOST}" bash -c "'
  cd ~/build/${IMAGE_NAME} &&
  sudo docker build -t localhost:${REGISTRY_PORT}/${IMAGE_NAME}:${TAG} . &&
  sudo docker push localhost:${REGISTRY_PORT}/${IMAGE_NAME}:${TAG}
'"

echo "=== Step 3: Apply Kubernetes manifests ==="
ssh "${KUBECTL_NODE}" sudo microk8s kubectl apply -f - < k8-service.yml
ssh "${KUBECTL_NODE}" sudo microk8s kubectl apply -f - < k8-deployment.yml
ssh "${KUBECTL_NODE}" sudo microk8s kubectl apply -f - < k8-ingress.yml

echo "=== Step 4: Rollout restart ==="
ssh "${KUBECTL_NODE}" sudo microk8s kubectl rollout restart deployment/dna-frontend -n default
ssh "${KUBECTL_NODE}" sudo microk8s kubectl rollout status deployment/dna-frontend -n default --timeout=120s

echo ""
echo "=== Deploy complete ==="
ssh "${KUBECTL_NODE}" sudo microk8s kubectl get pods -n default -l app=dna-frontend -o wide
