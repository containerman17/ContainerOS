# builder
FROM node:16-alpine AS typescript-builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# main container
FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=typescript-builder ./app/build .

EXPOSE 8000

CMD [ "node", "index.js" ]

