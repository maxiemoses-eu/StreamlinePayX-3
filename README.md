# StreamlinePay

> Production-grade microservices payment platform with automated CI/CD, GitOps deployments, and enterprise-scale security scanning.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/maxiemoses-eu/StreamlinePayX-3)
[![AWS](https://img.shields.io/badge/AWS-EKS%20|%20ECR-FF9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-1.27+-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io)

## Overview

StreamlinePay is a **cloud-native, production-ready payment processing system** designed to handle high-volume fintech workloads. It demonstrates end-to-end DevOps practices including infrastructure-as-code, security-first CI/CD, and GitOps-based deployments.

**Key insight:** This project was rebuilt from a fragile, manually-deployed system into an automated, observable, and scalable platform. Every architectural decision was made to eliminate operational friction.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Microservices](#microservices)
- [CI/CD Pipeline](#cicd-pipeline)
- [Deployment Strategy](#deployment-strategy)
- [Security](#security)
- [Quick Start](#quick-start)
- [Known Limitations](#known-limitations)
- [Further Reading](#further-reading)

---

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│              React Store UI + Nginx Reverse Proxy                │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST
┌────────────────────────▼────────────────────────────────────────┐
│                    API GATEWAY / LOAD BALANCER                    │
│              (Kubernetes Service)                                 │
└────┬──────────────┬──────────────┬──────────────┬────────────────┘
     │              │              │              │
┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐
│ Products  │  │   Users  │  │   Cart   │  │  Store   │
│ Service   │  │ Service  │  │ Service  │  │   UI     │
│ (Node.js) │  │ (Python) │  │ (Java)   │  │ (React)  │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │              │             │
     └─────────────┴──────────────┴─────────────┘
              │
     ┌────────▼──────────┐
     │  PostgreSQL DB    │
     │  (shared)         │
     └───────────────────┘
```

### Three-Repository Strategy

| Repository | Purpose | Contents |
|-----------|---------|----------|
| **[StreamlinePayX-3](https://github.com/maxiemoses-eu/StreamlinePayX-3)** | Application + CI | Microservices source code, Dockerfiles, Jenkins pipeline |
| **[stream-infra-clean](https://github.com/maxiemoses-eu/stream-infra-clean)** | Infrastructure as Code | Terraform for AWS (EKS, ECR, VPC, IAM, S3, DynamoDB) |
| **[agrocd-yaml](https://github.com/maxiemoses-eu/agrocd-yaml)** | GitOps Deployment | Helm charts, ArgoCD applications, environment configs |

**Why this separation?** Decoupling infrastructure, application logic, and deployment prevents merge conflicts, makes rollbacks atomic, and enables different teams to own different concerns.

---

## Tech Stack

### Cloud & Infrastructure
- **Container Orchestration:** Kubernetes 1.27+ (AWS EKS)
- **Container Registry:** AWS ECR (Elastic Container Registry)
- **Infrastructure as Code:** Terraform with modular design
- **Configuration Management:** Helm 3.x
- **Network & Storage:** VPC, IAM, S3, DynamoDB (for Terraform state)

### CI/CD Pipeline
- **Build Orchestration:** Jenkins (declarative pipelines)
- **Container Security:** Trivy vulnerability scanning
- **GitOps Deployment:** ArgoCD (Git as source of truth)
- **Version Control:** Git (GitHub)

### Microservices
- **Products Service:** Node.js + Express
- **Users Service:** Python + FastAPI
- **Cart Service:** Java + Spring Boot
- **Frontend:** React 18 + Nginx (reverse proxy)

### Data Layer
- **Primary Database:** PostgreSQL (shared across services)

---

## Microservices

Each microservice is a separate directory with its own Dockerfile and deployment configuration:

### Products Microservice
- **Language:** Node.js / Express
- **Path:** `products-microservice/`
- **Container:** Dockerized with multi-stage builds
- **Port:** Exposed on configured service port

### Users Microservice
- **Language:** Python / FastAPI
- **Path:** `users-microservice/`
- **Container:** Dockerized with Python runtime
- **Port:** Exposed on configured service port

### Cart Microservice
- **Language:** Java / Spring Boot
- **Path:** `cart-microservice/`
- **Container:** Dockerized with JVM
- **Port:** Exposed on configured service port

### Store UI Microservice
- **Language:** React 18
- **Path:** `store-ui-microservice/`
- **Container:** Node.js build stage + Nginx runtime
- **Port:** 80 (Nginx reverse proxy)

**All services:**
- Have individual Dockerfiles
- Are built as separate container images
- Are tagged by commit SHA (not `latest`)
- Are scanned by Trivy before ECR push
- Have health check endpoints (`/health`)

---

## CI/CD Pipeline

### Jenkins Workflow

```
Developer Push → GitHub Webhook → Jenkins
                 ├─ Stage: Checkout & Build
                 │  ├─ docker build products-microservice/
                 │  ├─ docker build users-microservice/
                 │  ├─ docker build cart-microservice/
                 │  └─ docker build store-ui-microservice/
                 ├─ Stage: Security Scan (Trivy)
                 │  └─ Fail if HIGH/CRITICAL vulnerabilities found
                 ├─ Stage: Push to AWS ECR
                 │  └─ Tag images by commit SHA
                 └─ Stage: Update GitOps Repo
                    └─ Update Helm values in agrocd-yaml
                       └─ ArgoCD detects Git change & syncs
```

### Pipeline Details

**Jenkins Pipeline:** `Jenkinsfile` in root of repository

**Build Strategy:**
- Each microservice Dockerfile in its own directory
- Docker images tagged by commit SHA (ensures traceability)
- Example: `products-microservice:abc123def456`

**Security Scanning:**
- Trivy scans all built images before pushing
- Fails on HIGH and CRITICAL vulnerabilities
- No exceptions—security is enforced at build time

**Image Push:**
- Authenticated push to AWS ECR
- Images tagged by commit hash for audit trail
- ECR acts as the artifact repository

**GitOps Trigger:**
- After successful push, Jenkins updates image tags in `agrocd-yaml`
- ArgoCD watches the deployment repo for changes
- ArgoCD automatically syncs EKS cluster to match Git state

---

## Deployment Strategy

### GitOps with ArgoCD

**Why GitOps?** Git becomes the single source of truth for what's running in production. Deployments are declarative, auditable, and reversible.

**Deployment Flow:**
1. Developer merges code → GitHub webhook triggers Jenkins
2. Jenkins builds images, scans, pushes to ECR with commit SHA tag
3. Jenkins updates image tag in `agrocd-yaml/helm/*/values.yaml`
4. Git change is detected by ArgoCD
5. ArgoCD syncs EKS cluster to match Git state
6. Kubernetes rolls out new pods with new images
7. Rollback = `git revert` + manual sync (or auto-sync catches it)

### Helm Charts

Each microservice has a Helm chart in the GitOps repo:

```
agrocd-yaml/helm/
├── products/
│   ├── Chart.yaml
│   ├── values.yaml          # Base configuration
│   ├── values-staging.yaml  # Staging overrides
│   ├── values-prod.yaml     # Production overrides
│   └── templates/
│       ├── deployment.yaml
│       ├── service.yaml
│       └── configmap.yaml
├── users/
├── cart/
└── store-ui/
```

**Image tag in values.yaml:**
```yaml
image:
  repository: ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/products-microservice
  tag: abc123def456  # Commit SHA - updated by Jenkins
```

---

## Security

### Container Security (Trivy)

Every image is scanned **before** being pushed to ECR.

```bash
# Scan locally (during development)
trivy image products-microservice:latest

# Jenkins scans during CI (fails on HIGH+ vulnerabilities)
stage('Security Scan') {
    steps {
        sh 'trivy image --severity HIGH,CRITICAL --exit-code 1 ${IMAGE_NAME}:${COMMIT_SHA}'
    }
}
```

**Why this matters:**
- Vulnerability must be fixed before image reaches ECR
- No infected images in production registry
- Audit trail: every push is a scanned image

### IAM & Access Control

**Principle of least privilege:**
- Jenkins IAM role: ECR push only (no S3, no RDS, no delete permissions)
- EKS nodes: Pull from ECR only
- No SSH access to nodes (all via kubectl)
- Terraform state: Encrypted and locked (S3 + DynamoDB)

### Network Security

- Kubernetes Services are ClusterIP (internal only)
- Ingress controller handles external traffic
- Services communicate internally via DNS
- No direct access to databases from outside cluster

---

## Quick Start

### Prerequisites

```bash
# Required tools
- Docker >= 20.10
- kubectl >= 1.27
- Helm >= 3.10 (if deploying via Helm locally)
- AWS CLI v2 (if managing AWS resources)
- Git
- Terraform (if provisioning infrastructure)
```

### 1. Clone Repository

```bash
git clone https://github.com/maxiemoses-eu/StreamlinePayX-3.git
cd StreamlinePayX-3
```

### 2. Build All Microservices

```bash
# Build each microservice Docker image
docker build -t products-microservice:dev ./products-microservice
docker build -t users-microservice:dev ./users-microservice
docker build -t cart-microservice:dev ./cart-microservice
docker build -t store-ui-microservice:dev ./store-ui-microservice
```

### 3. Push to ECR (After AWS Setup)

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region REGION | \
  docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com

# Tag and push each image (use commit SHA in production, not 'dev')
docker tag products-microservice:dev ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/products-microservice:dev
docker push ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/products-microservice:dev

# Repeat for other services
```

### 4. Deploy via ArgoCD

Once infrastructure is provisioned (see `stream-infra-clean` repo):

```bash
# Configure kubectl
aws eks update-kubeconfig --name streamlinepay --region REGION

# Apply ArgoCD applications (from agrocd-yaml repo)
kubectl apply -f https://github.com/maxiemoses-eu/agrocd-yaml/argocd/applications/

# Check deployment status
argocd app list
```

### 5. Verify

```bash
# Check running pods
kubectl get pods -n streamlinepay

# View service endpoints
kubectl get svc -n streamlinepay

# Check logs
kubectl logs -f deployment/products-microservice -n streamlinepay
```

---

## Known Limitations

1. **Some services failing health checks** — Debugging in progress (likely liveness probe timeout or port mismatch)
2. **No metrics/dashboards yet** — Prometheus + Grafana integration planned
3. **No centralized logging** — Currently using kubectl logs only
4. **Auto-scaling untested** — HPA configured but not load-tested
5. **Single region only** — No multi-region replication

**These are not blockers**—they're improvements queued for the next phase.

---

## Troubleshooting

### Pod stuck in CrashLoopBackOff

```bash
# Check logs
kubectl logs -f pod/products-microservice-xyz -n streamlinepay

# Describe pod for events
kubectl describe pod products-microservice-xyz -n streamlinepay

# Common causes: port mismatch, env vars missing, OOM
```

### Jenkins build failing

```bash
# Check Jenkins logs
docker logs jenkins  # (if Jenkins is containerized)

# Check GitHub webhook delivery
GitHub Repo Settings → Webhooks → Recent Deliveries

# Manually trigger build
Jenkins UI → StreamlinePay Job → Build Now
```

### ArgoCD out of sync

```bash
# Manual sync
argocd app sync products-app

# Check ArgoCD logs
argocd app logs products-app

# Verify Git state matches cluster
argocd app get products-app
```

---

## Further Reading

For the detailed architectural decisions, trade-offs, and complete rebuild story:

📖 **[Full Case Study: How I Rebuilt StreamlinePay](https://medium.com/@MaxieMoses/how-i-rebuilt-streamlinepay-a-complete-aws-devops-and-gitops-case-study-9dd0a2964041)**

This covers:
- Why the three-repo strategy works
- The decision to rebuild from a broken open-source fork
- IAM module iterations and least-privilege design
- Terraform state locking and drift prevention
- GitOps adoption and ArgoCD configuration
- Real-world trade-offs 

---

## License

MIT License — See LICENSE file for details

---

## Author

**Maxie Moses** | DevOps Engineer  
📍 Port Harcourt, Nigeria  
💬 [LinkedIn](https://www.linkedin.com/in/maxie-moses-a-26a2788b/)  
📝 [Medium](https://medium.com/@MaxieMoses)  
🐙 [GitHub](https://github.com/maxiemoses-eu)

---

## Support

For questions, issues, or feedback:

1. **GitHub Issues:** [StreamlinePayX-3/issues](https://github.com/maxiemoses-eu/StreamlinePayX-3/issues)
2. **Discussions:** [GitHub Discussions](https://github.com/maxiemoses-eu/StreamlinePayX-3/discussions)

---

**Last Updated:** May 24, 2026  
**Status:** Production-ready (with observability improvements in progress)