FROM node:latest

RUN apt-get -y install curl

ENV DOCKER_BUCKET get.docker.com
ENV DOCKER_VERSION 1.10.2
ENV DOCKER_SHA256 3fcac4f30e1c1a346c52ba33104175ae4ccbd9b9dbb947f56a0a32c9e401b768

RUN curl -fSL "https://${DOCKER_BUCKET}/builds/Linux/x86_64/docker-$DOCKER_VERSION" -o /usr/local/bin/docker \
	&& echo "${DOCKER_SHA256}  /usr/local/bin/docker" | sha256sum -c - \
	&& chmod +x /usr/local/bin/docker

RUN mkdir /src

RUN npm install nodemon -g

WORKDIR /src
COPY package.json /src/package.json
RUN npm install

ADD nodemon.json nodemon.json

EXPOSE 3000

CMD npm start