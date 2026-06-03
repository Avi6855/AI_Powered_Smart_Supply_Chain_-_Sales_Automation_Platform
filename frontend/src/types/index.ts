// ============================================================
// SUPPLY CHAIN PLATFORM – TypeScript Type Definitions
// ============================================================

// ── Roles ────────────────────────────────────────────────────────────────────
export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'SALES_MANAGER'
  | 'WAREHOUSE_MANAGER'
  | 'ANALYST';

// ── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id:          number;
  username:    string;
  email:       string;
  firstName:   string;
  lastName:    string;
  role:        Role;
  isActive:    boolean;
  avatarUrl?:  string;
  phone?:      string;
  department?: string;
  lastLogin?:  string;
  createdAt:   string;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface AuthResponse {
  token:        string;
  refreshToken: string;
  user:         User;
}

export interface LoginRequest {
  email:    string;
  password: string;
}

export interface SignupRequest {
  firstName:   string;
  lastName:    string;
  email:       string;
  password:    string;
  confirmPassword: string;
  role:        Role;
  phone?:      string;
  department?: string;
}

// ── Category ──────────────────────────────────────────────────────────────────
export interface Category {
  id:           number;
  name:         string;
  description?: string;
  productCount: number;
  createdAt:    string;
}

// ── Supplier ──────────────────────────────────────────────────────────────────
export interface Supplier {
  id:               number;
  name:             string;
  email:            string;
  phone:            string;
  address:          string;
  city:             string;
  country:          string;
  contactPerson:    string;
  website?:         string;
  taxId?:           string;
  paymentTerms?:    string;
  leadTimeDays:     number;
  rating:           number;
  isActive:         boolean;
  notes?:           string;
  contractExpiry?:  string;
  deliveryRate:     number;
  qualityScore:     number;
  responseTime:     number;
  totalOrders:      number;
  createdAt:        string;
  updatedAt:        string;
}

// ── Warehouse ─────────────────────────────────────────────────────────────────
export interface Warehouse {
  id:             number;
  name:           string;
  code:           string;
  address:        string;
  city:           string;
  country:        string;
  managerName:    string;
  managerEmail:   string;
  phone:          string;
  totalCapacity:  number;
  usedCapacity:   number;
  occupancyRate:  number;
  isActive:       boolean;
  latitude?:      number;
  longitude?:     number;
  notes?:         string;
  createdAt:      string;
  updatedAt:      string;
}

// ── Product / Inventory Item ──────────────────────────────────────────────────
export interface Product {
  id:                  number;
  name:                string;
  sku:                 string;
  barcode?:            string;
  categoryId:          number;
  categoryName:        string;
  supplierId:          number;
  supplierName:        string;
  warehouseId:         number;
  warehouseName:       string;
  description?:        string;
  unitPrice:           number;
  costPrice?:          number;
  quantityInStock:     number;
  minimumStockLevel:   number;
  reorderPoint:        number;
  reorderQuantity:     number;
  unitOfMeasure:       string;
  weight?:             number;
  dimensions?:         string;
  imageUrl?:           string;
  isActive:            boolean;
  tags?:               string[];
  aiDemandForecast?:   number;
  aiReorderSuggestion: boolean;
  location?:           string;
  expiryDate?:         string;
  createdAt:           string;
  updatedAt:           string;
}

// ── Customer ──────────────────────────────────────────────────────────────────
export interface Customer {
  id:           number;
  name:         string;
  email:        string;
  phone:        string;
  company?:     string;
  address:      string;
  city:         string;
  country:      string;
  segment:      'VIP' | 'REGULAR' | 'NEW' | 'CHURNED';
  totalOrders:  number;
  totalSpent:   number;
  lastOrderDate?:string;
  isActive:     boolean;
  notes?:       string;
  createdAt:    string;
}

// ── Order Item ────────────────────────────────────────────────────────────────
export interface OrderItem {
  id:          number;
  productId:   number;
  productName: string;
  sku:         string;
  quantity:    number;
  unitPrice:   number;
  discount:    number;
  total:       number;
}

// ── Order ─────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export interface Order {
  id:               number;
  orderNumber:      string;
  customerId:       number;
  customerName:     string;
  customerEmail:    string;
  status:           OrderStatus;
  items:            OrderItem[];
  subtotal:         number;
  taxAmount:        number;
  shippingCost:     number;
  discountAmount:   number;
  totalAmount:      number;
  shippingAddress:  string;
  billingAddress:   string;
  paymentMethod:    string;
  paymentStatus:    'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  notes?:           string;
  estimatedDelivery?:string;
  actualDelivery?:  string;
  createdAt:        string;
  updatedAt:        string;
}

// ── Shipment ──────────────────────────────────────────────────────────────────
export type ShipmentStatus =
  | 'PREPARING'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELAYED'
  | 'RETURNED'
  | 'CANCELLED';

export interface Shipment {
  id:               number;
  shipmentNumber:   string;
  orderId:          number;
  orderNumber:      string;
  warehouseId:      number;
  warehouseName:    string;
  carrier:          string;
  trackingNumber:   string;
  status:           ShipmentStatus;
  estimatedDelivery:string;
  actualDelivery?:  string;
  origin:           string;
  destination:      string;
  weight:           number;
  cost:             number;
  notes?:           string;
  createdAt:        string;
  updatedAt:        string;
}

// ── Purchase Order ────────────────────────────────────────────────────────────
export interface PurchaseOrderItem {
  productId:   number;
  productName: string;
  quantity:    number;
  unitCost:    number;
  total:       number;
}

