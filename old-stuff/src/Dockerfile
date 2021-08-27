# builder
FROM node:16-alpine AS typescript-builder

WORKDIR /app
COPY ./src/package*.json ./

RUN npm install

COPY ./src .

RUN npm run build

# main container
FROM node:16-alpine

WORKDIR /app
COPY ./src/package*.json ./
RUN npm ci --only=prod
COPY --from=typescript-builder ./app/build .

EXPOSE 8000

ARG COS_VERSION
ENV COS_VERSION $COS_VERSION

CMD [ "node", "index.js" ]

