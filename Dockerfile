FROM node:alpine

WORKDIR /app

COPY contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz
RUN yarn add file:contrib/spree-storefront-api-v2-sdk-4.5.1003.tgz
COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]

