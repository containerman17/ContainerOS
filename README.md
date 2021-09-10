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
3. Create secret `root_token` containing root token
```bash
printf "dev" | docker secret create root_token -
```
3. Create config `api_host` containing your domain
```bash
printf "1.2.3.4.nip.io" | docker config create api_host -
```
4. Copy .env.example to .env and set S3 credentials

5. Run installer
```bash
docker run --env-file .env -it --rm -v "/var/run/docker.sock:/var/run/docker.sock" quay.io/containeros/installer:latest
```
5. Optional: tear down
```bash
docker service rm $(docker service ls -q)
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
