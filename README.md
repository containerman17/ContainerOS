# ContainerOS

## Usage

This section will be empty till release v0.1.

## Architecture

### Caddy configurator
To be renamed to `ingress-configurator`

**Input**: 
- List of healthy services from Consul.

**Output**: 
- Pushes JSON config to Caddy

### Change listeners
Should be renamed for sure.

**Input**: 
- List of deployments
- List of pods
- Health of nodes

**Output**: 
- Creates pods and assigns them to nodes

### Cluster API
**Input**: 
- User API requests

**Output**: 
- CRUD deployments
- CRUD projects
- Reverse-proxy logs from Node API

### Consul Registrator
**Input**: 
- Local docker events 
- Tags with service names on docker containers

**Output**: 
- Register and de-register Consul services

### Container Runner
**Input**: 
- List of default containers (Consul, Caddy, etc.)
- List of pods (`/pods/${hostname}/`)

**Output**: 
- Starts and stops docker containers
### Health reporter
**Input**: 
- Docker events from local containers
- Node load information (CPU, RAM)

**Output**: 
- Pod health values in the database
- Node health values in the database

P.S. To be replaced by events, http requests or any other light-weight alternative
### Node API
**Input**: 
- HTTP requests from Cluster API

**Output**: 
- Logs

### Node health reporter
**Input**: 
- HTTP requests from Cluster API

**Output**: 
- Local container logs

### System deployments
To be renamed to `initial-configurator`

**Input**: 
- Hardcoded containers list

**Output**: 
- Updates system deployments (registry, etc) in the cluster