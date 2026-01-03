# Architecture

## Overview

The Smart Office Asset Manager follows a microservice architecture with:

- **Two independent backend services** (Auth, Resource)
- **Isolated databases** per service
- **Stateless JWT authentication**
- **Single-page application frontend**

## Service Responsibilities

### Auth Service

- User registration and login
- Password hashing using ASP.NET Core Identity PasswordHasher
- JWT token generation with configurable expiration
- Admin user seeding on first startup

**Does NOT:**

- Store session state
- Know about assets or resource data
- Connect to MongoDB

### Resource Service

- Asset CRUD operations
- JWT token validation (stateless)
- Role-based authorization (Admin policy)

**Does NOT:**

- Issue tokens
- Manage users
- Connect to PostgreSQL

## Data Ownership

```
Auth Service ◄──────► PostgreSQL
     │                    │
     │                    └─ users table
     │                         - id (GUID)
     │                         - name
     │                         - password_hash
     │                         - role
     │
     ▼
   JWT Token ──────────────────────────────────────►
     │
     │
Resource Service ◄──────► MongoDB
                              │
                              └─ assets collection
                                   - _id (ObjectId)
                                   - name
                                   - type
                                   - status
                                   - createdAt
```

**Critical rule:** Services never access each other's databases. Data isolation is enforced at the infrastructure level.

## JWT Trust Model

### Token Flow

1. User authenticates with Auth Service
2. Auth Service validates credentials against PostgreSQL
3. Auth Service generates JWT with claims (userId, role)
4. Client stores JWT and includes in subsequent requests
5. Resource Service validates JWT using shared signing key
6. Resource Service extracts role from claims for authorization

### Shared Secret

Both services use the same `JWT_SECRET` environment variable for HMAC-SHA256 signing. This enables:

- Auth Service to **sign** tokens
- Resource Service to **verify** tokens

```
Auth Service                    Resource Service
     │                                │
     │  Signs with JWT_SECRET         │  Verifies with JWT_SECRET
     │         │                      │         │
     ▼         ▼                      ▼         ▼
   ┌─────────────────┐          ┌─────────────────┐
   │ HMAC-SHA256     │          │ HMAC-SHA256     │
   │ Sign(payload,   │          │ Verify(token,   │
   │      secret)    │          │        secret)  │
   └─────────────────┘          └─────────────────┘
```

### Token Claims

```json
{
  "sub": "user-guid",
  "name": "username",
  "role": "Admin|Member",
  "jti": "unique-token-id",
  "iat": 1234567890,
  "exp": 1234569690,
  "iss": "smart-office",
  "aud": "smart-office-api"
}
```

### Validation Parameters

Resource Service validates:

- **Issuer** - Must match `JWT_ISSUER`
- **Audience** - Must match `JWT_AUDIENCE`
- **Expiration** - Token must not be expired
- **Signing key** - Must be signed with `JWT_SECRET`

## Docker Networking

All services communicate over a single Docker bridge network: `smart-office-network`

```
┌─────────────────────────────────────────────────────────┐
│                 smart-office-network                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  auth-service ◄────► auth-db                            │
│      │                                                  │
│      │ (no direct connection)                           │
│      │                                                  │
│  resource-service ◄────► mongo-db                       │
│                                                         │
│  frontend                                               │
│      │                                                  │
│      ├────► auth-service (via browser, port 5001)       │
│      └────► resource-service (via browser, port 5002)   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Service Discovery

- Services reference each other by container name
- Database connections use container names as hostnames:
  - `auth-db` for PostgreSQL
  - `mongo-db` for MongoDB
- Frontend calls APIs via exposed ports (browser → localhost)

### Health Checks and Dependencies

```yaml
auth-service:
  depends_on:
    auth-db:
      condition: service_healthy

resource-service:
  depends_on:
    mongo-db:
      condition: service_healthy
    auth-service:
      condition: service_healthy
```

## Frontend Architecture

### State Management (MobX)

```
┌─────────────────┐     ┌─────────────────┐
│   AuthStore     │     │   AssetStore    │
├─────────────────┤     ├─────────────────┤
│ - token         │     │ - assets[]      │
│ - role          │     │ - isLoading     │
│ - isLoading     │     │ - error         │
│ - error         │     │                 │
├─────────────────┤     ├─────────────────┤
│ + login()       │     │ + fetchAssets() │
│ + register()    │     │ + addAsset()    │
│ + logout()      │     │ + clearAssets() │
└─────────────────┘     └─────────────────┘
```

### Routing

- `/login` - Public authentication page
- `/dashboard` - Protected asset list
- `/access-denied` - Shown when role is insufficient
- `/*` - Redirects to dashboard (then login if unauthenticated)
