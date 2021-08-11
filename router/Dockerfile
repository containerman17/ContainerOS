# Build
FROM caddy:builder-alpine AS builder

RUN xcaddy build \
    --with github.com/pteich/caddy-tlsconsul \
    --with github.com/baldinof/caddy-supervisor

RUN apk add --update nodejs npm \
    && npm i -g typescript

WORKDIR /src
COPY src/package*.json ./
RUN npm install
COPY src ./
RUN tsc


# Final container
FROM caddy:alpine
RUN apk add --update nodejs npm

COPY ./router/Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /src/build /nodejs-app/
COPY src/package*.json /nodejs-app/
RUN cd /nodejs-app/ && npm ci --only=prod

COPY --from=builder /usr/bin/caddy /usr/bin/caddy