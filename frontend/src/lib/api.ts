import {
  generateDummyProducts,
  generateDummyOrders,
  generateDummySuppliers,
  generateDummyPurchaseOrders,
  generateDummyShipments,
  loadOrCreate,
  save,
  DummyProduct,
  DummyOrder,
  DummySupplier,
  DummyPurchaseOrder,
  DummyShipment
} from './dummyData';

const KEYS = {
  PRODUCTS: 'dummy_products_v3',
  ORDERS: 'dummy_orders_v3',
  SUPPLIERS: 'dummy_suppliers_v3',
  POS: 'dummy_pos_v3',
  SHIPMENTS: 'dummy_shipments_v3',
};

const DUMMY_COUNT = 120;

function readData<T>(key: string, generator: () => T[]): T[] {
  return loadOrCreate(key, generator);
}

const getProducts = () => readData(KEYS.PRODUCTS, () => generateDummyProducts(DUMMY_COUNT) as any);
const getOrders = () => readData(KEYS.ORDERS, () => generateDummyOrders(DUMMY_COUNT) as any);
const getSuppliers = () => readData(KEYS.SUPPLIERS, () => generateDummySuppliers(DUMMY_COUNT) as any);
const getPOs = () => readData(KEYS.POS, () => generateDummyPurchaseOrders(DUMMY_COUNT, getSuppliers() as any) as any);
const getShipments = () => readData(KEYS.SHIPMENTS, () => generateDummyShipments(DUMMY_COUNT, getOrders() as any) as any);

