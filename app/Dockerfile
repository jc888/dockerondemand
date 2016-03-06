FROM node:latest

RUN mkdir /src

RUN npm install nodemon -g

WORKDIR /src
COPY package.json /src/package.json
RUN npm install

ADD nodemon.json nodemon.json

EXPOSE 8080

CMD npm start