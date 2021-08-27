# ContainerOS prototype

The goal of the project is to provide as simple as possible interface for cluster deployments.

## Components

### Cluster API

- Accepts http requests and modifies swarm mode desired cluster state
- Responds with container statuses
- Streams logs
- Works directly with docker API
- Runs only on controller nodes
- Manages users saving them in configs and secrets
- Stateless except for log streaming

### Management container

- Creates a swarm or joins already existing one
- Starts router, API server, and docker registry and addon controllers
- Runs on a single controller node
- Enables and disables nodes for scheduling (for real life load balancing)
- Installs neccecary software

### Registry proxy

- Proxies requests to docker registry (thank you, capitain)
- Gets credentials and user access rights from configs and secrets

### Addon controlers 
- Manage databases and other software, defined in configs by API server
- Auto-scales depending on load