function paginate(list: any[], page: number, size: number) {
  const totalElements = list.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const content = list.slice(page * size, page * size + size);
  return { data: { content, totalElements, totalPages, number: page, size, data: { content, totalElements, totalPages, number: page, size } } };
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: async (credentials?: any) => ({ user: { id: 1, name: 'Admin', role: 'SUPER_ADMIN', username: 'admin', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', status: 'ACTIVE' }, token: 'mock', refreshToken: 'mock-refresh' } as any),
  signup: async (data: any) => ({ user: { id: 1, name: data.firstName || 'User', role: 'ADMIN', username: 'user', email: 'user@example.com', firstName: 'User', lastName: 'User', status: 'ACTIVE' }, token: 'mock', refreshToken: 'mock-refresh' } as any),
  logout: async () => ({}),
  refresh: async (token: string) => ({ token: 'mock-new-token', refreshToken: 'mock-new-refresh' } as any),
  getMe: async () => ({ user: { id: 1, name: 'Admin', role: 'SUPER_ADMIN', username: 'admin', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', status: 'ACTIVE' } } as any),
};

// ── Products / Inventory ──────────────────────────────────────────────────────
export const productApi = {
  getAll: async (params?: any) => {
    let list = getProducts();
    return paginate(list, params?.page || 0, params?.size || 20);
  },
  getById: async (id: number) => ({ data: getProducts().find((p: any) => p.id === id) }),
  create: async (data: any) => {
    const list = getProducts();
    const newId = Math.max(0, ...list.map((p: any) => p.id)) + 1;
    const item = { ...data, id: newId, createdAt: new Date().toISOString() };
    save(KEYS.PRODUCTS, [item, ...list]);
    return { data: item };
  },
  update: async (id: number, data: any) => {
    const list = getProducts();
    const updated = list.map((p: any) => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p);
    save(KEYS.PRODUCTS, updated);
    return { data: updated.find((p: any) => p.id === id) };
  },
  delete: async (id: number) => {
    save(KEYS.PRODUCTS, getProducts().filter((p: any) => p.id !== id));
    return {};
  },
  getCategories: async () => ({
    data: [
      { id: 1, name: 'Electronics' },
      { id: 2, name: 'Clothing' },
      { id: 3, name: 'Food & Beverage' },
      { id: 4, name: 'Industrial' },
      { id: 5, name: 'Office Supplies' },
      { id: 6, name: 'Healthcare' },
    ]
  }),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderApi = {
  getAll: async (params?: any) => {
    let list = getOrders();
    return paginate(list, params?.page || 0, params?.size || 20);
  },
  getById: async (id: number) => ({ data: getOrders().find((p: any) => p.id === id) }),
  create: async (data: any) => {
    const list = getOrders();
    const newId = Math.max(0, ...list.map((p: any) => p.id)) + 1;
    const item = { ...data, id: newId, createdAt: new Date().toISOString() };
    save(KEYS.ORDERS, [item, ...list]);
    return { data: item };
  },
  update: async (id: number, data: any) => {
    const list = getOrders();
    const updated = list.map((p: any) => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p);
    save(KEYS.ORDERS, updated);
    return { data: updated.find((p: any) => p.id === id) };
  },
  delete: async (id: number) => {
    save(KEYS.ORDERS, getOrders().filter((p: any) => p.id !== id));
    return {};
  },
  updateStatus: async (id: number, status: string) => {
    const list = getOrders();
    const updated = list.map((p: any) => p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p);
    save(KEYS.ORDERS, updated);
    return { data: updated.find((p: any) => p.id === id) };
  },
};

// ── Suppliers ─────────────────────────────────────────────────────────────────
export const supplierApi = {
  getAll: async (params?: any) => {
    let list = getSuppliers();
    return paginate(list, params?.page || 0, params?.size || 20);
  },
  getById: async (id: number) => ({ data: getSuppliers().find((p: any) => p.id === id) }),
  create: async (data: any) => {
    const list = getSuppliers();
    const newId = Math.max(0, ...list.map((p: any) => p.id)) + 1;
    const item = { ...data, id: newId, createdAt: new Date().toISOString() };
    save(KEYS.SUPPLIERS, [item, ...list]);
    return { data: item };
  },
  update: async (id: number, data: any) => {
    const list = getSuppliers();
    const updated = list.map((p: any) => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p);
    save(KEYS.SUPPLIERS, updated);
    return { data: updated.find((p: any) => p.id === id) };
  },
  delete: async (id: number) => {
    save(KEYS.SUPPLIERS, getSuppliers().filter((p: any) => p.id !== id));
    return {};
  },
};

// ── Shipments ─────────────────────────────────────────────────────────────────
export const shipmentApi = {
  getAll: async (params?: any) => {
    let list = getShipments();
    return paginate(list, params?.page || 0, params?.size || 20);
  },
  getById: async (id: number) => ({ data: getShipments().find((p: any) => p.id === id) }),
  create: async (data: any) => {
    const list = getShipments();
    const newId = Math.max(0, ...list.map((p: any) => p.id)) + 1;
    const item = { ...data, id: newId, createdAt: new Date().toISOString() };
    save(KEYS.SHIPMENTS, [item, ...list]);
    return { data: item };
  },
  update: async (id: number, data: any) => {
    const list = getShipments();
    const updated = list.map((p: any) => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p);
    save(KEYS.SHIPMENTS, updated);
    return { data: updated.find((p: any) => p.id === id) };
  },
  delete: async (id: number) => {
    save(KEYS.SHIPMENTS, getShipments().filter((p: any) => p.id !== id));
    return {};
  },
  updateStatus: async (id: number, status: string) => {
    const list = getShipments();
    const updated = list.map((p: any) => p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p);
    save(KEYS.SHIPMENTS, updated);
    return { data: updated.find((p: any) => p.id === id) };
  },
};

// ── Purchase Orders (Procurement) ─────────────────────────────────────────────
export const procurementApi = {
  getAll: async (params?: any) => {
    let list = getPOs();
    return paginate(list, params?.page || 0, params?.size || 20);
  },
  getById: async (id: number) => ({ data: getPOs().find((p: any) => p.id === id) }),
  create: async (data: any) => {
    const list = getPOs();
    const newId = Math.max(0, ...list.map((p: any) => p.id)) + 1;
    const item = { ...data, id: newId, createdAt: new Date().toISOString() };
    save(KEYS.POS, [item, ...list]);
    return { data: item };
  },
  update: async (id: number, data: any) => {
    const list = getPOs();
    const updated = list.map((p: any) => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p);
    save(KEYS.POS, updated);
    return { data: updated.find((p: any) => p.id === id) };
  },
  delete: async (id: number) => {
    save(KEYS.POS, getPOs().filter((p: any) => p.id !== id));
    return {};
  },
  approve: async (id: number) => {
    const list = getPOs();
    const updated = list.map((p: any) => p.id === id ? { ...p, status: 'APPROVED', updatedAt: new Date().toISOString() } : p);
    save(KEYS.POS, updated);
    return { data: updated.find((p: any) => p.id === id) };
  },
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  getDashboard: async () => ({ data: {} }),
  getRevenueChart: async () => ({ data: [] }),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  getAll: async (params?: any) => ({ data: [] } as any),
  getUnreadCount: async () => ({ data: 0 } as any),
  markAsRead: async (id: number) => ({ data: {} } as any),
  markAllAsRead: async () => ({ data: {} } as any),
  delete: async (id: number) => ({ data: {} } as any),
  broadcast: async (data: any) => ({ data: {} } as any),
};

// ── Users / Profile ───────────────────────────────────────────────────────────
export const userApi = {
  getProfile: async () => ({ data: { id: 1, name: 'Admin', email: 'admin@example.com' } }),
  updateProfile: async (data: any) => ({ data }),
  changePassword: async (data: any) => ({ data: {} }),
};

// ── AI Assistant ──────────────────────────────────────────────────────────────
export const aiApi = {
  chat: async (message: string, context?: string, onChunk?: (chunk: string) => void) => {
    return fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, context })
    }).then(async response => {
      if (!response.ok) throw new Error('AI request failed');
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data:')) {
              const content = line.substring(5);
              if (content.trim() && content.trim() !== '[DONE]') {
                const text = JSON.parse(content).text;
                fullText += text;
                onChunk?.(text);
              }
            }
          }
        }
      }
      return { data: fullText };
    });
  },
};
const defaultApi: any = {
  get: async (url: string, config?: any) => ({ data: { data: {} } }),
  post: async (url: string, data?: any, config?: any) => ({ data: { data: {} } }),
  put: async (url: string, data?: any, config?: any) => ({ data: { data: {} } }),
  patch: async (url: string, data?: any, config?: any) => ({ data: { data: {} } }),
  delete: async (url: string, config?: any) => ({ data: { data: {} } }),
  interceptors: { request: { use: () => {} }, response: { use: () => {} } }
};
export default defaultApi;


