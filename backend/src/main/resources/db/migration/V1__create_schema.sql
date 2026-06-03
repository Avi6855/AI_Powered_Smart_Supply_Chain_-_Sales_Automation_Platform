-- =============================================================================
-- V1__create_schema.sql
-- Initial database schema for AI-Powered Smart Supply Chain & Sales Platform
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- USERS & AUTHENTICATION
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE users (
    id             BIGSERIAL PRIMARY KEY,
    username       VARCHAR(50)  UNIQUE NOT NULL,
    email          VARCHAR(100) UNIQUE NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    first_name     VARCHAR(50)  NOT NULL,
    last_name      VARCHAR(50)  NOT NULL,
    role           VARCHAR(30)  NOT NULL DEFAULT 'ANALYST',
    is_active      BOOLEAN      DEFAULT TRUE,
    avatar_url     VARCHAR(500),
    phone          VARCHAR(20),
    department     VARCHAR(100),
    last_login     TIMESTAMP,
    created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id         BIGSERIAL PRIMARY KEY,
    token      VARCHAR(500) UNIQUE NOT NULL,
    user_id    BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP    NOT NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE categories (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color       VARCHAR(7)  DEFAULT '#6366f1',
    icon        VARCHAR(50),
    created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SUPPLIERS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE suppliers (
    id                     BIGSERIAL PRIMARY KEY,
    name                   VARCHAR(200) NOT NULL,
    code                   VARCHAR(50)  UNIQUE NOT NULL,
    email                  VARCHAR(100),
    phone                  VARCHAR(30),
    address                TEXT,
    city                   VARCHAR(100),
    country                VARCHAR(100),
    rating                 DECIMAL(3,2)  DEFAULT 0.0,
    performance_score      DECIMAL(5,2)  DEFAULT 0.0,
    total_orders           INTEGER       DEFAULT 0,
    on_time_delivery_rate  DECIMAL(5,2)  DEFAULT 0.0,
    quality_score          DECIMAL(5,2)  DEFAULT 0.0,
    response_time_hours    INTEGER       DEFAULT 24,
    status                 VARCHAR(20)   DEFAULT 'ACTIVE',
    contract_start         DATE,
    contract_end           DATE,
    payment_terms          VARCHAR(100),
    currency               VARCHAR(10)   DEFAULT 'USD',
    notes                  TEXT,
    website                VARCHAR(500),
    created_at             TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- WAREHOUSES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE warehouses (
    id                BIGSERIAL PRIMARY KEY,
    name              VARCHAR(200) NOT NULL,
    code              VARCHAR(50)  UNIQUE NOT NULL,
    address           TEXT         NOT NULL,
    city              VARCHAR(100) NOT NULL,
    country           VARCHAR(100) NOT NULL,
    capacity          INTEGER      NOT NULL,
    current_occupancy INTEGER      DEFAULT 0,
    manager_name      VARCHAR(100),
    manager_email     VARCHAR(100),
    phone             VARCHAR(30),
    status            VARCHAR(20)  DEFAULT 'ACTIVE',
    latitude          DECIMAL(10,8),
    longitude         DECIMAL(11,8),
    type              VARCHAR(50)  DEFAULT 'GENERAL',
    created_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE products (
    id                    BIGSERIAL PRIMARY KEY,
    name                  VARCHAR(300) NOT NULL,
    sku                   VARCHAR(100) UNIQUE NOT NULL,
    barcode               VARCHAR(100) UNIQUE,
    category_id           BIGINT   REFERENCES categories(id),
    supplier_id           BIGINT   REFERENCES suppliers(id),
    warehouse_id          BIGINT   REFERENCES warehouses(id),
    description           TEXT,
    unit_price            DECIMAL(12,2) NOT NULL,
    cost_price            DECIMAL(12,2),
    quantity_in_stock     INTEGER       DEFAULT 0,
    minimum_stock_level   INTEGER       DEFAULT 10,
    reorder_point         INTEGER       DEFAULT 20,
    reorder_quantity      INTEGER       DEFAULT 100,
    unit_of_measure       VARCHAR(30)   DEFAULT 'UNIT',
    weight                DECIMAL(8,3),
    dimensions            VARCHAR(100),
    image_url             VARCHAR(500),
    is_active             BOOLEAN       DEFAULT TRUE,
    tags                  TEXT[],
    ai_demand_forecast    INTEGER,
    ai_reorder_suggestion BOOLEAN       DEFAULT FALSE,
    created_at            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CUSTOMERS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE customers (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(200) NOT NULL,
    email               VARCHAR(100),
    phone               VARCHAR(30),
    address             TEXT,
    city                VARCHAR(100),
    country             VARCHAR(100),
    customer_type       VARCHAR(30)   DEFAULT 'RETAIL',
    credit_limit        DECIMAL(12,2) DEFAULT 10000.00,
    outstanding_balance DECIMAL(12,2) DEFAULT 0.00,
    loyalty_points      INTEGER       DEFAULT 0,
    total_orders        INTEGER       DEFAULT 0,
    total_spent         DECIMAL(14,2) DEFAULT 0.00,
    status              VARCHAR(20)   DEFAULT 'ACTIVE',
    created_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE orders (
    id               BIGSERIAL PRIMARY KEY,
    order_number     VARCHAR(50)   UNIQUE NOT NULL,
    customer_id      BIGINT        REFERENCES customers(id),
    user_id          BIGINT        REFERENCES users(id),
    status           VARCHAR(30)   DEFAULT 'PENDING',
    order_type       VARCHAR(20)   DEFAULT 'SALES',
    total_amount     DECIMAL(14,2) NOT NULL,
    discount_amount  DECIMAL(12,2) DEFAULT 0.00,
    tax_amount       DECIMAL(12,2) DEFAULT 0.00,
    shipping_amount  DECIMAL(10,2) DEFAULT 0.00,
    payment_status   VARCHAR(20)   DEFAULT 'PENDING',
    payment_method   VARCHAR(50),
    shipping_address TEXT,
    notes            TEXT,
    expected_delivery DATE,
    actual_delivery   DATE,
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id               BIGSERIAL PRIMARY KEY,
    order_id         BIGINT        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id       BIGINT        NOT NULL REFERENCES products(id),
    quantity         INTEGER       NOT NULL,
    unit_price       DECIMAL(12,2) NOT NULL,
    discount_percent DECIMAL(5,2)  DEFAULT 0.00,
    total_price      DECIMAL(12,2) NOT NULL,
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SHIPMENTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE shipments (
    id                   BIGSERIAL PRIMARY KEY,
    tracking_number      VARCHAR(100)  UNIQUE NOT NULL,
    order_id             BIGINT        REFERENCES orders(id),
    carrier              VARCHAR(100),
    status               VARCHAR(30)   DEFAULT 'PENDING',
    origin_address       TEXT,
    destination_address  TEXT,
    weight               DECIMAL(8,3),
    dimensions           VARCHAR(100),
    shipping_cost        DECIMAL(10,2),
    estimated_delivery   DATE,
    actual_delivery      TIMESTAMP,
    current_location     VARCHAR(300),
    notes                TEXT,
    created_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shipment_events (
    id           BIGSERIAL PRIMARY KEY,
    shipment_id  BIGINT      NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    status       VARCHAR(30) NOT NULL,
    location     VARCHAR(300),
    description  TEXT,
    event_time   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- PROCUREMENT
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE purchase_orders (
    id                BIGSERIAL PRIMARY KEY,
    po_number         VARCHAR(50)   UNIQUE NOT NULL,
    supplier_id       BIGINT        NOT NULL REFERENCES suppliers(id),
    status            VARCHAR(30)   DEFAULT 'DRAFT',
    total_amount      DECIMAL(14,2) NOT NULL,
    currency          VARCHAR(10)   DEFAULT 'USD',
    expected_delivery DATE,
    actual_delivery   DATE,
    payment_terms     VARCHAR(100),
    notes             TEXT,
    created_by        BIGINT        REFERENCES users(id),
    approved_by       BIGINT        REFERENCES users(id),
    created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_order_items (
    id                BIGSERIAL PRIMARY KEY,
    po_id             BIGINT        NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id        BIGINT        NOT NULL REFERENCES products(id),
    quantity          INTEGER       NOT NULL,
    unit_price        DECIMAL(12,2) NOT NULL,
    total_price       DECIMAL(12,2) NOT NULL,
    received_quantity INTEGER       DEFAULT 0
);

-- ─────────────────────────────────────────────────────────────────────────────
-- INVENTORY TRANSACTIONS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE inventory_transactions (
    id               BIGSERIAL PRIMARY KEY,
    product_id       BIGINT      NOT NULL REFERENCES products(id),
    warehouse_id     BIGINT      REFERENCES warehouses(id),
    transaction_type VARCHAR(30) NOT NULL,
    quantity_change  INTEGER     NOT NULL,
    quantity_before  INTEGER     NOT NULL,
    quantity_after   INTEGER     NOT NULL,
    reference_type   VARCHAR(30),
    reference_id     BIGINT,
    notes            TEXT,
    performed_by     BIGINT      REFERENCES users(id),
    created_at       TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE notifications (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT      REFERENCES users(id),
    title      VARCHAR(200) NOT NULL,
    message    TEXT         NOT NULL,
    type       VARCHAR(30)  DEFAULT 'INFO',
    is_read    BOOLEAN      DEFAULT FALSE,
    action_url VARCHAR(500),
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- AI CONVERSATIONS & MESSAGES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE ai_conversations (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT       NOT NULL REFERENCES users(id),
    title      VARCHAR(200),
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_messages (
    id              BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT      NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL,
    content         TEXT        NOT NULL,
    tokens_used     INTEGER,
    model_used      VARCHAR(100),
    created_at      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- ANALYTICS SNAPSHOTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE analytics_snapshots (
    id                   BIGSERIAL PRIMARY KEY,
    snapshot_date        DATE          NOT NULL,
    total_revenue        DECIMAL(16,2),
    total_orders         INTEGER,
    total_products_sold  INTEGER,
    new_customers        INTEGER,
    avg_order_value      DECIMAL(12,2),
    top_category         VARCHAR(100),
    inventory_value      DECIMAL(16,2),
    created_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SALES FORECASTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE sales_forecasts (
    id               BIGSERIAL PRIMARY KEY,
    product_id       BIGINT        REFERENCES products(id),
    forecast_date    DATE          NOT NULL,
    predicted_demand INTEGER,
    confidence_score DECIMAL(5,2),
    actual_demand    INTEGER,
    model_used       VARCHAR(100),
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX idx_products_sku          ON products(sku);
CREATE INDEX idx_products_category     ON products(category_id);
CREATE INDEX idx_products_supplier     ON products(supplier_id);
CREATE INDEX idx_products_warehouse    ON products(warehouse_id);
CREATE INDEX idx_products_active       ON products(is_active);
CREATE INDEX idx_orders_customer       ON orders(customer_id);
CREATE INDEX idx_orders_status         ON orders(status);
CREATE INDEX idx_orders_created        ON orders(created_at);
CREATE INDEX idx_orders_user           ON orders(user_id);
CREATE INDEX idx_order_items_order     ON order_items(order_id);
CREATE INDEX idx_inventory_product     ON inventory_transactions(product_id);
CREATE INDEX idx_inventory_warehouse   ON inventory_transactions(warehouse_id);
CREATE INDEX idx_inventory_created     ON inventory_transactions(created_at);
CREATE INDEX idx_notifications_user    ON notifications(user_id, is_read);
CREATE INDEX idx_shipments_tracking    ON shipments(tracking_number);
CREATE INDEX idx_shipments_order       ON shipments(order_id);
CREATE INDEX idx_shipments_status      ON shipments(status);
CREATE INDEX idx_ai_messages_conv      ON ai_messages(conversation_id);
CREATE INDEX idx_ai_conv_user          ON ai_conversations(user_id);
CREATE INDEX idx_po_supplier           ON purchase_orders(supplier_id);
CREATE INDEX idx_po_status             ON purchase_orders(status);
CREATE INDEX idx_snapshots_date        ON analytics_snapshots(snapshot_date);
CREATE INDEX idx_forecasts_product     ON sales_forecasts(product_id, forecast_date);
CREATE INDEX idx_refresh_tokens_user   ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token  ON refresh_tokens(token);
