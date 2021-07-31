# ContainerOS

Lightweight ready-to-use container management system. Intended to replace Kubernetes in 98% of cases.

## Usage

TODO

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

P.S. To be replaced by events, http requests or any other light-weight alternative

### core/set-up-node
To be renamed to `initial-configurator`

**Input**: 
- Hardcoded containers list

**Output**: 
- Starts consul