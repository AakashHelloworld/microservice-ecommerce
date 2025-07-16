# E-commerce Microservices Architecture
<img width="959" height="409" alt="image" src="https://github.com/user-attachments/assets/33575eb3-7d7e-4cd2-9d7d-8c6e90021336" />

This repository contains a microservices-based backend system for an e-commerce application. The architecture is designed for scalability, maintainability, and performance using Docker, Kubernetes, Kafka, and gRPC. Each service is responsible for a single domain and communicates with other services using gRPC and Kafka where event-driven patterns are needed.

---

## Tech Stack

### Frontend

* React.js

### Backend Services

1. **Product Service**

   * Node.js
   * PostgreSQL
   * Prisma ORM
   * gRPC (for inter-service communication)

2. **User Service**

   * Node.js
   * PostgreSQL
   * Prisma ORM
   * gRPC

3. **Order Service**

   * Node.js
   * MongoDB
   * gRPC
   * Kafka producer (publishes order-related events)

4. **Notification Service**

   * Go
   * Kafka consumer (listens for order events and sends notifications)

### Infrastructure and DevOps

* NGINX (acts as API Gateway)
* Docker (containerization)
* Kubernetes (container orchestration)
* Kafka (event streaming with publish/subscribe pattern)
* PostgreSQL Master-Slave replication setup

---

## Architecture Flow

### 1. User Interaction

* The user interacts with the frontend built in React.js.
* Requests go through the **API Gateway (NGINX)** which routes them to appropriate services.

### 2. Product & User Services

* These are standalone services with their own databases (PostgreSQL).
* They use **Prisma ORM** for database operations.
* These services expose gRPC endpoints for internal communication.
* Both services use a master-slave database setup:

  * All `create` and `update` operations go to the master.
  * All `read` operations are routed to slave replicas.
  * Slave databases automatically sync from the master.

### 3. Order Service

* Handles creation of orders using MongoDB.
* When an order is placed:

  * It persists data in MongoDB.
  * It publishes an event to Kafka (acts as a **producer**) with order-related information.
* Uses gRPC to interact with Product and User services for validation or enrichment.

### 4. Kafka & Pub/Sub Model

* **Kafka** is used to decouple services and allow asynchronous communication.
* Kafka serves as a message broker using the publish-subscribe pattern:

  * **Producers**: Order service
  * **Consumers**: Notification service
* Kafka helps prevent tight coupling between services and makes the system more scalable and fault-tolerant.

### 5. Notification Service

* Written in Go.
* Acts as a Kafka **consumer** and listens to order-related topics.
* When a new message arrives, it processes the message and sends an email notification (or other types in future).
* Does not have its own persistent database but could be extended to store notification logs.

---

## Kafka vs Pub/Sub (Design Clarification)

Although the term **pub/sub** is used in general messaging systems, here we're using **Kafka** to implement the pub/sub model.

* **Pub/Sub**: A pattern where publishers send messages to a topic and subscribers receive messages from the topic.
* **Kafka**: A distributed, durable, high-throughput platform to implement the pub/sub model.

  * Topics store streams of records.
  * Producers write to topics.
  * Consumers subscribe to topics.

---

## Development and Deployment

* Each service has its own `Dockerfile`.
* Services are orchestrated using **Kubernetes**, allowing them to scale independently.
* PostgreSQL master-slave setup is handled using Kubernetes StatefulSets and proper replication configuration.
* Kafka is deployed as a cluster (using Bitnami/Confluent Helm charts or manually via StatefulSets).
* NGINX is configured as an ingress controller or simple reverse proxy depending on the environment.

---

## Future Improvements

* Add authentication/authorization using a dedicated Auth service.
* Improve observability using Prometheus and Grafana.
* Implement retries and dead-letter topics for Kafka consumers.
* Use API Gateway with JWT verification for secured endpoints.

---

## Repository Structure (Example)

```
.
├── frontend/                # React frontend
├── services/
│   ├── product-service/
│   ├── user-service/
│   ├── order-service/
│   └── notification-service/
├── api-gateway/             # NGINX config
├── kafka/                   # Kafka deployment files
├── k8s/                     # Kubernetes manifests
└── docker-compose.yml       # For local development
```

---

If you want help writing the actual `docker-compose.yml`, Kubernetes manifests, or service boilerplates, feel free to ask.
