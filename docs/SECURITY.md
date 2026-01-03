# Security

## Password Hashing

### Implementation

Passwords are hashed using ASP.NET Core Identity's `PasswordHasher<T>`:

```csharp
var hasher = new PasswordHasher<User>();
user.PasswordHash = hasher.HashPassword(user, password);
```

### Algorithm

The PasswordHasher uses PBKDF2 with:

- HMAC-SHA256 (ASP.NET Core 3.0+)
- 10,000 iterations (configurable)
- 128-bit salt
- 256-bit subkey

### Verification

```csharp
var result = hasher.VerifyHashedPassword(user, user.PasswordHash, inputPassword);
if (result == PasswordVerificationResult.Failed)
{
    // Invalid password
}
```

### Security Properties

- ✅ Salted (unique salt per password)
- ✅ Slow hash function (iterations)
- ✅ Timing-safe comparison
- ✅ Rehash support for algorithm upgrades

---

## JWT Authentication

### Token Structure

```
Header.Payload.Signature
```

**Header:**

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload (Claims):**

```json
{
  "sub": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "username",
  "role": "Admin",
  "jti": "unique-token-id",
  "iat": 1735827600,
  "exp": 1735829400,
  "iss": "smart-office",
  "aud": "smart-office-api"
}
```

### Signing Algorithm

**HMAC-SHA256 (HS256)** with symmetric key.

```csharp
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
```

### Token Expiration

- Default: 30 minutes
- Configurable via `JWT_EXP_MINUTES` environment variable
- No refresh tokens (re-authentication required)

### Validation Parameters

Resource Service validates all of:

| Parameter                  | Validation                             |
| -------------------------- | -------------------------------------- |
| `ValidateIssuerSigningKey` | ✅ Required                            |
| `IssuerSigningKey`         | Symmetric key from `JWT_SECRET`        |
| `ValidateIssuer`           | ✅ Required, must match `JWT_ISSUER`   |
| `ValidateAudience`         | ✅ Required, must match `JWT_AUDIENCE` |
| `ValidateLifetime`         | ✅ Required, token must not be expired |
| `ClockSkew`                | `TimeSpan.Zero` (no tolerance)         |

---

## Authorization Policies

### Admin Role Policy

```csharp
options.AddPolicy("RequireAdminRole", policy =>
    policy.RequireClaim(ClaimTypes.Role, "Admin"));
```

Applied to POST /assets endpoint:

```csharp
[HttpPost]
[Authorize(Policy = "RequireAdminRole")]
public async Task<IActionResult> CreateAsset(...)
```

### Default Authorization

All Resource Service endpoints (except /health) require authentication:

```csharp
[ApiController]
[Authorize]
public class AssetsController : ControllerBase
```

---

## Role Assignment

### Registration

All users registered via `/register` receive **Member** role:

```csharp
var user = new User
{
    Role = UserRoles.Member  // Always Member
};
```

### Admin Seeding

Admin accounts are created only during startup seeding:

```csharp
if (!await context.Users.AnyAsync())
{
    var adminUser = new User
    {
        Name = configuration["SEED_ADMIN_NAME"],
        Role = UserRoles.Admin  // Only through seeding
    };
}
```

**Why?** Self-registration as Admin is a critical security vulnerability.

---

## Secrets Management

### Environment Variables

All secrets are passed via environment variables:

| Variable              | Purpose                                     |
| --------------------- | ------------------------------------------- |
| `JWT_SECRET`          | HMAC signing key (min 32 chars recommended) |
| `POSTGRES_PASSWORD`   | PostgreSQL password                         |
| `MONGO_PASSWORD`      | MongoDB password                            |
| `SEED_ADMIN_PASSWORD` | Initial Admin password                      |

### Docker Compose

Secrets are passed from `.env` file to containers:

```yaml
environment:
  JWT_SECRET: ${JWT_SECRET}
```

### Never Commit

The `.gitignore` excludes:

- `.env` files
- `*.pem`, `*.key` files
- `appsettings.Development.json`

---

## Production Considerations

### RSA/Asymmetric Signing

For production, consider RSA (RS256) instead of HMAC:

- Auth Service holds **private key** (signs tokens)
- Resource Service holds **public key** (verifies tokens)
- Key separation: compromise of Resource Service doesn't expose signing capability

**Out of scope for this assignment** but documented for awareness.

### HTTPS

Production deployments should:

- Terminate TLS at load balancer/reverse proxy
- Use HTTPS between browser and services
- Consider mTLS for service-to-service communication

### Token Storage

Frontend stores tokens in `localStorage`:

- Vulnerable to XSS attacks
- Production alternative: HttpOnly cookies with CSRF protection

### Rate Limiting

Not implemented but recommended for production:

- Login endpoint rate limiting
- API request throttling

---

## Threat Considerations

| Threat               | Mitigation                            |
| -------------------- | ------------------------------------- |
| Brute force login    | Rate limiting (not implemented)       |
| Token theft          | Short expiration, HTTPS in production |
| SQL injection        | Parameterized queries via EF Core     |
| NoSQL injection      | Typed queries via MongoDB driver      |
| XSS                  | React's default escaping, CSP headers |
| Privilege escalation | Backend authorization enforcement     |
| Secret exposure      | Environment variables, .gitignore     |
