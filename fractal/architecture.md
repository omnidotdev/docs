# Fractal Architecture Overview

Fractal is a Kubernetes-native application deployment platform — a FOSS alternative to Railway. It consists of three components: the **CLI**, the **operator**, and the **dashboard**.

## Cluster Architecture

### Reference deployment (Omni production)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| OS | Talos Linux | Immutable, API-managed, no SSH, minimal attack surface |
| CNI | Cilium | eBPF networking, replaces kube-proxy, Gateway API, Hubble observability |
| Ingress | Cilium Gateway API | Native Gateway API with eBPF acceleration, L7 visibility |
| Storage | Hetzner CSI (hcloud-csi) | Network-attached SSD persistent volumes |
| TLS | cert-manager + Let's Encrypt | DNS-01 via Cloudflare, auto-provisioned wildcard certs |
| DNS/CDN | Cloudflare | `*.fractal.omni.dev` wildcard, proxied |
| Load balancer | Hetzner LB | TCP forwarding to Cilium Gateway NodePorts (80->30640, 443->32596) |
| Databases | CloudNativePG | HA Postgres with streaming replication, auto-failover, PgBouncer |

### Compute (Omni production)

| Node | Hetzner Type | Specs | Cost |
|------|-------------|-------|------|
| control-1 | CPX31 | 4 vCPU, 8 GB RAM, 160 GB | ~$15/mo |
| control-2 | CPX31 | 4 vCPU, 8 GB RAM, 160 GB | ~$15/mo |
| control-3 | CPX31 | 4 vCPU, 8 GB RAM, 160 GB | ~$15/mo |
| Hetzner LB | LB11 | | ~$6/mo |

~18 GB usable for workloads after system overhead.

## Custom Resource Definitions (CRDs)

Fractal defines the following CRDs in the `fractal.omni.dev` API group (version `v1alpha1`):

### FractalProject (`fproj`)

Top-level organizational unit. Each project maps to a Kubernetes namespace (`fractal-{name}`).

**Spec:**
- `displayName` -- human-readable name
- `description` -- optional description
- `owner` -- owner email or HIDRA user ID

**Status:**
- `phase` -- `Pending`, `Active`, `Suspended`, `Deleting`
- `namespace` -- created namespace name
- `serviceCount` -- number of services in the project

### FractalService (`fsvc`)

A deployable application within a project.

**Spec:**
- `project` -- parent project name
- `source` -- either `git` (url + branch) or `image` (repository + tag)
- `build` -- build mode (`auto`, `dockerfile`, `none`) + optional Dockerfile path
- `deploy` -- replicas, env, resources, health check, volumes, schedule, autoscale
- `expose` -- port, domain, TLS
- `serviceType` -- `web`, `worker`, `cronJob`, `staticSite` (`cronJob` is deprecated in favor of the dedicated `FractalCronJob` CRD)

**Status:**
- `phase` -- `Pending`, `Building`, `Deploying`, `Running`, `Failed`
- `readyReplicas` / `desiredReplicas`
- `lastBuildTime`, `currentImage`, `url`

### FractalCronJob (`fcj`)

A scheduled task within a project. Reconciled into a Kubernetes CronJob.

**Spec:**
- `project` -- parent project name
- `source` -- either `git` (url + branch) or `image` (repository + tag)
- `build` -- build mode (`auto`, `dockerfile`, `none`)
- `schedule` -- cron expression (e.g. "0 3 * * *")
- `command`, `args` -- container entrypoint overrides
- `env` -- environment variables (literal or secret refs)
- `resources` -- CPU/memory requirements
- `concurrencyPolicy` -- `allow`, `forbid`, or `replace`
- `startingDeadlineSeconds` -- grace period for missed schedules
- `suspend` -- pause scheduling without deleting the resource
- `backoffLimit` -- retries before marking a job as failed

**Status:**
- `phase` -- `Pending`, `Building`, `Active`, `Suspended`
- `lastScheduleTime`, `lastSuccessfulTime`
- `currentImage`, `activeJobs`

### Planned CRDs

| CRD | Purpose | Backed by |
|-----|---------|-----------|
| `FractalDatabase` | Managed Postgres databases | CloudNativePG Cluster + K8s Secret |
| `FractalCache` | Managed cache instances | Valkey/Dragonfly StatefulSet |

## Reconciliation flow

### FractalProject controller

1. Receive `FractalProject` create/update event
2. Create the target namespace (`fractal-{name}`) if it doesn't exist
3. Count `FractalService` resources in the namespace
4. Update status (`Active`, namespace, service count)

On delete (via finalizer):
1. Delete all `FractalService` resources in the namespace
2. Delete the namespace

### FractalService controller

1. Receive `FractalService` create/update event
2. **Build phase** (git sources only):
   - Create a Kaniko `Job` to build the container image
   - Monitor Job status; requeue until complete
   - For localhost registries, pass `--insecure` to Kaniko
