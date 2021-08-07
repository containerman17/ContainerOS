# ContainerOS

Lightweight ready-to-use container management system. Batteries [to be] included. The intended date of the 1.0 release is December 2021.

## Goal of the project

To create a system that can replace Kubernetes in 95% of projects. Requirements:

- Easy to understand
- Lightweight and simple
- For developers, not for DevOps people
- Opinionated. All chosen by the majority of the community.
- Zero configuration needed for production
- Easy to write JavaScript/TypeScript controllers
- Hardware-agnostic and cloud-independent. Ready to serve even on Raspberry Pi behind a corporate firewall.
- Fail tolerant. Ready to operate on cheap hardware that breaks. Self-healing
- Scalable to 1000's nodes
- Not expecting a user to set load or scale of containers
- Geo-distributed with the automated placement of containers close to consumers

## Get started 

Install docker:

```bash
curl -sSL https://get.docker.com/ | sh
```

Run ContainerOS:
```bash
docker run -d --name containeros --net=host -v "/var/run/docker.sock:/var/run/docker.sock" quay.io/containeros/containeros:v0.1.2 
```

Start your first container:

```bash
curl --location --request POST 'http://127.0.0.1:8000/v1/microservice?password=dev' \
-H "Content-Type: application/json" \
--data-raw '{
 "name": "test-server",
 "scale": 2,
 "containers": {
 "reg": {"image": "quay.io/bitnami/nginx:latest", "httpPorts": {"80": "hello.localhost"}}
 }
}'
```

Check your containers started: 
```bash
docker ps
```

Check logs:
```bash
docker logs -f containeros
```

## Release notes


### v0.1.2
- Register services with consul
- Pod runner is now faster

### v0.1.1
- Optimized pod-runner for frequent changes

### v0.1.0

- Starting Consul in dev mode
- Creating and updating microservices
- Exposing microservice containers to random ports
- Auth with a master password
- Container pre-pulling

## Roadmap

### August 2021: 
- ~~Register exposed ports with Consul~~
- ClusterDaemons
- Ingress with automatic SSL
- Multi-node deployments
- Docker registry with external S3
- Production build

### Later:
- Affinity to database and anti-affinity in microservice deployments
- Separate microservices into different projects with network isolation
- Support for popular open-source databases (MySQL, Redis, MongoDB)
- Support log in into remote docker registry
- CLI (something in between Heroku CLI and Kubernetes CLI)
- Web GUI and mobile app
- Collect container, node, and ingress metrics
- HTTP health checks
- A nicer website
- Move ClusterAPI to a service with a separate container
- Store container images inside of cluster by default
- Predict deployment load using historical data and schedule accordingly

## Modules

### core/microservice-controller

**Input**: 
- List of microservices
- List of pods
- Health of nodes

**Output**: 
- Creates pods and assigns them to nodes

### apps/cluster-api
**Input**: 
- User API requests

**Output**: 
- CRUD microservices

### core/pod-runner
**Input**: 
- List of pods (`/pods/${hostname}/`)

**Output**: 
- Starts and stops docker containers

### core/node-health-reporter
**Input**: 
- Node load information (CPU, RAM)

**Output**: 
- Node health values in the database

P.S. To be replaced by events, HTTP requests or any other lightweight alternative

### core/set-up-node
To be renamed to `initial-configurator`

**Input**: 
- Hardcoded containers list

**Output**: 
- Starts Consul