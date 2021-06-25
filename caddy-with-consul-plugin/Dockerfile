FROM caddy:builder-alpine AS builder

RUN xcaddy build \
    --with github.com/pteich/caddy-tlsconsul

FROM caddy:alpine

COPY --from=builder /usr/bin/caddy /usr/bin/caddy