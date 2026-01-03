# Docker Guide

## Overview

The Smart Office application uses Docker Compose to orchestrate five services:

- Frontend (nginx + React SPA)
- Auth Service (.NET 9)
- Resource Service (.NET 9)
- PostgreSQL (Auth database)
- MongoDB (Resource database)

## Quick Commands

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (reset databases)
docker-compose down -v

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f auth-service

# Rebuild single service
docker-compose build auth-service
docker-compose up -d auth-service
```

## Service Configuration

### Ports

| Service          | Internal Port | External Port |
| ---------------- | ------------- | ------------- |
| Frontend         | 80            | 3000          |
| Auth Service     | 8080          | 5001          |
| Resource Service | 8080          | 5002          |
| PostgreSQL       | 5432          | Not exposed   |
| MongoDB          | 27017         | Not exposed   |

### Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

**Required variables:**

```env
JWT_SECRET=<generate-with-openssl-rand-base64-32>
```

**All variables (must be set in .env):**

```env
JWT_ISSUER=smart-office
JWT_AUDIENCE=smart-office-api
JWT_EXP_MINUTES=30
POSTGRES_USER=authuser
POSTGRES_PASSWORD=<your-postgres-password>
POSTGRES_DB=authdb
MONGO_USER=mongouser
MONGO_PASSWORD=<your-mongo-password>
MONGODB_DATABASE_NAME=smart_office
SEED_ADMIN_NAME=admin
SEED_ADMIN_PASSWORD=<your-admin-password>
```

## Volumes

Named volumes persist database data:

```yaml
volumes:
  auth-db-data: # PostgreSQL data
  mongo-db-data: # MongoDB data
```

**Reset databases:**

```bash
docker-compose down -v
docker-compose up --build
```

## Networking

All services share a single bridge network:

```yaml
networks:
  smart-office-network:
    driver: bridge
```

**Service discovery:** Use container names as hostnames:

- `auth-db` - PostgreSQL
- `mongo-db` - MongoDB
- `auth-service` - Auth API
- `resource-service` - Resource API

## Health Checks

Each service has health checks for dependency ordering:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

**Check health status:**

```bash
docker-compose ps
```

## Dockerfile Structure

### Multi-stage Build (.NET)

```dockerfile
# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY *.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ServiceName.dll"]
```

**Benefits:**

- Small runtime image (no SDK)
- Cached dependency layer
- No source code in final image

### Frontend Build

```dockerfile
# Stage 1: Build with Node
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

## Common Issues

### Service won't start

```bash
# Check logs
docker-compose logs auth-service

# Common causes:
# - Database not ready (increase start_period)
# - Missing environment variables
# - Port already in use
```

### Database connection refused

```bash
# Ensure database is healthy
docker-compose ps

# Restart dependent service
docker-compose restart auth-service
```

### Changes not reflected

```bash
# Rebuild the service
docker-compose build --no-cache auth-service
docker-compose up -d auth-service
```

### Out of disk space

```bash
# Remove unused images and containers
docker system prune -a

# Remove unused volumes
docker volume prune
```

## Development Workflow

### Local Development (without Docker)

**Auth Service:**

```bash
cd auth-service
# Set environment variables or use appsettings.Development.json
export DATABASE_URL="Host=localhost;Port=5432;Database=authdb;Username=postgres;Password=postgres"
export JWT_SECRET="dev-secret-key-minimum-32-chars"
export JWT_ISSUER="smart-office"
export JWT_AUDIENCE="smart-office-api"
dotnet run
```

**Resource Service:**

```bash
cd resource-service
export MONGODB_CONNECTION_STRING="mongodb://localhost:27017"
export JWT_SECRET="dev-secret-key-minimum-32-chars"
export JWT_ISSUER="smart-office"
export JWT_AUDIENCE="smart-office-api"
dotnet run
```

**Frontend:**

```bash
cd frontend
npm run dev
```

### Hybrid (Docker DBs, local services)

```bash
# Start only databases
docker-compose up -d auth-db mongo-db

# Run services locally
cd auth-service && dotnet run
cd resource-service && dotnet run
cd frontend && npm run dev
```

## Production Considerations

1. **Use Docker secrets** instead of environment variables for sensitive data
2. **Add resource limits** to prevent container resource exhaustion
3. **Use external databases** with proper backup/replication
4. **Add reverse proxy** (nginx/traefik) with TLS termination
5. **Implement logging driver** for centralized log collection
6. **Use container orchestration** (Kubernetes/ECS) for scaling
