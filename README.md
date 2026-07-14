# Shipping Service — Incident Lab Repo 2

Spring Boot microservice that consumes the Order Service from incident-lab (Repo 1) via OpenFeign.

## Architecture

```
Browser / Frontend  (:3001)
        |  POST /shipping
        v
Shipping Service    (:8082)   <- This repo
        |  POST /orders  (OpenFeign)
        v
Order Service       (:8080)   <- incident-lab Repo 1
        |  GET /inventory/{productId}
        v
Inventory Service   (:8081)   <- incident-lab Repo 1
```

## Quick Start

### Prerequisites
- Java 21, Maven 3.9+
- Node.js 18+
- Repo 1 (incident-lab) running on :8080 and :8081

### 1. Start Repo 1 first
```bash
cd incident-lab-main/order-service
mvn spring-boot:run
```

### 2. Start Shipping Service backend
```bash
cd shipping-service
mvn spring-boot:run
# Runs on http://localhost:8082
```

### 3. Start Shipping Service frontend
```bash
cd shipping-service/frontend
npm install
npm run dev
# Runs on http://localhost:3001
```

## Backend API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /shipping | Create shipment (calls Order Service) |
| GET | /shipping | List all shipments |
| GET | /shipping/{shipmentId} | Get shipment by ID |
| GET | /actuator/health | Health check |
| GET | /actuator/prometheus | Prometheus metrics |

## Incident Endpoints (Shipping Service only)

| Method | Endpoint | Effect |
|--------|----------|--------|
| POST | /incident/cpu | CPU spike in shipping-service |
| POST | /incident/npe | NullPointerException on POST /shipping |
| POST | /incident/memory | Memory leak (1MB/500ms) |
| POST | /incident/random | 30% random failures |
| POST | /incident/reset | Clear all incidents |
| GET | /incident/status | Current incident state |

## Incident Scenarios

**Dependency commit** — Change /orders response in Repo 1. Shipping Service starts failing.

**Independent commit** — Trigger /incident/npe here. Repo 1 stays healthy.

**CPU load** — POST /incident/cpu. Watch spike in Prometheus/Grafana only for shipping-service.

## Configuration

```yaml
# application.yml
server:
  port: 8082
order-service:
  url: http://localhost:8080   # override with ORDER_SERVICE_URL env var
```