3. **Deploy phase** (by service type):
   - **Web / Worker / StaticSite**: Apply `Deployment`, optional `Service`, optional `HTTPRoute`
   - **CronJob**: Apply `CronJob` (no Service/HTTPRoute)
4. **PVCs**: Create `PersistentVolumeClaim` resources before workloads
5. **HPA**: Apply `HorizontalPodAutoscaler` if autoscale config is present
6. **TLS**: Auto-create cert-manager `Certificate` per HTTPRoute when TLS is enabled
7. Update status (phase, replica counts, current image, URL)
8. Requeue: 300s if Running, 10s if Deploying/Building

On delete (via finalizer):
1. Delete Deployment, build Job, CronJob, HPA, Service, HTTPRoute, Certificate, and PVCs

## Kubernetes resources per service type

| Service type | Deployment | CronJob | Service | HTTPRoute | HPA | PVCs | Certificate |
|-------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Web         | x |   | x (if expose) | x (if domain) | x (if autoscale) | x (if volumes) | x (if TLS) |
| Worker      | x |   |   |   | x (if autoscale) | x (if volumes) | |
| CronJob     |   | x |   |   |   |   | |
| StaticSite  | x |   | x (if expose) | x (if domain) | x (if autoscale) | x (if volumes) | x (if TLS) |

## Installation modes

| Mode | Command | Cluster | Registry | Use case |
|------|---------|---------|----------|----------|
| Quick start | `fractal install --distribution k3s` | k3s | Configurable | Local dev, homelab, single-node |
| Production | `fractal install --distribution talos --provider hetzner` | Talos Linux | Configurable | Teams running real workloads |
| BYOC | `fractal install --existing-cluster` | Any K8s | Configurable | GKE, EKS, AKS, self-managed |
| Local dev | `fractal install --distribution k3d` | k3d + local registry | `k3d-{name}-registry.localhost:5000` | Local development |

All modes install: CRDs, operator, dashboard, CloudNativePG, cert-manager, metrics-server (each if not already present).

Full provisioning modes (Talos/k3s) additionally install: Cilium CNI, CSI driver, Gateway API CRDs, DNS configuration.

## Platform stack

Components installed by `fractal install` (full provisioning):

```
Cilium -> Gateway API CRDs -> hcloud-csi -> cert-manager -> metrics-server -> CloudNativePG -> fractal-operator
```

The operator and dashboard run in the `fractal-system` namespace.

## Dashboard data flow

The dashboard is a React SPA served by nginx.

**In-cluster (production):**
1. Browser loads static assets from nginx
2. API requests (`/api/*`, `/apis/*`) are proxied by nginx to the Kubernetes API server
3. Nginx reads the ServiceAccount token and sets the `Authorization` header
4. The dashboard queries `FractalProject` and `FractalService` resources via the K8s API

**Local development:**
1. `bun dev` starts Vite dev server
2. Vite proxies `/api` and `/apis` to `kubectl proxy` on `localhost:8001`
3. `kubectl proxy` authenticates with the user's kubeconfig

## Metrics and monitoring

The operator exposes Prometheus metrics on port 8081 at `/metrics`:

| Metric | Type | Description |
|--------|------|-------------|
| `reconcile_total` | counter | Total reconciliation attempts (labels: `resource`, `result`) |
| `reconcile_duration_seconds` | histogram | Reconciliation latency (labels: `resource`, `result`) |
| `active_services` | gauge | Number of active FractalService resources |
| `active_builds` | gauge | Number of active build jobs |

A `ServiceMonitor` and Grafana dashboard are provided in the operator manifests.

## Control plane layering

```
Pulumi (Mosaic)     -> cloud resources (nodes, LB, DNS, Stripe, GitHub)
Flux / Pulumi       -> cluster platform components (operators, CNI, cert-manager, monitoring)
Fractal operator    -> application workloads (projects, services, databases, caches)
```

Clean separation: Pulumi owns infrastructure, Flux/Pulumi owns platform, Fractal owns apps.

## Component diagram

```
                    +-----------+
                    | fractal   |
                    | CLI       |
                    +-----+-----+
                          |
              kubectl / kube API
                          |
                    +-----v-----+
                    | Kubernetes|
                    | API Server|
                    +-----+-----+
                          |
           +--------------+--------------+
           |                             |
    +------v------+              +-------v-------+
    | FractalProject |           | FractalService  |
    | Controller     |           | Controller      |
    +------+------+              +-------+-------+
           |                             |
     create namespace           create Deployment,
                                Service, HTTPRoute,
                                Certificate, HPA, PVC
           |                             |
    +------v------------------------------v------+
    |              fractal-system                 |
    |  operator  |  dashboard  |  metrics service |
    +---------------------------------------------+
```
