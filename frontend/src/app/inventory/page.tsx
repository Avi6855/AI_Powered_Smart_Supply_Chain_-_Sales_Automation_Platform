'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { AiFab } from '@/components/ai/AiFab';
import { productApi } from '@/lib/api';
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  AlertTriangle,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  DollarSign,
  Bot,
  ChevronDown,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
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
}

interface Category {
  id: number;
  name: string;
}

interface PageResponse<T> {
  content?: T[];
  data?: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ProductFormData {
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  supplierId: string;
  description: string;
  unitPrice: string;
  costPrice: string;
  quantityInStock: string;
  minimumStockLevel: string;
  reorderPoint: string;
  reorderQuantity: string;
  unitOfMeasure: string;
  weight: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Clothing' },
  { id: 3, name: 'Food & Beverage' },
  { id: 4, name: 'Industrial' },
  { id: 5, name: 'Office Supplies' },
  { id: 6, name: 'Healthcare' },
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Name A→Z' },
  { value: 'name,desc', label: 'Name Z→A' },
  { value: 'quantityInStock', label: 'Stock: Low→High' },
  { value: 'quantityInStock,desc', label: 'Stock: High→Low' },
  { value: 'unitPrice', label: 'Price: Low→High' },
  { value: 'unitPrice,desc', label: 'Price: High→Low' },
  { value: 'createdAt,desc', label: 'Newest First' },
];

const EMPTY_FORM: ProductFormData = {
  name: '',
  sku: '',
  barcode: '',
  categoryId: '',
  supplierId: '',
  description: '',
  unitPrice: '',
  costPrice: '',
  quantityInStock: '',
  minimumStockLevel: '',
  reorderPoint: '',
  reorderQuantity: '',
  unitOfMeasure: 'pcs',
  weight: '',
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getStockStatus(product: Product): 'out' | 'critical' | 'low' | 'ok' {
  if (product.quantityInStock === 0) return 'out';
  if (product.quantityInStock < product.minimumStockLevel) return 'critical';
  if (product.quantityInStock <= product.reorderPoint) return 'low';
  return 'ok';
}

function getStockBarColor(status: string): string {
  switch (status) {
    case 'out': return 'bg-red-500';
    case 'critical': return 'bg-red-400';
    case 'low': return 'bg-amber-400';
    default: return 'bg-emerald-400';
  }
}

function getStockBarWidth(product: Product): number {
  const max = Math.max(product.reorderPoint * 2, product.quantityInStock);
  if (max === 0) return 0;
  return Math.min(100, (product.quantityInStock / max) * 100);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function extractProducts(data: unknown): Product[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as Product[];
  const d = data as any;
  if (d?.data && typeof d.data === 'object' && (Array.isArray(d.data.content) || Array.isArray(d.data.data))) {
    return extractProducts(d.data);
  }
  if (Array.isArray(d.content)) return d.content;
  if (Array.isArray(d.data)) return d.data;
  return [];
}

function extractTotalPages(data: unknown): number {
  if (!data || Array.isArray(data)) return 1;
  const d = data as any;
  if (d?.data && typeof d.data === 'object') return extractTotalPages(d.data);
  return d.totalPages ?? 1;
}

function normalizeProduct(raw: any): Product {
  return {
    id: raw?.id,
    name: raw?.name ?? '',
    sku: raw?.sku ?? '',
    barcode: raw?.barcode ?? undefined,
    categoryId: raw?.categoryId ?? raw?.category_id ?? undefined,
    categoryName: raw?.categoryName ?? raw?.category_name ?? undefined,
    supplierId: raw?.supplierId ?? raw?.supplier_id ?? undefined,
    supplierName: raw?.supplierName ?? raw?.supplier_name ?? undefined,
    description: raw?.description ?? undefined,
    unitPrice: Number(raw?.unitPrice ?? raw?.unit_price ?? 0),
    costPrice: Number(raw?.costPrice ?? raw?.cost_price ?? 0),
    quantityInStock: Number(raw?.quantityInStock ?? raw?.quantity_in_stock ?? 0),
    minimumStockLevel: Number(raw?.minimumStockLevel ?? raw?.minimum_stock_level ?? 0),
    reorderPoint: Number(raw?.reorderPoint ?? raw?.reorder_point ?? 0),
    reorderQuantity: raw?.reorderQuantity ?? raw?.reorder_quantity ?? undefined,
    unitOfMeasure: raw?.unitOfMeasure ?? raw?.unit_of_measure ?? undefined,
    weight: raw?.weight ?? undefined,
    createdAt: raw?.createdAt ?? raw?.created_at ?? undefined,
    updatedAt: raw?.updatedAt ?? raw?.updated_at ?? undefined,
  };
}

// ─── Toast Component ──────────────────────────────────────────────────────────

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium animate-in slide-in-from-right-5 fade-in duration-300 ${
            t.type === 'success'
              ? 'bg-emerald-950 border-emerald-700 text-emerald-200'
              : t.type === 'error'
              ? 'bg-red-950 border-red-700 text-red-200'
              : 'bg-blue-950 border-blue-700 text-blue-200'
          }`}
        >
          {t.type === 'success' && <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-400" />}
          {t.type === 'error' && <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />}
          {t.type === 'info' && <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="opacity-60 hover:opacity-100 transition-opacity">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    out: { label: 'Out of Stock', cls: 'bg-red-500/10 text-red-400 border border-red-500/30' },
    critical: { label: 'Critical', cls: 'bg-red-400/10 text-red-300 border border-red-400/30' },
    low: { label: 'Low Stock', cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/30' },
    ok: { label: 'In Stock', cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' },
  };
  const { label, cls } = cfg[status] ?? cfg.ok;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${cls}`}>{label}</span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-5 flex flex-col gap-3 shadow-lg group hover:border-input transition-colors">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-opacity-15`}>
        <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className="text-foreground text-2xl font-bold">{value}</p>
        {sub && <p className="text-muted-foreground text-xs mt-0.5">{sub}</p>}
      </div>
      <div className={`absolute right-4 top-4 w-20 h-20 rounded-full opacity-5 ${color}`} />
    </div>
  );
}

