FROM ubuntu:14.04

RUN sudo apt-get -q -y update
RUN sudo apt-get -q -y install nodejs npm git

RUN sudo ln -s "$(which nodejs)" /usr/bin/node

RUN npm install npm -g

COPY package.json /src/package.json
WORKDIR /src

EXPOSE 9000

ENV PORT 9000
ENV NODE_ENV production

CMD node server/app.js

COPY . /src
