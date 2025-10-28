# 🚀 API Endpoints Reference

## Base URL
```
http://localhost:5001/api/v1
```

## 🔐 Authentication Endpoints

### Register
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "businessName": "My Fashion Studio",
  "email": "designer@example.com", 
  "password": "SecurePass123",
  "contactNumber": "+1234567890",
  "address": "123 Fashion Street"
}
```

### Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "designer@example.com",
  "password": "SecurePass123"
}
```

### Verify Email
```bash
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "email": "designer@example.com",
  "code": "123456"
}
```

### Resend Verification
```bash
POST /api/v1/auth/resend-verification
Content-Type: application/json

{
  "email": "designer@example.com"
}
```

## 👥 Client Endpoints (Requires Auth)

### Create Client
```bash
POST /api/v1/clients
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "1234567890",
  "email": "john@example.com", 
  "gender": "Male"
}
```

### Get Clients
```bash
GET /api/v1/clients?page=1&limit=50&search=john
Authorization: Bearer YOUR_JWT_TOKEN
```

### Get Client by ID
```bash
GET /api/v1/clients/{client-id}
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🔧 Utility Endpoints

### Health Check
```bash
GET /health
```

### API Documentation
```bash
GET /api/v1/docs
```

**Note:** All endpoints use `/api/v1` prefix!