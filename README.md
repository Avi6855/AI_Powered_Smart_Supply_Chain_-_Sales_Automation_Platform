# AI Powered Supply Chain & Sales Automation Platform

<div align="center">

![Platform Banner](https://github.com/Avi6855/AI_Powered_Smart_Supply_Chain_-_Sales_Automation_Platform/blob/main/docs/screenshots/Platform%20Banner.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**An enterprise-grade, full-stack supply chain and sales automation platform with an integrated AI assistant, real-time analytics, and role-based access control.**

[Live Demo](#demo) · [Features](#key-features) · [Architecture](#system-architecture) · [Installation](#installation)

</div>

---

## Overview

The **AI Powered Supply Chain & Sales Automation Platform** is a production-ready enterprise SaaS solution designed to unify and automate the core operational workflows of a modern business — from procurement and inventory management to order fulfillment and supplier relationship management.

The platform delivers a centralized, real-time operational intelligence layer with a contextual AI assistant, dynamic dashboards, and automated alerting — eliminating the silos typical in traditional ERP systems.

---

## Business Problem

Modern supply chain operations suffer from critical inefficiencies:

- **Fragmented data** across procurement, inventory, orders, and logistics systems
- **Reactive decision-making** due to lack of real-time visibility and predictive analytics
- **Manual processes** in supplier management, purchase order workflows, and stock monitoring
- **No unified view** for executives to monitor KPIs and revenue performance across departments
- **Delayed low-stock responses** leading to stockouts and lost revenue

These gaps result in higher operational costs, poor supplier performance, and degraded customer experience.

---

## Solution

This platform consolidates all supply chain and sales workflows into a single, cohesive system:

- **Unified dashboard** with live KPIs: Total Revenue, Active Orders, Low Stock Alerts, Procurement Spend
- **Real-time synchronization** — any change in any module is immediately reflected across the entire platform
- **Contextual AI assistant** that answers operational queries from live data in each module
- **Automated stock monitoring** with threshold-based low-stock and out-of-stock alerting
- **End-to-end procurement lifecycle** from purchase order creation to supplier delivery tracking
- **Role-based access control** to enforce data governance across teams

---

## Key Features

### 📊 Executive Dashboard
- Cumulative revenue tracking with interactive area chart (Revenue Overview)
- Live KPI cards: Total Revenue, Total Orders, Active Products, Low Stock Alerts
- Instant cross-module data synchronization via event-driven state management

### 📦 Inventory Management
- Full product catalog with SKU, category, stock level, and pricing
- Real-time stock status indicators: OK, Low, Critical, Out-of-Stock
- Add, edit, delete products with instant UI updates
- Stats cards: Total Products, Low Stock Items, Out of Stock, Total Value

### 🛒 Order Management
- Complete order lifecycle tracking from placement to delivery
- Filter by status (Pending, Processing, Shipped, Delivered, Cancelled)
- Search and multi-criteria sorting
- Stats cards: Total Orders, Pending, Shipped, Delivered

### 🏭 Procurement
- Purchase order creation and full lifecycle management
- Supplier-linked PO workflow with approval stages
- Stats: Total POs, Pending Approval, This Month's Spend, Avg Lead Time
- Ascending/descending sort with status and search filters

### 🚚 Shipment Tracking
- End-to-end shipment monitoring with carrier and route details
- Status tracking: In Transit, Delivered, Pending, Delayed
- Origin and destination route visualization

### 🤝 Supplier Management
- Full supplier registry with contact, category, and performance data
- Active/inactive supplier tracking

### 🤖 AI Assistant (Multi-Module)
- Context-aware LLM integration via OpenRouter API
- Per-module AI scoping: Inventory AI, Orders AI, Procurement AI, Shipments AI, Suppliers AI, Sales Analytics AI
- Streaming response rendering with Markdown support
- Suggested prompts for quick operational queries

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh token rotation
- Role-Based Access Control (RBAC): SUPER_ADMIN, ADMIN, MANAGER, VIEWER
- Protected routes with middleware-level enforcement

### 🔔 Notification System
- In-app notification center for operational alerts
- Admin broadcast notification panel

### 👤 User Management
- Profile management with editable user details
- Settings panel with theme and preference controls

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Next.js 15 Frontend (App Router)          │  │
│  │                                                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │  │
│  │  │Dashboard │  │ Modules  │  │  AI Assistant Panel  │ │  │
│  │  │ (Charts) │  │ CRUD UI  │  │ (Streaming LLM Chat) │ │  │
│  │  └──────────┘  └──────────┘  └──────────────────────┘ │  │
│  │                                                        │  │
│  │  Zustand State ── Event Bus ── LocalStorage Cache     │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                           │  REST API / WebSocket
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                   Spring Boot 3.2 Backend                    │
│                                                              │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Auth &  │  │ Business  │  │  AI/LLM  │  │ WebSocket │  │
│  │  JWT     │  │  Services │  │  Layer   │  │  (STOMP)  │  │
│  └──────────┘  └───────────┘  └──────────┘  └───────────┘  │
│                       │                                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │            Spring Data JPA + Flyway Migrations         │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┴─────────────────┐
          ▼                                   ▼
┌──────────────────┐               ┌──────────────────┐
│   PostgreSQL 16  │               │   Redis Cache     │
│   (Primary DB)   │               │  (Sessions/Cache) │
└──────────────────┘               └──────────────────┘
```

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15.x | React framework with App Router |
| TypeScript | 5.6 | Type-safe development |
| Tailwind CSS | 3.x | Utility-first styling |
| Zustand | 5.x | Lightweight global state management |
| Recharts | 2.x | Data visualization & charting |
| Radix UI | Latest | Accessible headless UI primitives |
| Framer Motion | 11.x | Animations & transitions |
| React Hook Form + Zod | Latest | Form management & validation |
| React Markdown | 9.x | Markdown rendering for AI responses |
| Axios | 1.7 | HTTP client |
| Socket.IO Client | 4.x | Real-time WebSocket communication |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Spring Boot | 3.2.5 | Core application framework |
| Spring Security | 6.x | Authentication & authorization |
| Spring Data JPA | 3.x | Database ORM layer |
| Spring WebSocket | 3.x | Real-time bi-directional communication |
| Spring Webflux | 3.x | Reactive streaming support |
| Flyway | 9.x | Database schema migration |
| JJWT | 0.12.5 | JWT generation & validation |
| MapStruct | 1.5.5 | DTO mapping |
| Lombok | 1.18.30 | Boilerplate reduction |
| LangChain4j | 0.27.1 | LLM integration framework |
| Apache POI | 5.2.5 | Excel report generation |
| iText PDF | 5.5 | PDF report generation |
| SpringDoc OpenAPI | 2.3.0 | API documentation (Swagger UI) |

### Database & Infrastructure
| Technology | Purpose |
|---|---|
| PostgreSQL 16 | Primary relational database |
| Redis | Session store & caching layer |
| Maven | Backend build tool |

### AI / ML
| Technology | Purpose |
|---|---|
| OpenRouter API | LLM gateway (multi-model support) |
| LangChain4j | AI chain orchestration on backend |
| Streaming SSE | Token-by-token response streaming |

---

## Screenshots

### Executive Dashboard
![Dashboard](https://github.com/Avi6855/AI_Powered_Smart_Supply_Chain_-_Sales_Automation_Platform/blob/main/docs/screenshots/Dashboard.png)

### Inventory Management
![Inventory](https://github.com/Avi6855/AI_Powered_Smart_Supply_Chain_-_Sales_Automation_Platform/blob/main/docs/screenshots/Inventory.png)
![Inventory AI](https://github.com/Avi6855/AI_Powered_Smart_Supply_Chain_-_Sales_Automation_Platform/blob/main/docs/screenshots/Inventory%20AI.png)

### Order Management
![Orders](https://github.com/Avi6855/AI_Powered_Smart_Supply_Chain_-_Sales_Automation_Platform/blob/main/docs/screenshots/Orders.png)
![Orders AI](https://github.com/Avi6855/AI_Powered_Smart_Supply_Chain_-_Sales_Automation_Platform/blob/main/docs/screenshots/Orders%20AI.png)

### Procurement Module
![Procurement](https://github.com/Avi6855/AI_Powered_Smart_Supply_Chain_-_Sales_Automation_Platform/blob/main/docs/screenshots/Procurement.png)
![Procurement AI](https://github.com/Avi6855/AI_Powered_Smart_Supply_Chain_-_Sales_Automation_Platform/blob/main/docs/screenshots/Procurement%20AI.png)

### Shipment Tracking
![Shipments](https://github.com/Avi6855/AI_Powered_Smart_Supply_Chain_-_Sales_Automation_Platform/blob/main/docs/screenshots/Shipments.png)
![Shipments AI](https://github.com/Avi6855/AI_Powered_Smart_Supply_Chain_-_Sales_Automation_Platform/blob/main/docs/screenshots/Shipments%20AI.png)

### Supplier Management
![Suppliers](https://github.com/Avi6855/AI_Powered_Smart_Supply_Chain_-_Sales_Automation_Platform/blob/main/docs/screenshots/Suppliers.png)
![Suppliers AI](https://github.com/Avi6855/AI_Powered_Smart_Supply_Chain_-_Sales_Automation_Platform/blob/main/docs/screenshots/Suppliers%20AI.png)

### AI Assistant
![AI Assistant](https://github.com/Avi6855/AI_Powered_Smart_Supply_Chain_-_Sales_Automation_Platform/blob/main/docs/screenshots/AI%20Assistant.png)

---

## Demo

> 🎬 [Watch Demo Video]([https://drive.google.com/drive/folders/1QDxsgCullo4JfTZ1UUlYxrmA36kTB0v_](https://drive.google.com/file/d/1Rkp8Paw7m7CDXwFZ_HoS34bSGLasAoVS/view?usp=sharing))

---

## Installation

### Prerequisites

Ensure the following are installed on your machine:

- **Node.js** ≥ 18.x (`node -v`)
- **Java** 17 LTS (`java -version`)
- **Maven** ≥ 3.8 (`mvn -v`)
- **PostgreSQL** 15/16 (running)
- **Redis** ≥ 7.x (running)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Avi6855/AI_Powered_Smart_Supply_Chain_-_Sales_Automation_Platform.git
cd AI_Powered_Smart_Supply_Chain_-_Sales_Automation_Platform
```

---

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

Edit `.env.local` and fill in the required values (see [Configuration](#configuration)).

```bash
npm run dev
```

The frontend will be available at **http://localhost:3000**

---

### 3. Backend Setup

```bash
cd backend
```

Create your PostgreSQL database:

```sql
CREATE DATABASE supply_chain_db;
CREATE USER supply_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE supply_chain_db TO supply_user;
```

Configure `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/supply_chain_db
    username: supply_user
    password: your_password
  redis:
    host: localhost
    port: 6379
```

Build and run:

```bash
mvn clean install -DskipTests
mvn spring-boot:run
```

The backend API will be available at **http://localhost:8080**  
Swagger UI: **http://localhost:8080/swagger-ui.html**

---

## Configuration

### Frontend Environment Variables

Create `frontend/.env.local` from the provided `.env.example`:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080/api/ws

# Application
NEXT_PUBLIC_APP_NAME=Supply Chain Platform
NEXT_PUBLIC_APP_VERSION=1.0.0

# AI Integration (OpenRouter)
OPENROUTER_API_KEY=your-openrouter-api-key-here
```

> ⚠️ **Never commit `.env.local` or any file containing real API keys.**

Get your OpenRouter API key at: https://openrouter.ai/keys

---

## Running the Application

```bash
# Start Redis (if not running as a service)
redis-server

# Terminal 1 — Backend
cd backend && mvn spring-boot:run

# Terminal 2 — Frontend
cd frontend && npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Redis | localhost:6379 |

---

## API Documentation

The backend exposes a RESTful API documented via **SpringDoc OpenAPI (Swagger)**.

### Core Endpoints

| Module | Method | Endpoint | Description |
|---|---|---|---|
| Auth | POST | `/api/auth/login` | User login, returns JWT |
| Auth | POST | `/api/auth/signup` | New user registration |
| Auth | POST | `/api/auth/refresh` | Refresh access token |
| Products | GET | `/api/products` | List all products (paginated) |
| Products | POST | `/api/products` | Create a new product |
| Products | PUT | `/api/products/{id}` | Update product |
| Products | DELETE | `/api/products/{id}` | Delete product |
| Orders | GET | `/api/orders` | List all orders |
| Orders | POST | `/api/orders` | Create order |
| Orders | PATCH | `/api/orders/{id}/status` | Update order status |
| Procurement | GET | `/api/purchase-orders` | List purchase orders |
| Procurement | POST | `/api/purchase-orders` | Create purchase order |
| Shipments | GET | `/api/shipments` | List shipments |
| Suppliers | GET | `/api/suppliers` | List suppliers |
| AI Chat | POST | `/api/ai/scoped-chat` | Streamed AI query (SSE) |
| AI Insights | GET | `/api/ai/dashboard-insights` | Dashboard AI insights |

Full interactive documentation available at: `http://localhost:8080/swagger-ui.html`

---

## Project Structure

```
AI-Powered-Supply-Chain-Sales-Automation/
│
├── frontend/                          # Next.js 15 Application
│   ├── src/
│   │   ├── app/                       # App Router pages
│   │   │   ├── page.tsx               # Executive Dashboard
│   │   │   ├── inventory/             # Inventory management
│   │   │   ├── orders/                # Order management
│   │   │   ├── procurement/           # Purchase order management
│   │   │   ├── shipments/             # Shipment tracking
│   │   │   ├── suppliers/             # Supplier management
│   │   │   ├── ai-chat/               # Multi-module AI assistant
│   │   │   ├── login/                 # Authentication
│   │   │   ├── signup/                # Registration
│   │   │   ├── profile/               # User profile
│   │   │   ├── settings/              # App settings
│   │   │   ├── notifications/         # Notification center
│   │   │   ├── admin/                 # Admin panel
│   │   │   └── api/                   # Next.js API routes (AI proxy)
│   │   ├── components/
│   │   │   ├── ai/                    # AI assistant components
│   │   │   ├── layout/                # App shell, sidebar, nav
│   │   │   ├── dashboard/             # Dashboard-specific widgets
│   │   │   └── ui/                    # Shared UI primitives
│   │   ├── lib/
│   │   │   ├── api.ts                 # API client layer
│   │   │   ├── dummyData.ts           # Seeded demo data engine
│   │   │   └── utils.ts               # Shared utilities
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── store/                     # Zustand state stores
│   │   └── types/                     # TypeScript interfaces
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/                           # Spring Boot Application
│   ├── src/main/java/com/supplychain/
│   │   ├── auth/                      # JWT auth, user management
│   │   ├── inventory/                 # Product & stock service
│   │   ├── orders/                    # Order processing service
│   │   ├── procurement/               # PO management service
│   │   ├── shipments/                 # Shipment tracking service
│   │   ├── suppliers/                 # Supplier management service
│   │   ├── ai/                        # LLM integration layer
│   │   ├── notifications/             # Notification service
│   │   └── config/                    # Security, CORS, WebSocket config
│   ├── src/main/resources/
│   │   ├── application.yml            # Application configuration
│   │   └── db/migration/              # Flyway SQL migrations
│   └── pom.xml
│
├── docs/
│   └── screenshots/                   # Application screenshots
│
├── .gitignore
├── .env.example                       # Environment variable template
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## Security Considerations

- **JWT Authentication** with short-lived access tokens (15 minutes) and refresh token rotation
- **RBAC enforcement** at both API endpoint level (Spring Security) and UI route level
- **CORS policy** restricts API access to allowed frontend origins
- **Environment secrets** are never committed — managed via `.env.local` (gitignored)
- **Input validation** via Zod (frontend) and Spring Validation (backend) on all user inputs
- **SQL injection prevention** via JPA parameterized queries

---

## Scalability

The platform is architected to scale horizontally:

- **Stateless backend** — JWT auth removes server-side session dependency, enabling multi-instance deployment
- **Redis caching** reduces database load for frequently accessed data
- **Reactive WebSocket support** via Spring Webflux for high-concurrency real-time events
- **Frontend ISR** — Next.js Incremental Static Regeneration for performance at scale
- **Pagination** on all list endpoints prevents unbounded data loading

---

## Future Enhancements

- [ ] **Demand Forecasting** — ML-based stock replenishment recommendations
- [ ] **Supplier Scorecards** — Automated performance scoring based on delivery SLAs
- [ ] **Email & SMS Alerts** — Integration with SendGrid/Twilio for critical stock events
- [ ] **Mobile Application** — React Native companion app
- [ ] **Multi-Warehouse Support** — Location-aware inventory management
- [ ] **ERP Integrations** — SAP / Oracle / Tally data sync connectors
- [ ] **Audit Log** — Immutable change history across all modules
- [ ] **Advanced Reporting** — Exportable Excel/PDF reports with scheduling
- [ ] **CI/CD Pipeline** — GitHub Actions workflow for automated testing and deployment
- [ ] **Docker Compose** — One-command local environment setup

---

## Author

**Avinash Patil**

- GitHub: [@Avi6855](https://github.com/Avi6855)
- LinkedIn: [https://www.linkedin.com/in/avinash-patil-278011228/]

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

⭐ If you find this project useful, please consider giving it a star!

</div>
