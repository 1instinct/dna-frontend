FROM node:14-alpine
# FROM node:16-alpine
# FROM node:alpine
# FROM node:21-alpine3.18

WORKDIR /app

# COPY contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz
# COPY package.json yarn.lock ./
COPY package.json yarn.lock contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz ./

RUN yarn install --network-concurrency 1 --network-timeout 1000000 --check-files

# RUN sed -i 's,file:contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz,file:/app/contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz,' package.json
# RUN yarn add file:contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz

# RUN yarn install

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]

