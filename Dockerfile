FROM node:15

WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . .
RUN yarn run build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=20080

EXPOSE 20080

CMD ["node", "src/server/index.js"]
