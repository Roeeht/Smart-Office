# Development Notes

## Design Decisions

### 1. Separate Databases per Service

**Decision:** Auth Service uses PostgreSQL, Resource Service uses MongoDB.

**Rationale:**

- Demonstrates proper microservice data isolation
- PostgreSQL suits relational user data with unique constraints
- MongoDB suits document-based asset data with flexible schema
- No cross-database joins required in this domain

### 2. Symmetric JWT Signing (HMAC-SHA256)

**Decision:** Use shared secret instead of asymmetric RSA keys.

**Rationale:**

- Simpler configuration for demo/interview context
- Both services are trusted (same team/org)
- RSA would require key distribution infrastructure
- Documented RSA as production alternative in SECURITY.md

### 3. Admin Seeding Only

**Decision:** Admin accounts cannot be created via API.

**Rationale:**

- Prevents privilege escalation via registration
- Controlled admin provisioning via environment variables
- Mirrors enterprise patterns where admin accounts are managed separately

### 4. MobX over Redux

**Decision:** Use MobX for frontend state management.

**Rationale:**

- Less boilerplate than Redux
- More intuitive for object-oriented patterns
- Sufficient for this application's complexity
- Per specification in COPILOT_CONTEXT.md

### 5. No Refresh Tokens

**Decision:** Require re-authentication when JWT expires.

**Rationale:**

- Simplifies implementation
- Short-lived tokens (30 min) provide adequate security
- Production systems would add refresh token flow

---

## Implementation Notes

### Entity Framework Core Migrations

To create/update database schema:

```bash
cd auth-service
dotnet ef migrations add InitialCreate
dotnet ef database update
```

The `AdminSeeder` handles this automatically on startup via `MigrateAsync()`.

### MongoDB Collections

Collections are created automatically on first document insert. The `assets` collection is typed to the `Asset` model.

### Docker Build Context

Each Dockerfile expects to be built from its service directory:

```yaml
build:
  context: ./auth-service
  dockerfile: Dockerfile
```

### CORS Configuration

Both services allow all origins for development:

```csharp
policy.AllowAnyOrigin()
      .AllowAnyMethod()
      .AllowAnyHeader();
```

Production should restrict to specific frontend origin.

---

## Bottlenecks and Limitations

### 1. No Pagination

Asset list returns all assets. For large datasets:

- Add `skip` and `limit` query parameters
- Implement cursor-based pagination

### 2. No Search/Filter

Assets cannot be filtered by type or status. Future enhancement:

- Add query parameters for filtering
- Add text search on name

### 3. Single Region

No database replication or multi-region support. For high availability:

- PostgreSQL read replicas
- MongoDB replica set

### 4. No Caching

Every request hits the database. For scale:

- Add Redis for session/token caching
- Cache asset lists with invalidation

---

## Debugging Tips

### Check Service Health

```bash
curl http://localhost:5001/health
curl http://localhost:5002/health
```

### View Docker Logs

```bash
docker-compose logs auth-service
docker-compose logs resource-service
docker-compose logs -f  # Follow all logs
```

### Connect to PostgreSQL

```bash
docker exec -it smart-office-auth-db psql -U authuser -d authdb
```

### Connect to MongoDB

```bash
docker exec -it smart-office-mongo-db mongosh -u $MONGO_USER -p $MONGO_PASSWORD --authenticationDatabase admin
```

### Decode JWT Token

```bash
# Using jq (install via: brew install jq)
echo "eyJhbGc..." | cut -d'.' -f2 | base64 -d | jq
```

### Common Issues

**401 on Resource Service:**

- Token expired (check `exp` claim)
- Wrong JWT_SECRET between services
- Missing `Authorization: Bearer` header

**Connection refused to database:**

- Service started before database was ready
- Check `depends_on` health conditions
- Restart the service: `docker-compose restart auth-service`

**Admin seeding not working:**

- Database already has users (seed only runs if empty)
- Check SEED_ADMIN_NAME and SEED_ADMIN_PASSWORD are set
- Check logs: `docker-compose logs auth-service | grep -i admin`

---

## Future Enhancements

1. **Refresh Tokens** - Extend session without re-login
2. **Asset Booking** - Reserve assets for time periods
3. **Audit Logging** - Track who created/modified assets
4. **Email Verification** - Verify user email on registration
5. **Password Reset** - Self-service password recovery
6. **Unit Tests** - xUnit for .NET, Jest for React
7. **Integration Tests** - Test service interactions
8. **CI/CD Pipeline** - GitHub Actions for build/deploy
