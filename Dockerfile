FROM node:current-alpine

WORKDIR /app

COPY package.json .

RUN npm i --silent

COPY . .

ENTRYPOINT [ "node", "--experimental-loader=./util/loader.js", "." ]