// ─── Product Form Modal ───────────────────────────────────────────────────────

function ProductModal({
  open,
  mode,
  product,
  categories,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: 'add' | 'edit';
  product?: Product;
  categories: Category[];
  onClose: () => void;
  onSave: (data: ProductFormData) => Promise<void>;
}) {
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && product) {
      setForm({
        name: product.name ?? '',
        sku: product.sku ?? '',
        barcode: product.barcode ?? '',
        categoryId: product.categoryId?.toString() ?? '',
        supplierId: product.supplierId?.toString() ?? '',
        description: product.description ?? '',
        unitPrice: product.unitPrice?.toString() ?? '',
        costPrice: product.costPrice?.toString() ?? '',
        quantityInStock: product.quantityInStock?.toString() ?? '',
        minimumStockLevel: product.minimumStockLevel?.toString() ?? '',
        reorderPoint: product.reorderPoint?.toString() ?? '',
        reorderQuantity: product.reorderQuantity?.toString() ?? '',
        unitOfMeasure: product.unitOfMeasure ?? 'pcs',
        weight: product.weight?.toString() ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [open, mode, product]);

  const validate = (): boolean => {
    const e: Partial<Record<keyof ProductFormData, string>> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (!form.unitPrice || isNaN(Number(form.unitPrice)) || Number(form.unitPrice) < 0) e.unitPrice = 'Valid unit price required';
    if (!form.costPrice || isNaN(Number(form.costPrice)) || Number(form.costPrice) < 0) e.costPrice = 'Valid cost price required';
    if (form.quantityInStock === '' || isNaN(Number(form.quantityInStock))) e.quantityInStock = 'Valid quantity required';
    if (form.minimumStockLevel === '' || isNaN(Number(form.minimumStockLevel))) e.minimumStockLevel = 'Valid min stock required';
    if (form.reorderPoint === '' || isNaN(Number(form.reorderPoint))) e.reorderPoint = 'Valid reorder point required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const field = (
    key: keyof ProductFormData,
    label: string,
    type: string = 'text',
    placeholder: string = ''
  ) => (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(ev) => setForm((f) => ({ ...f, [key]: ev.target.value }))}
        className={`w-full bg-input border rounded-lg px-3 py-2 text-sm text-foreground placeholder-gray-600 focus:outline-none focus:ring-2 transition-colors ${
          errors[key] ? 'border-red-500 focus:ring-red-500/30' : 'border-input focus:ring-indigo-500/40 focus:border-indigo-500'
        }`}
      />
      {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-500/15 rounded-xl flex items-center justify-center">
              <Package className="w-4.5 h-4.5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-foreground font-semibold text-base">{mode === 'add' ? 'Add New Product' : 'Edit Product'}</h2>
              <p className="text-muted-foreground text-xs">{mode === 'add' ? 'Fill in the product details below' : `Editing: ${product?.name}`}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-input">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            {field('name', 'Product Name *', 'text', 'e.g. Industrial Router X500')}
            {field('sku', 'SKU *', 'text', 'e.g. ELEC-RTR-001')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field('barcode', 'Barcode', 'text', 'e.g. 123456789012')}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
              <div className="relative">
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className="w-full bg-input border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 appearance-none transition-colors"
                >
                  <option value="">Select category…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field('supplierId', 'Supplier ID', 'number', 'e.g. 1')}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Unit of Measure</label>
              <div className="relative">
                <select
                  value={form.unitOfMeasure}
                  onChange={(e) => setForm((f) => ({ ...f, unitOfMeasure: e.target.value }))}
                  className="w-full bg-input border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 appearance-none transition-colors"
                >
                  {['pcs', 'kg', 'box', 'liter', 'meter', 'set', 'pair', 'dozen'].map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Product description…"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full bg-input border border-input rounded-lg px-3 py-2 text-sm text-foreground placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors resize-none"
            />
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pricing</p>
            <div className="grid grid-cols-2 gap-4">
              {field('unitPrice', 'Unit Price (USD) *', 'number', '0.00')}
              {field('costPrice', 'Cost Price (USD) *', 'number', '0.00')}
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Stock Settings</p>
            <div className="grid grid-cols-2 gap-4">
              {field('quantityInStock', 'Quantity In Stock *', 'number', '0')}
              {field('minimumStockLevel', 'Minimum Stock Level *', 'number', '0')}
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {field('reorderPoint', 'Reorder Point *', 'number', '0')}
              {field('reorderQuantity', 'Reorder Quantity', 'number', '0')}
              {field('weight', 'Weight (kg)', 'number', '0.00')}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-input hover:bg-gray-750 border border-input rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-foreground rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-indigo-900/30"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {saving ? 'Saving…' : mode === 'add' ? 'Add Product' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteDialog({
  open,
  product,
  onClose,
  onConfirm,
  deleting,
}: {
  open: boolean;
  product?: Product;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  deleting: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-foreground font-semibold text-base">Delete Product</h2>
            <p className="text-muted-foreground text-sm">This action cannot be undone.</p>
          </div>
        </div>
        <div className="bg-input/60 border border-input rounded-xl px-4 py-3 mb-6">
          <p className="text-foreground font-medium text-sm">{product?.name}</p>
          <p className="text-muted-foreground text-xs mt-0.5">SKU: {product?.sku}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-input hover:bg-gray-750 border border-input rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:cursor-not-allowed text-foreground rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {deleting ? 'Deleting…' : 'Delete Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(0);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | undefined>();
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = String(++toastId.current);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page on filter/sort change
  useEffect(() => {
    setPage(0);
  }, [categoryFilter, sort]);

  const pageSize = 20;

  const reloadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productApi.getAll({ page: 0, size: 1000 }),
        productApi.getCategories(),
      ]);

      setProducts(extractProducts(productsRes).map(normalizeProduct));
      const cats = (categoriesRes as any)?.data ?? (categoriesRes as any);
      setCategories(Array.isArray(cats) ? cats : MOCK_CATEGORIES);
    } catch {
      setProducts([]);
      setCategories(MOCK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadProducts();
  }, [reloadProducts]);

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((p) => {
        const hay = `${p.name} ${p.sku} ${p.barcode ?? ''} ${p.categoryName ?? ''} ${p.supplierName ?? ''}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (categoryFilter) {
      const id = Number(categoryFilter);
      list = list.filter((p) => (p.categoryId ?? -1) === id);
    }

    const [field, dir] = sort.split(',');
    const desc = dir === 'desc';
    const cmp = (a: Product, b: Product) => {
      const av = (a as any)[field];
      const bv = (b as any)[field];
      if (av == null && bv == null) return 0;
      if (av == null) return desc ? 1 : -1;
      if (bv == null) return desc ? -1 : 1;
      if (typeof av === 'number' && typeof bv === 'number') return desc ? bv - av : av - bv;
      return desc ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
    };
    list.sort(cmp);
    return list;
  }, [products, debouncedSearch, categoryFilter, sort]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredProducts.length / pageSize)), [filteredProducts.length]);

  useEffect(() => {
    if (page >= totalPages) setPage(Math.max(0, totalPages - 1));
  }, [page, totalPages]);

  const pageProducts = filteredProducts;

  // ── Computed stats ───────────────────────────────────────────────────────────

  const allProducts = products;
  const totalProducts = products.length;
  const lowStockCount = allProducts.filter((p) => getStockStatus(p) === 'low').length;
  const outOfStockCount = allProducts.filter((p) => getStockStatus(p) === 'out').length;
  const criticalCount = allProducts.filter((p) => getStockStatus(p) === 'critical').length;
  const totalValue = allProducts.reduce((s, p) => s + p.unitPrice * p.quantityInStock, 0);

  // ── CRUD Handlers ────────────────────────────────────────────────────────────

  const handleAdd = () => {
    setModalMode('add');
    setEditingProduct(undefined);
    setModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setModalMode('edit');
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setDeletingProduct(product);
    setDeleteOpen(true);
  };

  const handleSave = async (formData: ProductFormData) => {
    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      barcode: formData.barcode.trim() || undefined,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
      supplierId: formData.supplierId ? parseInt(formData.supplierId) : undefined,
      description: formData.description.trim() || undefined,
      unitPrice: parseFloat(formData.unitPrice),
      costPrice: parseFloat(formData.costPrice),
      quantityInStock: parseInt(formData.quantityInStock),
      minimumStockLevel: parseInt(formData.minimumStockLevel),
      reorderPoint: parseInt(formData.reorderPoint),
      reorderQuantity: formData.reorderQuantity ? parseInt(formData.reorderQuantity) : undefined,
      unitOfMeasure: formData.unitOfMeasure,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
    };

    try {
      if (modalMode === 'add') {
        const res = await productApi.create(payload);
        const created = ((res as any)?.data ?? res) as Product;
        const newProd: Product = {
          ...created,
          categoryName: (created as any)?.category_name ?? (created as any)?.categoryName ?? created.categoryName,
          supplierName: (created as any)?.supplier_name ?? (created as any)?.supplierName ?? created.supplierName,
          unitPrice: (created as any)?.unit_price ?? (created as any)?.unitPrice ?? (created as any)?.unitPrice,
          costPrice: (created as any)?.cost_price ?? (created as any)?.costPrice ?? (created as any)?.costPrice,
          quantityInStock: (created as any)?.quantity_in_stock ?? (created as any)?.quantityInStock ?? (created as any)?.quantityInStock,
          minimumStockLevel: (created as any)?.minimumStockLevel ?? (created as any)?.minimum_stock_level ?? (created as any)?.minimumStockLevel,
          reorderPoint: (created as any)?.reorderPoint ?? (created as any)?.reorder_point ?? (created as any)?.reorderPoint,
        };
        setProducts((prev) => [newProd, ...prev]);
        addToast('success', `Product "${payload.name}" created successfully!`);
      } else if (editingProduct) {
        const res = await productApi.update(editingProduct.id, payload);
        const updatedRemote = ((res as any)?.data ?? res) as Product;
        const updatedLocal: Product = {
          ...editingProduct,
          ...payload,
          ...updatedRemote,
          categoryName:
            (updatedRemote as any)?.category_name ??
            (updatedRemote as any)?.categoryName ??
            categories.find((c) => c.id === payload.categoryId)?.name ??
            editingProduct.categoryName,
          supplierName: (updatedRemote as any)?.supplier_name ?? (updatedRemote as any)?.supplierName ?? editingProduct.supplierName,
        };
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updatedLocal : p)));
        addToast('success', `Product "${payload.name}" updated successfully!`);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      addToast('error', `Failed to save product: ${msg}`);
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    try {
      await productApi.delete(deletingProduct.id);
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      addToast('success', `Product "${deletingProduct.name}" deleted successfully!`);
      setDeleteOpen(false);
      setDeletingProduct(undefined);
    } catch {
      addToast('error', 'Failed to delete product. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="min-h-screen bg-background p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-indigo-500/15 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-indigo-400" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
            </div>
            <p className="text-muted-foreground text-sm ml-12">Manage your product catalog and stock levels</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-foreground text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-900/30"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Package}
            label="Total Products"
            value={totalProducts}
            sub="Across all categories"
            color="bg-indigo-500"
          />
          <StatCard
            icon={TrendingDown}
            label="Low Stock Items"
            value={lowStockCount}
            sub="Below reorder point"
            color="bg-amber-500"
          />
          <StatCard
            icon={AlertTriangle}
            label="Out of Stock"
            value={outOfStockCount + criticalCount}
            sub="Needs immediate attention"
            color="bg-red-500"
          />
          <StatCard
            icon={DollarSign}
            label="Total Value"
            value={formatCurrency(totalValue)}
            sub="At retail price"
            color="bg-emerald-500"
          />
        </div>

        {/* Filters Bar */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products, SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-input border border-input rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-input border border-input rounded-xl pl-9 pr-8 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 appearance-none transition-colors cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-input border border-input rounded-xl pl-9 pr-8 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 appearance-none transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          <div className="flex-1" />

          {/* Refresh */}
          <button
            onClick={reloadProducts}
            disabled={loading}
            className="p-2.5 bg-input hover:bg-gray-750 border border-input rounded-xl text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Summary */}
          <span className="text-muted-foreground text-sm hidden lg:block">
            {filteredProducts.length} of {totalProducts} products
          </span>
        </div>

        <div className="space-y-6">
            {/* Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                <p className="text-muted-foreground text-sm">Loading inventory…</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-14 h-14 bg-input rounded-2xl flex items-center justify-center">
                  <Package className="w-7 h-7 text-gray-600" />
                </div>
                <div>
                  <p className="text-foreground font-semibold mb-1">No products found</p>
                  <p className="text-muted-foreground text-sm">
                    {search || categoryFilter ? 'Try adjusting your search or filters.' : 'Add your first product to get started.'}
                  </p>
                </div>
                {!search && !categoryFilter && (
                  <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-foreground text-sm font-medium rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sr No</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">SKU</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product Name</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock Level</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unit Price</th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cost</th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reorder Pt.</th>
                    <th className="px-4 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {pageProducts.map((product, index) => {
                    const status = getStockStatus(product);
                    const barColor = getStockBarColor(status);
                    const barWidth = getStockBarWidth(product);

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-input/40 transition-colors group"
                      >
                        {/* Sr No */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-sm text-foreground">
                          {index + 1}
                        </td>

                        {/* SKU */}
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                            {product.sku}
                          </span>
                        </td>

                        {/* Product Name */}
                        <td className="px-4 py-3.5">
                          <div>
                            <p className="text-foreground font-medium text-sm leading-tight line-clamp-1">{product.name}</p>
                            {product.barcode && (
                              <p className="text-gray-600 text-xs mt-0.5">#{product.barcode}</p>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3.5">
                          <span className="text-muted-foreground text-xs bg-input px-2 py-0.5 rounded-full border border-input">
                            {product.categoryName ?? '—'}
                          </span>
                        </td>

                        {/* Stock Level */}
                        <td className="px-4 py-3.5">
                          <div className="min-w-[120px]">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-foreground font-semibold text-sm">
                                {product.quantityInStock.toLocaleString()}
                              </span>
                              <span className="text-gray-600 text-xs">{product.unitOfMeasure ?? 'pcs'}</span>
                            </div>
                            <div className="h-1.5 bg-input rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${barColor}`}
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                            <p className="text-gray-600 text-[10px] mt-1">
                              Min: {product.minimumStockLevel} · Reorder: {product.reorderPoint}
                            </p>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-3.5">
                          <StatusBadge status={status} />
                        </td>

                        {/* Unit Price */}
                        <td className="px-4 py-3.5 text-right">
                          <span className="text-foreground font-medium">{formatCurrency(product.unitPrice)}</span>
                        </td>

                        {/* Cost Price */}
                        <td className="px-4 py-3.5 text-right">
                          <span className="text-muted-foreground">{formatCurrency(product.costPrice)}</span>
                        </td>

                        {/* Reorder Point */}
                        <td className="px-4 py-3.5 text-right">
                          <span className="text-muted-foreground">{product.reorderPoint}</span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                              title="Edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(product)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
            </div>

        {/* Bottom info bar */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-6 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-1.5 bg-emerald-400 rounded-full" />
              <span>In Stock (above reorder point)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1.5 bg-amber-400 rounded-full" />
              <span>Low Stock (at/below reorder point)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1.5 bg-red-400 rounded-full" />
              <span>Critical / Out of Stock</span>
            </div>
          </div>
        </div>
      </div>

      <AiFab
        moduleName="Inventory"
        data={pageProducts}
        suggestedPrompts={[
          'How many products are low stock?',
          'How many products are out of stock?',
          'List the top 5 products by unit price',
          'Summarize total inventory value',
        ]}
      />
      </div>

      {/* Modals */}
      <ProductModal
        open={modalOpen}
        mode={modalMode}
        product={editingProduct}
        categories={categories}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <DeleteDialog
        open={deleteOpen}
        product={deletingProduct}
        onClose={() => { setDeleteOpen(false); setDeletingProduct(undefined); }}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />
    </AppLayout>
  );
}
