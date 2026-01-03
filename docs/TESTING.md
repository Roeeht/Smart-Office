# Testing Strategy

## Overview

This document outlines the testing strategy for the Smart Office Asset Manager. Due to the scope of this demonstration project, tests are not fully implemented but the strategy is documented for completeness.

## Testing Layers

### 1. Unit Tests

**Auth Service:**

- `AuthServiceImpl` - Registration and login logic
- `JwtService` - Token generation
- Password hashing verification

**Resource Service:**

- `AssetService` - Asset CRUD operations
- Authorization policy behavior

**Frontend:**

- `AuthStore` - Authentication state transitions
- `AssetStore` - Asset state management
- `ProtectedRoute` - Route guard logic

### 2. Integration Tests

**Auth Service:**

- POST /register → database → response
- POST /login → database → JWT response
- Duplicate username handling

**Resource Service:**

- GET /assets with valid JWT
- GET /assets with invalid JWT → 401
- POST /assets as Admin → 201
- POST /assets as Member → 403

### 3. End-to-End Tests

- Full login flow → dashboard → asset list
- Registration → automatic login → dashboard
- Admin creates asset → visible to Member
- Token expiration → redirect to login

## Test Frameworks

### Backend (.NET)

- **xUnit** - Test framework
- **Moq** - Mocking dependencies
- **FluentAssertions** - Readable assertions
- **WebApplicationFactory** - Integration testing

### Frontend (React)

- **Vitest** - Test runner (Vite-native)
- **React Testing Library** - Component testing
- **MSW (Mock Service Worker)** - API mocking

## Example Test Cases

### Auth Service Unit Test

```csharp
[Fact]
public async Task Register_WithNewUser_ReturnsToken()
{
    // Arrange
    var request = new RegisterRequest { Name = "testuser", Password = "password123" };

    // Act
    var result = await _authService.RegisterAsync(request);

    // Assert
    result.Should().NotBeNull();
    result.Token.Should().NotBeEmpty();
    result.Role.Should().Be("Member");
}

[Fact]
public async Task Register_WithExistingUser_ReturnsNull()
{
    // Arrange - user already exists in mock db

    // Act
    var result = await _authService.RegisterAsync(existingUserRequest);

    // Assert
    result.Should().BeNull();
}
```

### Resource Service Integration Test

```csharp
[Fact]
public async Task GetAssets_WithValidToken_Returns200()
{
    // Arrange
    var token = GenerateTestToken(role: "Member");
    _client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", token);

    // Act
    var response = await _client.GetAsync("/assets");

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.OK);
}

[Fact]
public async Task CreateAsset_AsMember_Returns403()
{
    // Arrange
    var token = GenerateTestToken(role: "Member");
    _client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", token);

    // Act
    var response = await _client.PostAsJsonAsync("/assets", newAsset);

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
}
```

### Frontend Store Test

```typescript
describe("AuthStore", () => {
  it("should set isAuthenticated after login", async () => {
    // Arrange
    mockApi.onPost("/login").reply(200, {
      token: "test-token",
      role: "Member",
      expiresAt: "2026-01-02T14:00:00Z",
    });

    // Act
    await authStore.login({ name: "test", password: "pass" });

    // Assert
    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.role).toBe("Member");
  });
});
```

## Running Tests

### Backend

```bash
cd auth-service
dotnet test

cd resource-service
dotnet test
```

### Frontend

```bash
cd frontend
npm test
npm run test:coverage
```

### All Tests with Docker

```bash
docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
```

## Coverage Goals

| Component           | Target Coverage |
| ------------------- | --------------- |
| Auth Service        | 80%             |
| Resource Service    | 80%             |
| Frontend Stores     | 90%             |
| Frontend Components | 70%             |

## Current Status

⚠️ **Tests are not implemented** in this demonstration project.

The testing strategy is documented to show:

- Understanding of testing pyramid
- Appropriate frameworks for each layer
- Example test cases for critical paths

A production implementation would include:

- Full unit test suites
- Integration tests with test containers
- E2E tests with Playwright or Cypress
- CI pipeline running tests on every PR
