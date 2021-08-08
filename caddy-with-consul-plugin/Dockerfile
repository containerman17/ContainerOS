# Build
FROM caddy:builder-alpine AS builder

RUN xcaddy build \
    --with github.com/pteich/caddy-tlsconsul \
    --with github.com/baldinof/caddy-supervisor

# Final container
FROM caddy:alpine
RUN apk add --update nodejs npm

COPY Caddyfile /etc/caddy/Caddyfile

COPY --from=builder /usr/bin/caddy /usr/bin/caddy