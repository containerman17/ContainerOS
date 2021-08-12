# builder
FROM node:16-alpine AS typescript-builder

WORKDIR /app
COPY ./src/package*.json ./

# fresh sdk from tarball
# RUN mkdir /sdk
# COPY ./sdk/sdk.tgz /sdk/sdk.tgz
# # TODO: DEBUG
# RUN cd /sdk && npm update && cd /app
COPY ./sdk /sdk
RUN cd /sdk && npm run build && cd /app

RUN npm install

COPY ./src .

RUN npm run build

# main container
FROM node:16-alpine

WORKDIR /app
COPY ./src/package*.json ./
COPY --from=typescript-builder /sdk/*.tgz /sdk/


RUN npm install
COPY --from=typescript-builder ./app/build .

EXPOSE 8000

CMD [ "node", "index.js" ]

