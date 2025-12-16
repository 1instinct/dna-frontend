<<<<<<< HEAD
FROM node:18-bullseye
# FROM node:16-alpine
# FROM node:alpine
# FROM node:21-alpine3.18

RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    libc6-compat \
    vips-dev

WORKDIR /app

# COPY contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz
# COPY package.json yarn.lock ./
COPY package.json yarn.lock contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz ./

RUN sed -i 's,file:spree-storefront-api-v2-sdk-4.5.1003.tgz,file:/app/spree-storefront-api-v2-sdk-4.5.1003.tgz,' package.json
# RUN yarn add file:spree-storefront-api-v2-sdk-4.5.1003.tgz

RUN npm install /app/spree-storefront-api-v2-sdk-4.5.1003.tgz

RUN npm install sharp@0.26.3

# RUN yarn install
RUN yarn install --network-concurrency 1 --network-timeout 1000000
=======
FROM node:14-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
>>>>>>> 4a34e52 (update env.example, add Dockerfile, add k8-deploy)

COPY . .

RUN yarn build

<<<<<<< HEAD
ENV PORT 3000

=======
>>>>>>> 4a34e52 (update env.example, add Dockerfile, add k8-deploy)
EXPOSE 3000

CMD ["yarn", "start"]