export interface PurchaseOrder {
  id:             number;
  poNumber:       string;
  supplierId:     number;
  supplierName:   string;
  warehouseId:    number;
  warehouseName:  string;
  status:         'DRAFT' | 'PENDING' | 'APPROVED' | 'RECEIVED' | 'CANCELLED' | 'REJECTED';
  items:          PurchaseOrderItem[];
  totalAmount:    number;
  expectedDate:   string;
  receivedDate?:  string;
  notes?:         string;
  approvedBy?:    string;
  rejectedReason?:string;
  createdAt:      string;
  updatedAt:      string;
}

// ── Notification ──────────────────────────────────────────────────────────────
export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | 'ALERT';

export interface Notification {
  id:         number;
  type:       NotificationType;
  title:      string;
  message:    string;
  isRead:     boolean;
  link?:      string;
  metadata?:  Record<string, unknown>;
  createdAt:  string;
}

// ── AI Types ──────────────────────────────────────────────────────────────────
export interface AiMessage {
  id:        string;
  role:      'user' | 'assistant' | 'system';
  content:   string;
  createdAt: string;
  isStreaming?:boolean;
}

export interface AiConversation {
  id:        number;
  title:     string;
  messages:  AiMessage[];
  model:     string;
  createdAt: string;
  updatedAt: string;
}

export interface AiInsight {
  id:          string;
  type:        'demand' | 'reorder' | 'cost' | 'supplier' | 'revenue' | 'risk';
  priority:    'HIGH' | 'MEDIUM' | 'LOW';
  title:       string;
  description: string;
  impact?:     string;
  action?:     string;
  confidence:  number;
  createdAt:   string;
}

export interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  model:    string;
}

// ── Analytics / Dashboard ─────────────────────────────────────────────────────
export interface DashboardStats {
  totalRevenue:        number;
  revenueChange:       number;
  totalOrders:         number;
  ordersChange:        number;
  inventoryValue:      number;
  inventoryChange:     number;
  totalSuppliers:      number;
  suppliersChange:     number;
  activeShipments:     number;
  shipmentsChange:     number;
  lowStockItems:       number;
  outOfStockItems:     number;
  aiInsightsCount:     number;
  pendingOrders:       number;
}

export interface RevenueDataPoint {
  date:     string;
  revenue:  number;
  orders:   number;
  profit:   number;
}

export interface SalesDataPoint {
  name:   string;
  sales:  number;
  target: number;
  growth: number;
}

export interface ChartData {
  name:  string;
  value: number;
  color?: string;
}

export interface SupplierPerformance {
  supplierId:   number;
  supplierName: string;
  deliveryRate: number;
  qualityScore: number;
  responseTime: number;
  costEfficiency:number;
  overall:      number;
}

// ── Pagination ────────────────────────────────────────────────────────────────
export interface PagedResponse<T> {
  content:       T[];
  totalElements: number;
  totalPages:    number;
  size:          number;
  number:        number;
  first:         boolean;
  last:          boolean;
  empty:         boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data:    T;
  message: string;
  errors?: string[];
}

// ── Filter / Sort Params ──────────────────────────────────────────────────────
export interface PaginationParams {
  page:    number;
  size:    number;
  sortBy?: string;
  sortDir?:'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  search?: string;
}

// ── Report ────────────────────────────────────────────────────────────────────
export type ReportType =
  | 'INVENTORY_SUMMARY'
  | 'SALES_REPORT'
  | 'SUPPLIER_PERFORMANCE'
  | 'ORDER_HISTORY'
  | 'FINANCIAL_SUMMARY'
  | 'DEMAND_FORECAST';

export interface Report {
  id:          number;
  name:        string;
  type:        ReportType;
  status:      'GENERATING' | 'READY' | 'FAILED';
  fileUrl?:    string;
  fileSize?:   number;
  generatedAt: string;
  parameters?: Record<string, unknown>;
}

// ── Alert ─────────────────────────────────────────────────────────────────────
export interface Alert {
  id:       string;
  type:     'LOW_STOCK' | 'OUT_OF_STOCK' | 'DELAYED_SHIPMENT' | 'REORDER_NEEDED' | 'AI_ALERT';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title:    string;
  message:  string;
  link?:    string;
  createdAt:string;
}

// ── Settings ──────────────────────────────────────────────────────────────────
export interface UserSettings {
  emailNotifications:  boolean;
  pushNotifications:   boolean;
  lowStockAlerts:      boolean;
  orderAlerts:         boolean;
  shipmentAlerts:      boolean;
  aiInsightAlerts:     boolean;
  theme:               'dark' | 'light' | 'system';
  language:            string;
  timezone:            string;
  dateFormat:          string;
  currency:            string;
}

// ── WebSocket Message ─────────────────────────────────────────────────────────
export interface WsMessage<T = unknown> {
  type:    string;
  payload: T;
  timestamp: string;
}

// ── Audit Log ─────────────────────────────────────────────────────────────────
export interface AuditLog {
  id:         number;
  userId:     number;
  userName:   string;
  action:     string;
  resource:   string;
  resourceId: number;
  details?:   string;
  ipAddress:  string;
  createdAt:  string;
}

// ── Inventory Adjustment ──────────────────────────────────────────────────────
export interface StockAdjustment {
  id:          number;
  productId:   number;
  productName: string;
  previousQty: number;
  newQty:      number;
  adjustment:  number;
  reason:      string;
  adjustedBy:  string;
  createdAt:   string;
}
