# Changelog

All notable changes to the **AI Powered Supply Chain & Sales Automation Platform** will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-06-01

### Added

**Executive Dashboard**
- Live KPI cards: Total Revenue, Total Orders, Active Products, Low Stock Alerts
- Cumulative Revenue Overview chart (Area chart with monthly data points)
- Cross-module real-time synchronization via custom event bus
- Revenue formatting in K/M notation for chart readability

**Inventory Management**
- Complete product catalog with CRUD operations
- Stock status indicators: OK, Low, Critical, Out-of-Stock
- Search, filter by category, and multi-criteria sort
- Stats: Total Products, Low Stock Items, Out of Stock count, Total Value
- 120+ seeded demo records with realistic data

**Order Management**
- Full order lifecycle tracking (Pending → Processing → Shipped → Delivered)
- Filter by order status, search by order number/customer, sort by date/amount
- Stats: Total Orders, Pending, Shipped, Delivered counts
- 120+ seeded demo orders with customer and product data

**Procurement Module**
- Purchase order creation linked to supplier catalog
- PO status workflow: Draft → Pending Approval → Approved → Ordered → Delivered
- Filter, search, and ascending/descending sort functionality
- Stats: Total POs, Pending Approval, Monthly Spend, Average Lead Time
- 120+ seeded demo purchase orders

**Shipment Tracking**
- Shipment record management with carrier, route, origin, and destination data
- Status tracking: Pending, In Transit, Delivered, Delayed
- Serial number column for all records

**Supplier Management**
- Full supplier registry (name, contact, category, country, status)
- Active/inactive supplier filtering
- 120+ seeded demo suppliers

**AI Assistant**
- Multi-module contextual AI assistant (Inventory, Orders, Procurement, Shipments, Suppliers, Sales Analytics)
- OpenRouter LLM integration with streaming SSE response rendering
- Suggested prompt chips per module for guided queries
- Markdown response rendering with code block support

**Authentication & Authorization**
- JWT-based login and registration
- Role-Based Access Control (SUPER_ADMIN, ADMIN, MANAGER, VIEWER)
- Protected routes with redirect on unauthenticated access

**Notification System**
- In-app notification center
- Admin broadcast notification panel

**User Profile & Settings**
- Editable user profile (name, email, avatar)
- Dark/light theme toggle
- Application preference controls

---

## [Unreleased]

- Demand forecasting with ML-based stock recommendations
- Supplier performance scorecards
- Email/SMS alerting integrations
- Docker Compose one-command setup
- CI/CD pipeline with GitHub Actions
- Advanced PDF/Excel export reports
