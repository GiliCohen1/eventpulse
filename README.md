# EventPulse — Real-time Event Management Platform

A modern, scalable event management platform built with microservices architecture. EventPulse provides comprehensive event management, ticketing, real-time communication, and analytics capabilities.

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Microservices](#-microservices)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Data Flow](#-data-flow)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## 🏗️ Architecture Overview

EventPulse is built using a **microservices architecture** with a monorepo structure managed by **Turbo**. Each service is independently deployable and communicates through:

- **Synchronous**: REST APIs (via API Gateway)
- **Asynchronous**: Apache Kafka message broker

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (React)                         │
│                    (Port 5173)                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              API Gateway (NestJS)                           │
│         Port 3000 - Proxy, Auth, WebSocket                 │
│         Rate Limiting, Request Correlation                 │
└──────────────┬────────────────────────────────────────────┬─┘
               │                                            │
       ┌───────┴────────┬──────────────┬──────────────┐     │
       ▼                ▼              ▼              ▼     ▼
┌────────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────────┐
│   User     │ │   Event      │ │  Ticket    │ │    Chat      │
│  Service   │ │  Service     │ │  Service   │ │   Service    │
│ (Port 3001)│ │ (Port 3002)  │ │ (Port 3003)│ │  (Port 3004) │
└────────────┘ └──────────────┘ └────────────┘ └──────────────┘
       │                │              │              │
       │                │              │              │
  ┌────┴────────────────┴──────────────┴──────────────┘
  │
  └─────────────────────────────────────────────────────────────┐
                                                                 │
      ┌──────────────────────┐        ┌────────────────────┐   │
      │  Notification Svc    │        │  Analytics Svc     │   │
      │   (Port 3005)        │        │   (Port 3006)      │   │
      └──────────────────────┘        └────────────────────┘   │
       (Kafka Consumer)                (Kafka Consumer)        │
       │                               │                       │
       └───────────────────────────────┴───────────────────────┘
                    ▲
                    │
        ┌───────────┴───────────┐
        │   Apache Kafka         │
        │   (Message Broker)     │
        └─────────────────────────┘
```

## 🎯 Microservices

### 1. **API Gateway** (Port 3000)

**Purpose**: Single entry point for all client requests

**Features**:

- Request routing to microservices
- JWT authentication
- Rate limiting
- Real-time WebSocket communication
- Request correlation tracking
- Error handling and response standardization

**Technology**: NestJS, Express, Socket.io, Redis

---

### 2. **User Service** (Port 3001)

**Purpose**: User and organization management

**Key Features**:

- User registration and profile management
- Authentication (JWT tokens)
- Organization creation and management
- User roles and permissions
- Social authentication integration

**Database**: PostgreSQL
**Technology**: NestJS, TypeORM

**Key Endpoints**:

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /users/:id` - Get user profile
- `POST /organizations` - Create organization
- `GET /organizations/:id/members` - Get organization members

---

### 3. **Event Service** (Port 3002)

**Purpose**: Core event management and configuration

**Key Features**:

- Create and manage events
- Event categories and classifications
- Ticket tier configuration (VIP, Standard, Early Bird, etc.)
- Event media (images, videos)
- Event scheduling and status management
- Event discoverability

**Database**: PostgreSQL
**Technology**: NestJS, TypeORM

**Key Endpoints**:

- `POST /events` - Create event
- `GET /events` - List events
- `GET /events/:id` - Get event details
- `PUT /events/:id` - Update event
- `POST /events/:id/categories` - Add category
- `POST /events/:id/ticket-tiers` - Configure ticket tiers

---

### 4. **Ticket Service** (Port 3003)

**Purpose**: Ticket sales, registrations, and payment processing

**Key Features**:

- Ticket registration and booking
- Payment processing integration
- Inventory management
- QR code generation for tickets
- Ticket validation and check-in
- Refund management

**Database**: PostgreSQL
**Cache**: Redis (for real-time inventory)
**Technology**: NestJS, TypeORM, Redis

**Key Endpoints**:

- `POST /registrations` - Book tickets
- `POST /registrations/:id/pay` - Process payment
- `POST /registrations/:id/qr-code` - Generate QR code
- `GET /registrations/:id` - Get registration details
- `POST /registrations/:id/checkin` - Check-in ticket

---

### 5. **Chat Service** (Port 3004)

**Purpose**: Real-time messaging between event attendees

**Key Features**:

- Real-time chat rooms for events
- Message history persistence
- User presence tracking
- Message search
- Notification integration

**Database**: MongoDB (flexible schema for chat messages)
**Cache**: Redis (for active room management)
**Technology**: NestJS, MongoDB, Socket.io

**Key Endpoints**:

- `POST /rooms` - Create chat room
- `GET /rooms/:id/messages` - Get chat history
- `POST /rooms/:id/join` - Join room
- `POST /messages` - Send message (via WebSocket)

---

### 6. **Notification Service** (Port 3005)

**Purpose**: Event-driven notifications and alerts

**Key Features**:

- Email notifications
- SMS alerts (optional)
- In-app notifications
- Notification preferences management
- Event-triggered automated notifications

**Database**: PostgreSQL
**Communication**: Kafka consumer
**Technology**: NestJS, TypeORM, Nodemailer

**Triggered by Events**:

- User registration completion
- Payment confirmation
- Event reminders
- Ticket cancellations
- Event updates

---

### 7. **Analytics Service** (Port 3006)

**Purpose**: Event metrics and business intelligence

**Key Features**:

- Event attendance tracking
- Revenue analytics
- Visitor demographics
- Ticket sales trends
- User engagement metrics
- Dashboard aggregations

**Database**: MongoDB (time-series optimized)
**Communication**: Kafka consumer
**Technology**: NestJS, MongoDB

**Metrics Tracked**:

- Event attendance count
- Ticket sales per tier
- Revenue per event
- User engagement metrics
- Popular events and categories

---

### 8. **Client (Frontend)** (Port 5173)

**Purpose**: User-facing web application

**Features**:

- Event discovery and search
- Event registration and ticketing
- User profile management
- Real-time chat integration
- Order history
- Responsive design

**Technology**: React, Vite, TypeScript, Tailwind CSS, React Query

---

## 💻 Technology Stack

### Backend

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **ORM**: TypeORM (for relational databases)
- **API**: REST with potential GraphQL

### Databases

- **PostgreSQL 16**: Relational data (users, events, tickets, notifications)
- **MongoDB 7**: Document storage (chat messages, analytics events)
- **Redis 7**: Caching and real-time features

### Message Queue

- **Apache Kafka 7.6**: Asynchronous inter-service communication
- **Zookeeper**: Kafka coordination

### Frontend

- **React**: UI library
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Socket.io**: Real-time communication

### Deployment

- **Docker**: Containerization
- **Docker Compose**: Local orchestration
- **Turbo**: Monorepo management

---

## 🤔 Why These Technologies?

### Backend Framework: NestJS over Express/Fastify

**Why NestJS?**

- **Enterprise-Ready Architecture**: Built-in dependency injection, modular structure, and decorators make it perfect for microservices
- **TypeScript First**: Native TypeScript support with excellent type safety and IntelliSense
- **Microservices Support**: First-class support for message brokers (Kafka), WebSockets, and microservice patterns
- **Developer Experience**: CLI tools, extensive documentation, and built-in testing utilities
- **Scalability**: Opinionated structure prevents technical debt as the project grows

**Why not Express?**

- Express is minimalist and requires manual architecture decisions
- No built-in dependency injection or modular structure
- More boilerplate for microservices patterns

**Why not Fastify?**

- While faster, NestJS provides better developer experience and ecosystem for complex applications
- Fastify can be used as NestJS's underlying engine if raw performance is critical

---

### Frontend: React over Vue/Angular

**Why React?**

- **Ecosystem Maturity**: Vast library ecosystem (React Query, Zustand, React Router)
- **Component Reusability**: Atomic design pattern works excellently with React
- **Performance**: Virtual DOM and React 18's concurrent features
- **Job Market**: Largest developer community and hiring pool
- **Flexibility**: Unopinionated, allowing custom architecture choices

**Why not Vue?**

- Smaller ecosystem and community
- Great for smaller projects, but React scales better for large teams

**Why not Angular?**

- Steeper learning curve
- More verbose and opinionated
- Overkill for frontend-focused applications

---

### Build Tool: Vite over Webpack/Create React App

**Why Vite?**

- **Lightning Fast HMR**: Sub-second hot module replacement
- **Modern ESM**: Native ES modules for faster dev server
- **Optimized Production**: Rollup-based production builds
- **Zero Config TypeScript**: Built-in TS support
- **Future-Proof**: Modern tooling aligned with web standards

**Why not Webpack?**

- Slower development experience
- Complex configuration

**Why not Create React App?**

- Outdated, no longer actively maintained
- Slow build times

---

### Database Strategy: Polyglot Persistence (PostgreSQL + MongoDB)

**Why PostgreSQL for Relational Data?**

- **ACID Compliance**: Critical for financial transactions (payments, registrations)
- **Data Integrity**: Foreign keys, constraints ensure referential integrity
- **Complex Queries**: JOIN operations for user-event-ticket relationships
- **Mature Ecosystem**: TypeORM, excellent tooling, proven reliability
- **JSON Support**: Modern PostgreSQL handles semi-structured data when needed

**Why MongoDB for Document Storage?**

- **Flexible Schema**: Chat messages and analytics events have variable structures
- **Horizontal Scalability**: Sharding for high-volume chat and analytics data
- **Time-Series Data**: Excellent for analytics events storage
- **Fast Writes**: Optimized for high-throughput event tracking
- **Nested Documents**: Natural fit for chat messages with embedded metadata

**Why not MySQL?**

- PostgreSQL has better JSON support and advanced features (CTEs, window functions)

**Why not Only PostgreSQL or Only MongoDB?**

- Polyglot persistence uses the right tool for each job
- PostgreSQL excels at transactional data, MongoDB at flexible event data

---

### Caching: Redis over Memcached

**Why Redis?**

- **Data Structures**: Not just key-value; supports sets, sorted sets, lists, hashes
- **Pub/Sub**: Built-in publish-subscribe for real-time features
- **Persistence Options**: Can persist data to disk (AOF, RDB)
- **Atomic Operations**: INCR, ZINCRBY for counters and trending calculations
- **Versatility**: Session storage, rate limiting, real-time presence, caching

**Why not Memcached?**

- Simple key-value only, no advanced data structures
- No persistence or pub/sub capabilities

---

### Message Broker: Apache Kafka over RabbitMQ/Redis Streams

**Why Kafka?**

- **Event Sourcing**: Immutable event log perfect for analytics and audit trails
- **High Throughput**: Handles millions of events per second
- **Durability**: Persistent, replicated message storage
- **Replay Capability**: Consumers can replay events from any point in time
- **Scalability**: Horizontal scaling with partitions
- **Industry Standard**: Battle-tested by Netflix, Uber, LinkedIn

**Why not RabbitMQ?**

- RabbitMQ is push-based (good for work queues, not event streaming)
- No native event replay capability
- Lower throughput for high-volume event streams

**Why not Redis Streams?**

- Less mature than Kafka for large-scale event streaming
- Limited ecosystem and tooling

---

### Real-Time Communication: Socket.io over Native WebSocket

**Why Socket.io?**

- **Fallback Support**: Automatic fallback to long-polling if WebSocket unavailable
- **Reconnection Logic**: Built-in automatic reconnection
- **Room Support**: Easy broadcasting to groups (event chat rooms)
- **Cross-Browser**: Handles browser inconsistencies
- **Developer Experience**: Simple API, excellent documentation

**Why not Native WebSocket?**

- Requires manual reconnection logic
- No automatic fallback
- More boilerplate for rooms and broadcasting

---

### Monorepo Management: Turbo over Lerna/Nx

**Why Turbo?**

- **Speed**: Intelligent caching and parallel execution
- **Simplicity**: Minimal configuration compared to Nx
- **Remote Caching**: Team-wide build cache (Vercel integration)
- **Zero Config**: Works with npm/yarn workspaces out of the box
- **Pipeline Awareness**: Understands task dependencies automatically

**Why not Lerna?**

- Minimal active development
- Lacks intelligent caching

**Why not Nx?**

- More complex setup
- Better for large enterprises, Turbo is perfect for medium-scale projects

---

### Containerization: Docker over Manual Deployment

**Why Docker?**

- **Consistency**: "Works on my machine" → "Works everywhere"
- **Isolation**: Each service runs in isolated environment
- **Reproducibility**: Same environment in dev, staging, production
- **Easy Onboarding**: New developers up and running in minutes
- **Microservices**: Natural fit for containerizing each service
- **Cloud-Ready**: Seamless deployment to Kubernetes, AWS ECS, etc.

---

### API Documentation: Swagger/OpenAPI

**Why Swagger?**

- **Auto-Generated**: NestJS decorators generate docs automatically
- **Interactive**: Try API endpoints directly in browser
- **Standard**: OpenAPI is industry standard for REST APIs
- **Client Generation**: Auto-generate TypeScript clients for frontend

---

## Summary of Technology Decisions

| Technology         | Chosen       | Alternative  | Reason                                         |
| ------------------ | ------------ | ------------ | ---------------------------------------------- |
| **Backend**        | NestJS       | Express      | Enterprise architecture, microservices support |
| **Frontend**       | React + Vite | Vue, Angular | Ecosystem, performance, developer experience   |
| **Primary DB**     | PostgreSQL   | MySQL        | Advanced features, JSON support, reliability   |
| **Document DB**    | MongoDB      | Cassandra    | Flexible schema, developer-friendly            |
| **Cache**          | Redis        | Memcached    | Data structures, pub/sub, versatility          |
| **Message Broker** | Kafka        | RabbitMQ     | Event sourcing, replay, throughput             |
| **Real-Time**      | Socket.io    | WebSocket    | Fallbacks, reconnection, room support          |
| **Monorepo**       | Turbo        | Nx, Lerna    | Speed, simplicity, modern caching              |
| **Container**      | Docker       | Manual       | Consistency, cloud-ready, isolation            |

---

## 📦 Prerequisites

- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **Docker Desktop**: Latest stable version
- **Docker Compose**: v3.9+
- **Git**

**System Requirements**:

- 8GB RAM (minimum)
- 10GB free disk space
- Ports available: 3000-3006 (services), 5173 (client), 5432 (PostgreSQL), 27017 (MongoDB), 6379 (Redis), 9092 (Kafka)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/eventpulse.git
cd eventpulse
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Node Environment
NODE_ENV=development

# API Gateway
GATEWAY_PORT=3000
JWT_SECRET=your_jwt_secret_key_min_32_chars

# Services Ports
USER_SERVICE_PORT=3001
EVENT_SERVICE_PORT=3002
TICKET_SERVICE_PORT=3003
CHAT_SERVICE_PORT=3004
NOTIFICATION_SERVICE_PORT=3005
ANALYTICS_SERVICE_PORT=3006

# Database - PostgreSQL
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=eventpulse
POSTGRES_PASSWORD=eventpulse_secret
POSTGRES_DB=eventpulse

# Database - MongoDB
MONGO_HOST=mongodb
MONGO_PORT=27017
MONGO_USER=eventpulse
MONGO_PASSWORD=eventpulse_secret

# Cache - Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=eventpulse_secret

# Message Broker - Kafka
KAFKA_BROKERS=localhost:9092

# Email Service (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Payment Service (optional)
STRIPE_API_KEY=your_stripe_key
```

### 4. Start Infrastructure and Services

#### Option A: Using Docker Compose (Recommended)

```bash
# Start all services
npm run docker:dev

# Wait for services to be healthy (2-3 minutes)

# Seed the database with demo data
npm run seed

# Check service status
docker compose ps
```

#### Option B: Development Mode (Local Services)

```bash
# Start infrastructure only
docker compose up -d postgres mongodb redis kafka zookeeper

# In separate terminals, start each service:
npm run dev --workspace=apps/user-service
npm run dev --workspace=apps/event-service
npm run dev --workspace=apps/ticket-service
npm run dev --workspace=apps/chat-service
npm run dev --workspace=apps/notification-service
npm run dev --workspace=apps/analytics-service
npm run dev --workspace=apps/api-gateway
npm run dev --workspace=apps/client
```

### 5. Access the Application

- **Client**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **PostgreSQL**: localhost:5432 (user: eventpulse, password: eventpulse_secret)
- **MongoDB**: localhost:27017 (user: eventpulse, password: eventpulse_secret)
- **Redis**: localhost:6379 (password: eventpulse_secret)
- **Kafka**: localhost:9092

---

## 📁 Project Structure

```
eventpulse/
├── apps/                          # Microservices and frontend
│   ├── api-gateway/              # REST API gateway & WebSocket server
│   ├── user-service/             # User & authentication management
│   ├── event-service/            # Event management core
│   ├── ticket-service/           # Ticketing & payments
│   ├── chat-service/             # Real-time messaging
│   ├── notification-service/     # Email & alert notifications
│   ├── analytics-service/        # Event analytics & metrics
│   └── client/                   # React frontend application
│
├── libs/                          # Shared libraries
│   ├── common/                   # Common utilities, decorators, guards
│   ├── kafka-common/             # Kafka producer/consumer configs
│   └── shared-types/             # Shared TypeScript types
│
├── infra/                         # Infrastructure & deployment
│   ├── kafka/                    # Kafka topic creation scripts
│   ├── postgres/                 # Database initialization & migrations
│   └── mongo/                    # MongoDB initialization
│
├── docker-compose.yml            # Local development orchestration
├── package.json                  # Root workspace configuration
├── turbo.json                    # Turbo monorepo settings
└── tsconfig.base.json           # Base TypeScript configuration
```

---

## 👨‍💻 Development

### Running Services

```bash
# Development mode (all services)
npm run dev

# Build all packages
npm run build

# Run linting
npm run lint

# Format code
npm run format

# Run tests
npm run test
```

### Working with Individual Services

```bash
# Build a specific service
npm run build --workspace=apps/event-service

# Develop a specific service
npm run dev --workspace=apps/user-service

# Test a specific service
npm run test --workspace=apps/ticket-service
```

### Database Operations

```bash
# Seed PostgreSQL with demo data
npm run seed:postgres

# Seed MongoDB with demo data
npm run seed:mongo

# Seed all databases
npm run seed

# Reset all volumes (careful! deletes data)
npm run docker:reset
```

### Stopping Services

```bash
# Stop all containers
npm run docker:down

# Clean up everything
npm run clean
```

---

## 🔄 Data Flow

### User Registration Flow

```
1. User registers via Client
   └─> POST /auth/register (API Gateway)
       └─> User Service creates user in PostgreSQL
           └─> Publishes "user.registered" event to Kafka
               ├─> Notification Service sends welcome email
               └─> Analytics Service logs registration event
```

### Event Creation & Ticket Sale Flow

```
1. Admin creates event via Client
   └─> POST /events (Event Service)
       └─> Event stored in PostgreSQL
           └─> Publishes "event.created" event to Kafka
               └─> Notification Service sends notification

2. User registers for tickets
   └─> POST /registrations (Ticket Service)
       ├─> Validates ticket availability (Redis cache)
       ├─> Processes payment via Payment Service
       ├─> Generates QR code
       ├─> Stores registration in PostgreSQL
       └─> Publishes "ticket.registered" event to Kafka
           ├─> Notification Service sends confirmation email
           ├─> Analytics Service updates event metrics
           └─> Event Service updates sold ticket count
```

### Real-time Chat Flow

```
1. User joins chat room
   └─> Socket.io connection via API Gateway
       └─> Chat Service validates user access
           └─> Loads message history from MongoDB
               └─> User added to Redis active room set

2. User sends message
   └─> WebSocket message to Chat Service
       ├─> Message stored in MongoDB
       ├─> Broadcasts to active room members via Socket.io
       └─> Publishes "message.sent" event to Kafka
           └─> Notification Service sends unread notification
```

### Analytics Collection Flow

```
1. Any service emits events to Kafka
   └─> Analytics Service consumes events
       ├─> Aggregates data
       ├─> Stores time-series data in MongoDB
       └─> Updates analytics dashboard metrics
```

---

## 📚 API Documentation

### Authentication

All endpoints (except `/auth/register` and `/auth/login`) require a JWT token:

```bash
Authorization: Bearer <jwt_token>
```

### Common Response Format

**Success Response**:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response**:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Error description",
  "details": { ... }
}
```

### Key Endpoints

#### User Service

```
POST   /auth/register              │ Register new user
POST   /auth/login                 │ Login user
GET    /users/:id                  │ Get user profile
PUT    /users/:id                  │ Update user profile
POST   /organizations              │ Create organization
GET    /organizations/:id          │ Get organization details
```

#### Event Service

```
POST   /events                     │ Create event
GET    /events                     │ List events (with pagination)
GET    /events/:id                 │ Get event details
PUT    /events/:id                 │ Update event
DELETE /events/:id                 │ Delete event
POST   /events/:id/categories      │ Add category to event
GET    /events/:id/ticket-tiers    │ Get ticket tier options
```

#### Ticket Service

```
POST   /registrations              │ Create ticket registration
GET    /registrations/:id          │ Get registration details
POST   /registrations/:id/pay      │ Process payment
GET    /registrations/:id/qr-code  │ Get QR code
POST   /registrations/:id/checkin  │ Check-in with QR code
POST   /registrations/:id/cancel   │ Cancel registration
```

#### Chat Service

```
POST   /rooms                      │ Create chat room
GET    /rooms/:id/messages         │ Get message history
POST   /rooms/:id/join             │ Join room (WebSocket)
POST   /messages                   │ Send message (WebSocket)
```

For complete API documentation, check the service-specific README files or generate OpenAPI/Swagger docs.

---

## 🔧 Troubleshooting

### Services Not Starting

```bash
# Check Docker status
docker ps -a

# View service logs
docker logs eventpulse-api-gateway
docker logs eventpulse-event-service

# Restart a specific service
docker restart eventpulse-api-gateway

# Full reset
npm run docker:reset
```

### Database Connection Issues

```bash
# Check PostgreSQL connection
docker exec eventpulse-postgres psql -U eventpulse -d eventpulse -c "SELECT 1"

# Check MongoDB connection
docker exec eventpulse-mongodb mongosh -u eventpulse -p eventpulse_secret --authSource admin --eval "db.adminCommand('ping')"

# Check Redis connection
docker exec eventpulse-redis redis-cli -a eventpulse_secret ping
```

### Kafka Issues

```bash
# List available topics
docker exec eventpulse-kafka kafka-topics --bootstrap-server kafka:9092 --list

# Check Kafka broker status
docker logs eventpulse-kafka | tail -20
```

### Port Already in Use

If ports are already in use, update `docker-compose.yml`:

```yaml
services:
  api-gateway:
    ports:
      - '3010:3000' # Change from 3000 to 3010
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

```bash
# Format code before committing
npm run format

# Run linting
npm run lint
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎓 Learning Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Apache Kafka Overview](https://kafka.apache.org)
- [React Documentation](https://react.dev)
- [TypeORM Documentation](https://typeorm.io)
- [Docker Documentation](https://docs.docker.com)

---
