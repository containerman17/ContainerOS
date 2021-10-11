FROM node:14-alpine
WORKDIR /app
RUN npm i nodemon -g

COPY package*.json ./

RUN npm install
COPY . .
