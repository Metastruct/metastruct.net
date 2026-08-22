FROM node:22-alpine AS build

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
ARG METACONCORD_URL=https://metaconcord.metastruct.net
ARG HISTORY_URL=https://raw.githubusercontent.com/Metastruct/history/master/history.json
ENV NODE_ENV=production
RUN yarn build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 20080
