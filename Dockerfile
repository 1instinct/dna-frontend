FROM node:18-bullseye
# FROM node:16-alpine
# FROM node:alpine
# FROM node:21-alpine3.18

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    python3 \
    make \
    g++ \
    libvips-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# COPY contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz
# COPY package.json yarn.lock ./
COPY package.json yarn.lock contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz ./

RUN sed -i 's,file:spree-storefront-api-v2-sdk-4.5.1003.tgz,file:/app/spree-storefront-api-v2-sdk-4.5.1003.tgz,' package.json
# RUN yarn add file:spree-storefront-api-v2-sdk-4.5.1003.tgz

RUN npm install --legacy-peer-deps /app/spree-storefront-api-v2-sdk-4.5.1003.tgz

RUN npm install --legacy-peer-deps sharp@0.26.3

# RUN yarn install
RUN yarn install --network-concurrency 1 --network-timeout 1000000

COPY . .

RUN yarn build

ENV PORT 3000

EXPOSE 3000

CMD ["yarn", "start"]

