FROM node:14-buster

WORKDIR /usr/src/app

COPY . .

RUN apt upgrade && apt update -y
RUN apt install g++ libtool autoconf curl
RUN npm i
RUN git reset --hard

CMD ["npm", "start"]
