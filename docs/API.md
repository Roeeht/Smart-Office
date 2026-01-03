# API Reference

## Auth Service (Port 5001)

Base URL: `http://localhost:5001`

### POST /register

Register a new user account. All registrations create Member accounts.

**Request:**

```json
{
  "name": "string (3-50 chars, required)",
  "password": "string (min 6 chars, required)"
}
```

**Response (201 Created):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2026-01-02T14:30:00Z",
  "role": "Member"
}
```

**Error Responses:**

- `400 Bad Request` - Validation errors
- `409 Conflict` - Username already exists

---

### POST /login

Authenticate with existing credentials.

**Request:**

```json
{
  "name": "string (required)",
  "password": "string (required)"
}
```

**Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2026-01-02T14:30:00Z",
  "role": "Admin|Member"
}
```

**Error Responses:**

- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Invalid credentials

---

### GET /health

Health check endpoint.

**Response (200 OK):**

```json
{
  "status": "healthy",
  "service": "auth-service",
  "timestamp": "2026-01-02T14:00:00Z"
}
```

---

## Resource Service (Port 5002)

Base URL: `http://localhost:5002`

All endpoints (except /health) require JWT authentication.

### GET /assets

Retrieve all assets. Available to any authenticated user.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Desk A1",
    "type": "Desk",
    "status": "Available",
    "createdAt": "2026-01-02T12:00:00Z"
  }
]
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid token

---

### POST /assets

Create a new asset. **Admin only.**

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request:**

```json
{
  "name": "string (1-100 chars, required)",
  "type": "string (1-50 chars, required)",
  "status": "string (1-50 chars, required)"
}
```

**Response (201 Created):**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Desk A1",
  "type": "Desk",
  "status": "Available",
  "createdAt": "2026-01-02T12:00:00Z"
}
```

**Error Responses:**

- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - User is not Admin

---

### GET /health

Health check endpoint (no authentication required).

**Response (200 OK):**

```json
{
  "status": "healthy",
  "service": "resource-service",
  "timestamp": "2026-01-02T14:00:00Z"
}
```

---

## Common Error Format

All error responses follow the ProblemDetails format (RFC 7807):

```json
{
  "title": "Error Title",
  "detail": "Detailed error message",
  "status": 400,
  "errors": {
    "fieldName": ["Validation error message"]
  }
}
```

## Authentication Flow

1. Call `/login` or `/register` on Auth Service
2. Store the returned `token`
3. Include token in all Resource Service requests:
   ```
   Authorization: Bearer <token>
   ```
4. If you receive `401`, the token is expired or invalid - re-authenticate

## Asset Types

Suggested values (not enforced by API):

- `Desk`
- `Room`
- `Equipment`
- `Vehicle`
- `Other`

## Asset Status

Suggested values (not enforced by API):

- `Available`
- `Occupied`
- `Reserved`
- `Maintenance`
