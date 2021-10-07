FROM node:14-alpine
WORKDIR /app
COPY package*.json ./

RUN npm i nodemon -g

RUN npm install
COPY . .
