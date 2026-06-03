type SeededRandom = () => number;

function mulberry32(seed: number): SeededRandom {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: SeededRandom, items: T[]): T {
  return items[Math.floor(rand() * items.length)]!;
}

function int(rand: SeededRandom, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function money(rand: SeededRandom, min: number, max: number): number {
  const v = rand() * (max - min) + min;
  return Math.round(v * 100) / 100;
}

function pad(n: number, len: number): string {
  return n.toString().padStart(len, '0');
}

function isoDaysAgo(rand: SeededRandom, maxDaysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - int(rand, 0, maxDaysAgo));
  d.setHours(int(rand, 0, 23), int(rand, 0, 59), int(rand, 0, 59), 0);
  return d.toISOString();
}

export type DummyProduct = {
  id: number;
  name: string;
  sku: string;
  barcode?: string;
  categoryId?: number;
  categoryName?: string;
  supplierId?: number;
  supplierName?: string;
  description?: string;
  unitPrice: number;
  costPrice: number;
  quantityInStock: number;
  minimumStockLevel: number;
  reorderPoint: number;
  reorderQuantity?: number;
  unitOfMeasure?: string;
  weight?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type DummyOrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type DummyPaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL' | 'REFUNDED';

export type DummyOrder = {
  id: number;
  orderNumber: string;
  customerName: string;
  status: DummyOrderStatus;
  totalAmount: number;
  paymentStatus: DummyPaymentStatus;
  paymentMethod: string;
  notes: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt?: string;
};

export type DummyPOStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';

export type DummySupplier = {
  id: number;
  name: string;
  code: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  country: string;
  performance_score: number;
  rating: number;
  contactPerson?: string;
};

export type DummyPOItem = { productName: string; quantity: number; unitPrice: number; total: number };

export type DummyPurchaseOrder = {
  id: number;
  poNumber: string;
  supplierId: number;
  supplierName: string;
  status: DummyPOStatus;
  items: DummyPOItem[];
  totalAmount: number;
  expectedDelivery: string;
  notes?: string;
  shippingAddress?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type DummyShipmentStatus = 'PENDING' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'EXCEPTION';

export type DummyShipment = {
  id: number;
  trackingNumber: string;
  orderId?: number;
  orderNumber?: string;
  carrier: string;
  status: DummyShipmentStatus;
  origin: string;
  destination: string;
  createdAt: string;
  updatedAt?: string;
};

export function generateDummyProducts(count: number, seed = 101): DummyProduct[] {
  const rand = mulberry32(seed);
  const categories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Clothing' },
    { id: 3, name: 'Food & Beverage' },
    { id: 4, name: 'Industrial' },
    { id: 5, name: 'Office Supplies' },
    { id: 6, name: 'Healthcare' },
  ];
  const suppliers = [
    { id: 1, name: 'TechSupply Co.' },
    { id: 2, name: 'SafeGear Ltd.' },
    { id: 3, name: 'OfficePro Inc.' },
    { id: 4, name: 'GreenLeaf Imports' },
    { id: 5, name: 'MedSupply Global' },
    { id: 6, name: 'WorkWear Direct' },
    { id: 7, name: 'IndustrialMart' },
    { id: 8, name: 'Prime Components' },
  ];
  const adjectives = ['Industrial', 'Premium', 'Eco', 'Smart', 'Ultra', 'Compact', 'Heavy Duty', 'Wireless', 'Pro', 'Advanced'];
  const nouns = ['Scanner', 'Router', 'Safety Helmet', 'Office Chair', 'Mask Pack', 'Battery', 'Gloves', 'Printer', 'Sensor', 'Cable Kit'];
  const uom = ['pcs', 'box', 'kg', 'pack'];

  const list: DummyProduct[] = [];
  for (let i = 1; i <= count; i++) {
    const c = pick(rand, categories);
    const s = pick(rand, suppliers);
    const name = `${pick(rand, adjectives)} ${pick(rand, nouns)} ${pad(i, 3)}`;
    const unitPrice = money(rand, 5, 2500);
    const costPrice = Math.max(1, Math.round(unitPrice * money(rand, 0.45, 0.85) * 100) / 100);
    const min = int(rand, 5, 40);
    const reorderPoint = int(rand, min, min + 60);
    const qty = int(rand, 0, reorderPoint * 3);
    const reorderQty = int(rand, 10, 250);
    list.push({
      id: i,
      name,
      sku: `${c.name.slice(0, 3).toUpperCase()}-${pad(i, 5)}`,
      barcode: `${int(rand, 100000000000, 999999999999)}`,
      categoryId: c.id,
      categoryName: c.name,
      supplierId: s.id,
      supplierName: s.name,
      description: `SKU ${c.name} item for warehouse operations`,
      unitPrice,
      costPrice,
      quantityInStock: qty,
      minimumStockLevel: min,
      reorderPoint,
      reorderQuantity: reorderQty,
      unitOfMeasure: pick(rand, uom),
      weight: money(rand, 0.1, 25),
      createdAt: isoDaysAgo(rand, 180),
      updatedAt: isoDaysAgo(rand, 30),
    });
  }
  return list;
}

export function generateDummyOrders(count: number, seed = 202): DummyOrder[] {
  const rand = mulberry32(seed);
  const customers = [
    'Apex Electronics Ltd.',
    'TechCore Systems Pvt. Ltd.',
    'Global Ventures Inc.',
    'Northern Supply Co.',
    'Precision Tools Corp.',
    'Nova Retail Group',
    'Stellar Manufacturing',
    'Orchid Pharma Traders',
    'BlueOcean Logistics',
    'Vertex Components',
  ];
  const methods = ['Wire Transfer', 'Bank Transfer', 'Credit Card', 'Invoice', 'Cash', 'UPI', 'Cheque'];
  const statuses: DummyOrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  const payStatuses: DummyPaymentStatus[] = ['UNPAID', 'PARTIAL', 'PAID', 'REFUNDED'];
  const cities = ['Chennai', 'Bengaluru', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat'];

  const list: DummyOrder[] = [];
  const year = new Date().getFullYear();
  for (let i = 1; i <= count; i++) {
    const status = pick(rand, statuses);
    const paymentStatus = status === 'CANCELLED' ? 'REFUNDED' : pick(rand, payStatuses);
    const amount = money(rand, 200, 95000);
    const createdAt = isoDaysAgo(rand, 120);
    list.push({
      id: i,
      orderNumber: `ORD-${year}-${pad(i, 5)}`,
      customerName: pick(rand, customers),
      status,
      totalAmount: amount,
      paymentStatus,
      paymentMethod: pick(rand, methods),
      notes: rand() > 0.8 ? 'Priority delivery requested.' : '',
      shippingAddress: `${int(rand, 10, 999)} Industrial Park, ${pick(rand, cities)}, IN`,
      createdAt,
      updatedAt: isoDaysAgo(rand, 20),
    });
  }
  return list;
}

export function generateDummySuppliers(count: number, seed = 303): DummySupplier[] {
  const rand = mulberry32(seed);
  const prefixes = ['Tech', 'Industrial', 'Global', 'Prime', 'Rapid', 'Safe', 'Blue', 'Vertex', 'Green', 'Metro'];
  const suffixes = ['Supply', 'Components', 'Distributors', 'Traders', 'Exports', 'Imports', 'Solutions', 'Group', 'Logistics', 'Materials'];
  const countries = ['India', 'USA', 'Germany', 'Japan', 'UAE', 'Singapore', 'UK', 'Netherlands', 'France', 'Canada'];
  const firstNames = ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Farhan', 'Grace', 'Hiro', 'Isha', 'John'];
  const lastNames = ['Chen', 'Martinez', 'Johnson', 'Kim', 'Wilson', 'Patel', 'Singh', 'Brown', 'Kumar', 'Sharma'];

  const list: DummySupplier[] = [];
  for (let i = 1; i <= count; i++) {
    const name = `${pick(rand, prefixes)} ${pick(rand, suffixes)} ${pad(i, 3)}`;
    const code = `SUP-${pad(i, 5)}`;
    const status = rand() > 0.12 ? 'ACTIVE' : 'INACTIVE';
    list.push({
      id: i,
      name,
      code,
      email: `orders+${code.toLowerCase()}@example.com`,
      status,
      country: pick(rand, countries),
      performance_score: int(rand, 55, 100),
      rating: int(rand, 1, 5),
      contactPerson: `${pick(rand, firstNames)} ${pick(rand, lastNames)}`,
    });
  }
  return list;
}

export function generateDummyPurchaseOrders(count: number, suppliers: { id: number; name: string }[], seed = 404): DummyPurchaseOrder[] {
  const rand = mulberry32(seed);
  const statuses: DummyPOStatus[] = ['DRAFT', 'PENDING', 'APPROVED', 'ORDERED', 'RECEIVED', 'CANCELLED'];
  const products = [
    'Barcode Scanner',
    'Industrial Router',
    'Safety Helmet',
    'N95 Mask Pack',
    'Forklift Battery',
    'Office Chair',
    'Packaging Materials',
    'Copper Wire',
    'Steel Rods',
    'Sensor Module',
  ];
  const creators = ['John Smith', 'Sarah Connor', 'Mike Johnson', 'Lisa Park', 'Tom Wilson', 'Amit Shah', 'Neha Rao'];
  const cities = ['Chennai', 'Bengaluru', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Kolkata', 'Ahmedabad'];

  const list: DummyPurchaseOrder[] = [];
  const year = new Date().getFullYear();
  for (let i = 1; i <= count; i++) {
    const supplier = pick(rand, suppliers);
    const itemsCount = int(rand, 1, 5);
    const items: DummyPOItem[] = [];
    let total = 0;
    for (let k = 0; k < itemsCount; k++) {
      const quantity = int(rand, 1, 500);
      const unitPrice = money(rand, 2, 45000);
      const lineTotal = Math.round(quantity * unitPrice * 100) / 100;
      total += lineTotal;
      items.push({ productName: `${pick(rand, products)} ${pad(int(rand, 1, 999), 3)}`, quantity, unitPrice, total: lineTotal });
    }
    const createdAt = isoDaysAgo(rand, 180);
    list.push({
      id: i,
      poNumber: `PO-${year}-${pad(i, 6)}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      status: pick(rand, statuses),
      items,
      totalAmount: Math.round(total * 100) / 100,
      expectedDelivery: new Date(Date.now() + int(rand, 2, 45) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      notes: rand() > 0.75 ? 'Priority replenishment' : '',
      shippingAddress: `${int(rand, 10, 999)} Warehouse Blvd, ${pick(rand, cities)}, IN`,
      createdBy: pick(rand, creators),
      createdAt,
      updatedAt: isoDaysAgo(rand, 30),
    });
  }
  return list;
}

export function generateDummyShipments(count: number, orders: { id: number; orderNumber: string }[], seed = 505): DummyShipment[] {
  const rand = mulberry32(seed);
  const carriers = ['DHL', 'FedEx', 'BlueDart', 'Delhivery', 'UPS', 'DTDC'];
  const statuses: DummyShipmentStatus[] = ['PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION'];
  const cities = ['Chennai', 'Bengaluru', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat'];

  const list: DummyShipment[] = [];
  for (let i = 1; i <= count; i++) {
    const order = rand() > 0.1 ? pick(rand, orders) : undefined;
    list.push({
      id: i,
      trackingNumber: `TRK-${pad(int(rand, 100000, 999999), 6)}-${pad(i, 4)}`,
      orderId: order?.id,
      orderNumber: order?.orderNumber,
      carrier: pick(rand, carriers),
      status: pick(rand, statuses),
      origin: pick(rand, cities),
      destination: pick(rand, cities),
      createdAt: isoDaysAgo(rand, 90),
      updatedAt: isoDaysAgo(rand, 15),
    });
  }
  return list;
}

export function loadOrCreate<T>(key: string, factory: () => T): T {
  if (typeof window === 'undefined') return factory();
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
  }
  const v = factory();
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
  }
  return v;
}

export function save<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('app-data-changed'));
  } catch {
  }
}

