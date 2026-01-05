# Smart Office Asset Manager

> **🚀 Active Development Branch:** This is the main development branch with ongoing improvements. For a stable reference version, see the [`stable-v1`](https://github.com/Roeeht/Smart-Office/tree/stable-v1) branch.

A containerized, enterprise-style full-stack system demonstrating microservice architecture, JWT authentication, role-based access control, and Docker Compose orchestration.

## Quick Start

### Prerequisites

- Docker and Docker Compose
- (Optional) .NET 9 SDK for local development
- (Optional) Node.js 20+ for frontend development

### Running with Docker Compose

1. **Clone and configure:**

   ```bash
   cd smart-office
   cp .env.example .env
   ```

2. **Edit `.env` and set your own values:**

   ```bash
   # Generate a secure JWT secret
   openssl rand -base64 32
   ```

   Then edit `.env`:

   - `JWT_SECRET` — paste the generated secret (minimum 32 characters)
   - `POSTGRES_PASSWORD` — create any secure password (e.g., `MyPostgres123!`)
   - `MONGO_PASSWORD` — create any secure password (e.g., `MyMongo456!`)
   - `SEED_ADMIN_PASSWORD` — the password you'll use to login as Admin

   > **Note:** These passwords are for your local Docker containers. You create them yourself — they don't come from anywhere else.

3. **Build and start all services:**

   ```bash
   docker-compose up --build
   ```

4. **Access the application:**

   - Frontend: http://localhost:3000
   - Auth Service API: http://localhost:5001
   - Resource Service API: http://localhost:5002

5. **Login with your configured credentials:**
   - Username: `admin` (or whatever you set `SEED_ADMIN_NAME` to)
   - Password: whatever you set `SEED_ADMIN_PASSWORD` to

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Network                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌──────────────┐    ┌─────────────────────┐   │
│  │ Frontend │───▶│ Auth Service │───▶│ PostgreSQL (auth-db)│   │
│  │  :3000   │    │    :5001     │    └─────────────────────┘   │
│  └──────────┘    └──────────────┘                               │
│       │                                                         │
│       │          ┌──────────────────┐    ┌─────────────────┐   │
│       └─────────▶│ Resource Service │───▶│ MongoDB (mongo) │   │
│                  │      :5002       │    └─────────────────┘   │
│                  └──────────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

## Services

| Service          | Port  | Description                            |
| ---------------- | ----- | -------------------------------------- |
| Frontend         | 3000  | React SPA with MUI                     |
| Auth Service     | 5001  | User registration, login, JWT issuance |
| Resource Service | 5002  | Asset CRUD with JWT validation         |
| PostgreSQL       | 5432  | Auth database (internal)               |
| MongoDB          | 27017 | Resource database (internal)           |

## API Examples

### Register a new user (Member role)

```bash
curl -X POST http://localhost:5001/register \
  -H "Content-Type: application/json" \
  -d '{"name": "testuser", "password": "password123"}'
```

### Login

```bash
curl -X POST http://localhost:5001/login \
  -H "Content-Type: application/json" \
  -d '{"name": "<your-admin-name>", "password": "<your-admin-password>"}'
```

### Get assets (requires authentication)

```bash
TOKEN="your-jwt-token"
curl http://localhost:5002/assets \
  -H "Authorization: Bearer $TOKEN"
```

### Create asset (Admin only)

```bash
curl -X POST http://localhost:5002/assets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Desk A1", "type": "Desk", "status": "Available"}'
```

## Role Behavior

| Role       | Capabilities               |
| ---------- | -------------------------- |
| **Admin**  | View assets, Create assets |
| **Member** | View assets only           |

- All registrations via `/register` create **Member** accounts
- **Admin** accounts are created only through seed configuration
- Backend authorization is the enforcement layer; frontend hides UI elements for UX

### Hidden Admin Feature (Access Permissions Demo)

A hidden feature was added to demonstrate the implementation of different access permissions in the application.

**How it works:**

- Triple-click on the "Smart Office" title in the header (within 1 second)
- **Admin users:** The title will turn red, indicating admin mode is active. Triple-click again to toggle it off.
- **Non-admin users:** Will be redirected to the `/access-denied` page.

This showcases how the `ProtectedRoute` component and `authStore.isAdmin` can be used to restrict access to certain features based on user roles.

## Project Structure

```
smart-office/
├── auth-service/          # .NET 9 Auth API
│   ├── Controllers/
│   ├── DTOs/
│   ├── Models/
│   ├── Services/
│   └── Dockerfile
├── resource-service/      # .NET 9 Resource API
│   ├── Controllers/
│   ├── DTOs/
│   ├── Models/
│   ├── Services/
│   └── Dockerfile
├── frontend/              # React + TypeScript
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── stores/
│   │   └── types/
│   └── Dockerfile
├── docs/
├── docker-compose.yml
└── .env.example
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - Service design and JWT trust model
- [API Reference](docs/API.md) - Endpoints, schemas, status codes
- [Security](docs/SECURITY.md) - Authentication and authorization details
- [Development Notes](docs/DEV_NOTES.md) - Design decisions and debugging
- [Testing](docs/TESTING.md) - Testing strategy
- [Docker Guide](docs/DOCKER.md) - Container orchestration details

## Reflections

This project demonstrates several enterprise patterns:

- **Stateless JWT authentication** with shared symmetric signing
- **Microservice data isolation** - each service owns its database
- **Role-based access control** with policy-based authorization
- **Clean architecture** with separation of concerns (DTOs, Services, Controllers)
- **Container orchestration** with health checks and dependency ordering

### Technical Difficulties & Solutions

1. **Learning New Technology Stack**

   - _Problem:_ This project required working with unfamiliar technologies including .NET 9, JWT authentication, microservice architecture, and role-based authorization patterns.
   - _Solution:_ Leveraged AI tools for guidance and code generation while ensuring all concepts were understood before integration. Focused on understanding the "why" behind each pattern (stateless JWT, service isolation, policy-based auth) rather than just copying code.

2. **Secret Management for Git**
   - _Problem:_ Initial commit included default passwords in docker-compose.yml fallbacks, triggering GitHub secret scanning alerts.
   - _Solution:_ Removed all default values from docker-compose.yml, using only environment variable references. Updated .env.example with placeholder text instead of real passwords.

## Tooling Disclosure

### Frameworks & Libraries

- .NET 9 with Entity Framework Core and Npgsql
- React 19 with TypeScript, MobX, and MUI v5
- Docker with multi-stage builds
- PostgreSQL 16 and MongoDB 7

### AI Tools

- **GitHub Copilot (Claude Opus 4.5 / Sonnet)** — Used extensively for code generation, architecture planning, debugging, and documentation. All generated code was reviewed and understood before integration.
- **ChatGPT** — Used for learning concepts, troubleshooting, and exploring alternative approaches.

---

## Branches

- **`main`** — Active development branch with ongoing improvements (you are here)
- **`stable-v1`** — [Stable release version](https://github.com/Roeeht/Smart-Office/tree/stable-v1)
