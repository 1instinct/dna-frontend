FROM node:16-alpine
# FROM node:alpine

WORKDIR /app

COPY contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz
COPY package.json yarn.lock ./
RUN sed -i 's,file:contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz,file:/app/contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz,' package.json
RUN yarn add file:/app/contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz

# RUN yarn install
RUN yarn install --network-concurrency 1 --network-timeout 1000000

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]

