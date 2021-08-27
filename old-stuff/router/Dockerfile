
FROM caddy:2.4.3-builder-alpine AS builder

# Build caddy
RUN xcaddy build \
    --with github.com/pteich/caddy-tlsconsul \
    --with github.com/baldinof/caddy-supervisor

# Install nodejs
RUN apk add --update nodejs npm \
    && npm i -g typescript

# npm i and build
WORKDIR /worker
COPY worker/package*.json ./
RUN npm install
COPY worker ./
RUN tsc

# Final container
FROM caddy:2.4.3-alpine
RUN apk add --update nodejs npm

# Caddy settings
COPY ./Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /usr/bin/caddy /usr/bin/caddy

# Worker
COPY --from=builder /worker/build /worker/
COPY worker/package*.json /worker/
RUN cd /worker && npm ci --only=prod