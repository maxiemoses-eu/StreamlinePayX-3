🧠 StreamlinePay — Production-Grade Microservices Payment Platform

A cloud-native payment processing system built with a microservices architecture, fully automated CI/CD pipeline, and GitOps deployment strategy.

Designed to simulate real-world fintech infrastructure, focusing on scalability, resilience, and observability.

⚙️ Architecture Overview

Microservices-based system handling core e-commerce/payment flows
Polyglot architecture:
Node.js (Products)
Python (Users)
Java (Cart)
React + Nginx (Frontend)
Containerized with Docker
Deployed via Kubernetes (GitOps model)

🧱 System Design

User → Frontend (React/Nginx)
     → API Services (Products, Users, Cart)
     → Database Layer

CI/CD → Jenkins → Docker → ECR
                  ↓
               GitOps Repo → ArgoCD → Kubernetes

🔁 CI/CD Pipeline (Jenkins)

Fully automated pipeline with:

Parallel build & testing
Docker image scanning (Trivy)
Secure image push to AWS ECR
GitOps-based deployment trigger

👉 Deployment is triggered by updating manifests in a separate GitOps repository, enabling declarative infrastructure delivery.

☁️ Cloud & DevOps Stack

AWS (ECR)
Docker
Kubernetes
Jenkins
ArgoCD (GitOps)
Trivy (Security scanning)

🧪 Testing Strategy

Frontend unit testing (React)
Service-level validation during CI pipeline
Automated build verification before deployment

🔐 Production Considerations (Key Focus)

This project is designed with production-thinking:

Container security scanning (Trivy)
Decoupled deployment via GitOps
Scalable microservices architecture
Separation of concerns across services

📦 Repositories

Application Code:

https://github.com/maxiemoses-eu/StreamlinePayX-3

GitOps / Deployment Manifests:

https://github.com/maxiemoses-eu/agrocd-yaml

Iac Repository: 

https://github.com/maxiemoses-eu/agrocd-yaml



🚀 What This Project Demonstrates

End-to-end CI/CD pipeline design
GitOps-based Kubernetes deployment
Multi-language microservices orchestration

Real-world DevOps workflow used in modern SaaS/fintech companies

