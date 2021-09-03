# ContainerOS prototype

The goal of the project is to provide as simple as possible interface for cluster deployments.

## Instalation
1. Create swarm cluster
```bash
docker swarm init
```
2. Create `caddy` swarm overlay network
```bash
docker network create -d overlay --attachable caddy
```
3. Create secret `root` containing root token
```bash
printf "my super secret token" | docker secret create root_token -
```
4. Run installer
```
docker run --rm quay.io/containeros/installer:latest --secret root_token -v "/var/run/docker.sock:/var/run/docker.sock"
```

## Components

### Cluster API

- Accepts http requests and modifies swarm mode desired cluster state
- Responds with container statuses
- Streams logs
- Works directly with docker API
- Runs only on controller nodes
- Manages users saving them in configs and secrets
- Stateless except for log streaming

# Install container
- Starts router, API server, and docker registry and addon controllers

### Node management container
- Auth docker into registry

### Registry proxy

- Proxies requests to docker registry (thank you, capitain)
- Gets credentials and user access rights from configs and secrets

### Addon controlers 
- Manage databases and other software, defined in configs by API server
- Auto-scales depending on load
