# Fittingz Backend API

Enterprise-grade REST API for fashion designers with advanced client management, email verification, and real-time analytics.

## 🚀 Features

### Core Functionality
- **User Authentication** - JWT-based auth with email verification
- **Client Management** - Full CRUD operations with advanced features
- **Email System** - Real SMTP delivery with background processing
- **Security** - Multi-layer protection with Arcjet integration

### Performance Optimizations
- **Sub-400ms Response Times** - Optimized database queries and caching
- **Redis Caching** - Multi-layer caching with smart invalidation
- **Background Jobs** - Non-blocking operations with BullMQ
- **Connection Pooling** - Efficient database connections

### Advanced Features
- **Pagination & Search** - Efficient data retrieval
- **Performance Monitoring** - Real-time metrics and alerts
- **Bulk Operations** - Batch processing for large datasets
- **Comprehensive Logging** - Structured logging with performance tracking

## 📊 API Performance

| Operation | Target | Achieved |
|-----------|--------|----------|
| Create Client | <400ms | ~200-300ms |
| Get Clients (cached) | <100ms | ~50-80ms |
| Search Clients | <300ms | ~150-250ms |
| Bulk Operations | <2s | ~800ms-1.5s |

## 🛠 Tech Stack

- **Runtime**: Node.js 22+ with TypeScript
- **Framework**: Express.js with advanced middleware
- **Database**: PostgreSQL with Drizzle ORM
- **Cache**: Redis with Upstash
- **Queue**: BullMQ for background jobs
- **Security**: Arcjet + JWT + bcrypt
- **Email**: Nodemailer with SMTP
- **Docs**: Swagger/OpenAPI 3.0

## 🚦 Quick Start

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Configure your DATABASE_URL, REDIS_URL, etc.

# Run migrations
pnpm db:migrate

# Start development server
pnpm dev
```

## 📚 API Documentation

Interactive API documentation available at:
```
http://localhost:5001/api/v1/docs
```

## 🔐 Authentication

All client endpoints require authentication. Include JWT token in requests:

```bash
Authorization: Bearer <your-jwt-token>
```

## 📋 Client Management API

### Create Client
```bash
POST /api/v1/clients
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "John Doe",
  "phone": "1234567890", 
  "email": "john.doe@example.com",
  "gender": "Male"
}
```

### Get All Clients (Paginated)
```bash
GET /api/v1/clients?page=1&limit=50&search=john
Authorization: Bearer <token>
```

### Get Client by ID
```bash
GET /api/v1/clients/{client-id}
Authorization: Bearer <token>
```

### Update Client
```bash
PUT /api/v1/clients/{client-id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Jane Doe",
  "email": "jane.doe@example.com"
}
```

### Delete Client
```bash
DELETE /api/v1/clients/{client-id}
Authorization: Bearer <token>
```

### Get Client Statistics
```bash
GET /api/v1/clients/stats
Authorization: Bearer <token>
```

## 🔧 Environment Variables

```env
# Application
NODE_ENV=development
PORT=5001
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security
ARCJET_KEY=your-arcjet-key
BCRYPT_SALT_ROUNDS=8

# Client
CLIENT_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
```

## 🏗 Architecture

```
src/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── modules/
│   ├── user/        # User authentication
│   └── client/      # Client management
├── routes/          # API routes
├── services/        # Background services
├── utils/           # Utility functions
└── db/              # Database schemas
```

## 📈 Performance Features

### Caching Strategy
- **L1 Cache**: In-memory cache for hot data
- **L2 Cache**: Redis for distributed caching
- **Cache Invalidation**: Smart cache clearing on updates

### Background Processing
- **Email Queue**: Non-blocking email delivery
- **Analytics Queue**: Performance metrics collection
- **Priority Queues**: Critical operations first

### Database Optimization
- **Connection Pooling**: Efficient connection management
- **Query Optimization**: Indexed searches and pagination
- **Health Checks**: Automatic connection monitoring

## 🔒 Security Features

- **Rate Limiting**: Role-based request limits
- **Input Validation**: Comprehensive data validation
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Content security policies
- **CORS**: Configurable cross-origin policies

## 📊 Monitoring & Logging

- **Performance Tracking**: Sub-400ms response monitoring
- **Error Tracking**: Comprehensive error logging
- **Request Metrics**: Duration and success rate tracking
- **Health Checks**: Database and service monitoring

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run linting
pnpm lint

# Type checking
pnpm type-check
```

## 🚀 Deployment

The API is optimized for deployment on:
- **Vercel** (recommended)
- **Railway**
- **Render**
- **AWS/GCP/Azure**

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation
- Review the performance metrics