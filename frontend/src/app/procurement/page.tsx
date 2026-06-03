'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { AiFab } from '@/components/ai/AiFab';
import { generateDummyPurchaseOrders, generateDummySuppliers, loadOrCreate, save } from '@/lib/dummyData';
import { useDebounce } from '@/hooks/useDebounce';
import { procurementApi as procurementHttpApi, supplierApi as supplierHttpApi } from '@/lib/api';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Check,
  X,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  DollarSign,
  Clock,
  TrendingUp,
  AlertCircle,
  Loader2,
  Bot,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type POStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';

interface POItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierId: number;
  supplierName: string;
  status: POStatus;
  items: POItem[];
  totalAmount: number;
  expectedDelivery: string;
  notes?: string;
  shippingAddress?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Supplier {
  id: number;
  name: string;
  email: string;
  contactPerson: string;
}

interface FormPOItem {
  productName: string;
  quantity: string;
  unitPrice: string;
}

interface POFormData {
  poNumber: string;
  supplierId: string;
  expectedDelivery: string;
  notes: string;
  shippingAddress: string;
  items: FormPOItem[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const DUMMY_COUNT = 120;
const SUPPLIERS_KEY = 'dummy_procurement_suppliers_v1';
const POS_KEY = 'dummy_procurement_pos_v1';

function readSuppliers(): Supplier[] {
  const base = loadOrCreate(SUPPLIERS_KEY, () => generateDummySuppliers(DUMMY_COUNT) as any[]);
  return (base as any[]).map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    contactPerson: s.contactPerson ?? 'N/A',
  })) as Supplier[];
}

function writeSuppliers(list: Supplier[]) {
  save(SUPPLIERS_KEY, list);
}

function readPOs(): PurchaseOrder[] {
  return loadOrCreate(POS_KEY, () => {
    const ss = readSuppliers().map((s) => ({ id: s.id, name: s.name }));
    return generateDummyPurchaseOrders(DUMMY_COUNT, ss) as unknown as PurchaseOrder[];
  });
}

function writePOs(list: PurchaseOrder[]) {
  save(POS_KEY, list);
}

const supplierApi = {
  getAll: async (_params?: any) => {
    const list = readSuppliers();
    return { content: list, totalElements: list.length, totalPages: 1, number: 0, size: list.length };
  },
};

const procurementApi = {
  getAll: async (params?: { page?: number; size?: number; search?: string; status?: string; sort?: string; sortDir?: 'asc' | 'desc' }) => {
    const page = params?.page ?? 0;
    const size = params?.size ?? 10;
    const search = params?.search?.trim();
    const status = params?.status?.trim();
    const sortBy = params?.sort ?? 'created_at';
    const sortDir = params?.sortDir ?? 'desc';

    let list = readPOs();
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((po) => `${po.poNumber} ${po.supplierName} ${po.createdBy}`.toLowerCase().includes(q));
    }
    if (status && status !== 'ALL') list = list.filter((po) => po.status === (status as POStatus));

    list.sort((a, b) => {
      let va: any = '';
      let vb: any = '';
      if (sortBy === 'po_number') { va = a.poNumber; vb = b.poNumber; }
      else if (sortBy === 'total_amount') { va = a.totalAmount; vb = b.totalAmount; }
      else if (sortBy === 'expected_delivery') { va = a.expectedDelivery; vb = b.expectedDelivery; }
      else { va = a.createdAt; vb = b.createdAt; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    const totalElements = list.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / size));
    const content = list.slice(page * size, page * size + size);
    return { content, totalElements, totalPages, number: page, size };
  },

  create: async (payload: any) => {
    const list = readPOs();
    const id = list.reduce((m, p) => Math.max(m, p.id), 0) + 1;
    const now = new Date().toISOString();
    const supplier = readSuppliers().find((s) => s.id === payload.supplierId);
    const entity: PurchaseOrder = {
      id,
      poNumber: payload.poNumber,
      supplierId: payload.supplierId,
      supplierName: supplier?.name ?? payload.supplierName ?? 'Supplier',
      status: payload.status ?? 'PENDING',
      items: payload.items ?? [],
      totalAmount: payload.totalAmount ?? 0,
      expectedDelivery: payload.expectedDelivery,
      notes: payload.notes,
      shippingAddress: payload.shippingAddress,
      createdBy: payload.createdBy ?? 'Admin',
      createdAt: now,
      updatedAt: now,
    };
    const updated = [entity, ...list];
    writePOs(updated);
    return entity;
  },

  update: async (id: number, payload: any) => {
    const supplier = payload.supplierId ? readSuppliers().find((s) => s.id === payload.supplierId) : undefined;
    const list = readPOs();
    const updated = list.map((po) =>
      po.id === id
        ? { ...po, ...payload, supplierName: supplier?.name ?? po.supplierName, updatedAt: new Date().toISOString() }
        : po
    );
    writePOs(updated);
  },

  delete: async (id: number) => {
    const list = readPOs();
    writePOs(list.filter((po) => po.id !== id));
  },

  approve: async (id: number) => {
    const list = readPOs();
    const updated: PurchaseOrder[] = list.map((po) =>
      po.id === id ? { ...po, status: 'APPROVED' as POStatus, updatedAt: new Date().toISOString() } : po
    );
    writePOs(updated);
  },
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'ORDERED', label: 'Ordered' },
  { value: 'RECEIVED', label: 'Received' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'poNumber', label: 'PO Number' },
  { value: 'totalAmount', label: 'Total Amount' },
  { value: 'createdAt', label: 'Created Date' },
  { value: 'expectedDelivery', label: 'Expected Delivery' },
];

const STATUS_STYLES: Record<POStatus, { bg: string; text: string; dot: string }> = {
  DRAFT:     { bg: 'bg-slate-500/15',  text: 'text-foreground',  dot: 'bg-slate-400'  },
  PENDING:   { bg: 'bg-amber-500/15',  text: 'text-amber-400',  dot: 'bg-amber-400'  },
  APPROVED:  { bg: 'bg-blue-500/15',   text: 'text-blue-400',   dot: 'bg-blue-400'   },
  ORDERED:   { bg: 'bg-violet-500/15', text: 'text-violet-400', dot: 'bg-violet-400' },
  RECEIVED:  { bg: 'bg-emerald-500/15',text: 'text-emerald-400',dot: 'bg-emerald-400'},
  CANCELLED: { bg: 'bg-red-500/15',    text: 'text-red-400',    dot: 'bg-red-400'    },
};

// ─── Helper Utilities ─────────────────────────────────────────────────────────

function generatePONumber(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `PO-${year}-${seq}`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getLeadDays(createdAt: string, expectedDelivery: string): number {
  if (!createdAt || !expectedDelivery) return 0;
  const diff = new Date(expectedDelivery).getTime() - new Date(createdAt).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

// ─── Toast Component ──────────────────────────────────────────────────────────

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 shadow-2xl border text-sm font-medium backdrop-blur-md transition-all duration-300 ${
            t.type === 'success'
              ? 'bg-emerald-900/80 border-emerald-700 text-emerald-100'
              : t.type === 'error'
              ? 'bg-red-900/80 border-red-700 text-red-100'
              : 'bg-blue-900/80 border-blue-700 text-blue-100'
          }`}
        >
          {t.type === 'success' ? (
            <Check className="h-4 w-4 flex-shrink-0 text-emerald-400" />
          ) : t.type === 'error' ? (
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
          ) : (
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-blue-400" />
          )}
          <span>{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="ml-2 opacity-70 hover:opacity-100">
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: POStatus }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-white/[0.03] p-5 backdrop-blur-sm">
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${color} opacity-10 blur-2xl`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${color} bg-opacity-20`}>
          <Icon className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Modal ─────────────────────────────────────────────────────────────

function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  confirmClass,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
          <Trash2 className="h-6 w-6 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-border bg-input px-4 py-2 text-sm font-medium text-foreground hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-foreground transition-colors disabled:opacity-50 ${confirmClass}`}
          >
            {loading && <Loader2 className="h-3 w-3 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PO Form Modal ─────────────────────────────────────────────────────────────

function POFormModal({
  open,
  mode,
  initialData,
  suppliers,
  onClose,
  onSubmit,
  loading,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  initialData?: PurchaseOrder | null;
  suppliers: Supplier[];
  onClose: () => void;
  onSubmit: (data: POFormData) => void;
  loading: boolean;
}) {
  const emptyItem: FormPOItem = { productName: '', quantity: '1', unitPrice: '0' };

  const [form, setForm] = useState<POFormData>({
    poNumber: generatePONumber(),
    supplierId: '',
    expectedDelivery: '',
    notes: '',
    shippingAddress: '',
    items: [{ ...emptyItem }],
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  // Sync form when editing
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        setForm({
          poNumber: initialData.poNumber,
          supplierId: String(initialData.supplierId),
          expectedDelivery: initialData.expectedDelivery ?? '',
          notes: initialData.notes ?? '',
          shippingAddress: initialData.shippingAddress ?? '',
          items: initialData.items.length > 0
            ? initialData.items.map((it) => ({
                productName: it.productName,
                quantity: String(it.quantity),
                unitPrice: String(it.unitPrice),
              }))
            : [{ ...emptyItem }],
        });
      } else {
        setForm({
          poNumber: generatePONumber(),
          supplierId: '',
          expectedDelivery: '',
          notes: '',
          shippingAddress: '',
          items: [{ ...emptyItem }],
        });
      }
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, initialData]);

  const calcTotal = (): number =>
    form.items.reduce((sum, it) => {
      const q = parseFloat(it.quantity) || 0;
      const p = parseFloat(it.unitPrice) || 0;
      return sum + q * p;
    }, 0);

  const updateItem = (idx: number, field: keyof FormPOItem, value: string) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, items };
    });
  };

  const addItem = () => setForm((prev) => ({ ...prev, items: [...prev.items, { ...emptyItem }] }));

  const removeItem = (idx: number) =>
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  const validate = (): boolean => {
    const errs: Partial<Record<string, string>> = {};
    if (!form.supplierId) errs.supplierId = 'Supplier is required';
    if (!form.expectedDelivery) errs.expectedDelivery = 'Expected delivery date is required';
    if (!form.shippingAddress.trim()) errs.shippingAddress = 'Shipping address is required';
    form.items.forEach((it, i) => {
      if (!it.productName.trim()) errs[`item_name_${i}`] = 'Product name required';
      if (!it.quantity || parseFloat(it.quantity) <= 0) errs[`item_qty_${i}`] = 'Qty > 0';
      if (!it.unitPrice || parseFloat(it.unitPrice) <= 0) errs[`item_price_${i}`] = 'Price > 0';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              {mode === 'create' ? 'Create Purchase Order' : 'Edit Purchase Order'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Row 1: PO Number + Supplier */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">PO Number</label>
              <input
                type="text"
                value={form.poNumber}
                readOnly
                className="w-full rounded-xl border border-border bg-input px-3 py-2.5 text-sm text-foreground cursor-not-allowed"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Supplier <span className="text-red-400">*</span>
              </label>
              <select
                value={form.supplierId}
                onChange={(e) => setForm((p) => ({ ...p, supplierId: e.target.value }))}
                className={`w-full rounded-xl border bg-input px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.supplierId ? 'border-red-500' : 'border-border'
                }`}
              >
                <option value="">Select a supplier...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.supplierId && <p className="mt-1 text-xs text-red-400">{errors.supplierId}</p>}
            </div>
          </div>

          {/* Row 2: Expected Delivery + Shipping Address */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Expected Delivery <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.expectedDelivery}
                onChange={(e) => setForm((p) => ({ ...p, expectedDelivery: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full rounded-xl border bg-input px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.expectedDelivery ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.expectedDelivery && <p className="mt-1 text-xs text-red-400">{errors.expectedDelivery}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Shipping Address <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.shippingAddress}
                onChange={(e) => setForm((p) => ({ ...p, shippingAddress: e.target.value }))}
                placeholder="Enter delivery address..."
                className={`w-full rounded-xl border bg-input px-3 py-2.5 text-sm text-foreground placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.shippingAddress ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.shippingAddress && <p className="mt-1 text-xs text-red-400">{errors.shippingAddress}</p>}
            </div>
          </div>

          {/* Items Table */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Order Items <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/30 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Item
              </button>
            </div>

            <div className="rounded-xl border border-border overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 bg-input px-3 py-2 text-xs font-medium text-muted-foreground">
                <div className="col-span-5">Product Name</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-3 text-right">Unit Price</div>
                <div className="col-span-1 text-right">Total</div>
                <div className="col-span-1" />
              </div>

              {/* Items */}
              <div className="divide-y divide-white/5">
                {form.items.map((item, idx) => {
                  const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
                  return (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center px-3 py-2.5">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={item.productName}
                          onChange={(e) => updateItem(idx, 'productName', e.target.value)}
                          placeholder="Product name..."
                          className={`w-full rounded-lg border bg-input px-2.5 py-1.5 text-sm text-foreground placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                            errors[`item_name_${idx}`] ? 'border-red-500' : 'border-border'
                          }`}
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                          className={`w-full rounded-lg border bg-input px-2.5 py-1.5 text-sm text-right text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                            errors[`item_qty_${idx}`] ? 'border-red-500' : 'border-border'
                          }`}
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                          className={`w-full rounded-lg border bg-input px-2.5 py-1.5 text-sm text-right text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                            errors[`item_price_${idx}`] ? 'border-red-500' : 'border-border'
                          }`}
                        />
                      </div>
                      <div className="col-span-1 text-right text-sm font-medium text-foreground">
                        {formatCurrency(lineTotal)}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        {form.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-500/20 hover:text-red-400 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="flex items-center justify-end gap-3 border-t border-border bg-input px-3 py-3">
                <span className="text-sm font-medium text-muted-foreground">Grand Total:</span>
                <span className="text-lg font-bold text-blue-400">{formatCurrency(calcTotal())}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Notes (Optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={3}
              placeholder="Add any additional notes or instructions..."
              className="w-full rounded-xl border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-border bg-input px-5 py-2.5 text-sm font-medium text-foreground hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-foreground hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create Purchase Order' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function ProcurementPage() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [allPos, setAllPos] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<PurchaseOrder | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [approveTarget, setApproveTarget] = useState<PurchaseOrder | null>(null);
  const [approveLoading, setApproveLoading] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);

  // ── Toast Helpers ──────────────────────────────────────────────────────────
  const showToast = useCallback((type: Toast['type'], message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Load Suppliers ─────────────────────────────────────────────────────────
  useEffect(() => {
    supplierHttpApi
      .getAll({ page: 0, size: 1000 } as any)
      .then((res) => {
        const data = (res as any)?.data?.data ?? (res as any)?.data ?? res;
        const items = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
        setSuppliers(items as Supplier[]);
      })
      .catch(() => setSuppliers([]));
  }, []);

  // ── Load Purchase Orders ───────────────────────────────────────────────────
  const fetchPOs = useCallback(async () => {
    setLoading(true);
    try {
      const allRes = await procurementHttpApi.getAll({ page: 0, size: 1000 } as any);
      
      const normalize = (po: any): PurchaseOrder => ({
        ...po,
        items: Array.isArray(po?.items) ? po.items : [],
        shippingAddress: po?.shippingAddress ?? '',
        status: po?.status ?? 'DRAFT',
        totalAmount: Number(po?.totalAmount ?? 0),
      });

      const allData = (allRes as any)?.data?.data ?? (allRes as any)?.data ?? allRes;
      const allItems: PurchaseOrder[] = Array.isArray(allData?.content) ? allData.content : Array.isArray(allData) ? allData : [];
      setAllPos(allItems.map(normalize));
    } catch {
      setAllPos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredPOs = useMemo(() => {
    let list = [...allPos];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((p) => 
        (p.poNumber?.toLowerCase() ?? '').includes(q) ||
        (p.supplierName?.toLowerCase() ?? '').includes(q) ||
        (p.createdBy?.toLowerCase() ?? '').includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      list = list.filter((p) => p.status === statusFilter);
    }

    list.sort((a: any, b: any) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      const desc = sortDir === 'desc';
      if (av == null && bv == null) return 0;
      if (av == null) return desc ? 1 : -1;
      if (bv == null) return desc ? -1 : 1;
      if (typeof av === 'number' && typeof bv === 'number') return desc ? bv - av : av - bv;
      return desc ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
    });

    return list;
  }, [allPos, debouncedSearch, statusFilter, sortBy, sortDir]);

  const pos = filteredPOs;

  useEffect(() => {
    fetchPOs();
  }, [fetchPOs]);

  // Reset to page 0 on filter/search change
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, statusFilter, sortBy]);

  // ── Summary Stats ──────────────────────────────────────────────────────────
  const totalPOs = allPos.length;
  const pendingCount = allPos.filter((p) => p.status === 'PENDING').length;

  const thisMonth = new Date();
  const monthSpend = allPos
    .filter((po) => {
      const d = new Date(po.createdAt);
      return d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear();
    })
    .reduce((sum, po) => sum + po.totalAmount, 0);

  const avgLead =
    allPos.length > 0
      ? Math.round(
          allPos.reduce((sum, po) => sum + getLeadDays(po.createdAt, po.expectedDelivery), 0) / allPos.length
        )
      : 0;

  // ── Create / Edit Handlers ─────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setFormMode('create');
    setEditingPO(null);
    setShowForm(true);
  };

  const handleOpenEdit = (po: PurchaseOrder) => {
    setFormMode('edit');
    setEditingPO(po);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: POFormData) => {
    setFormLoading(true);
    const totalAmount = data.items.reduce((sum, it) => sum + (parseFloat(it.quantity) || 0) * (parseFloat(it.unitPrice) || 0), 0);
    const payload = {
      poNumber: data.poNumber,
      supplierId: parseInt(data.supplierId),
      expectedDelivery: data.expectedDelivery,
      notes: data.notes,
      status: 'SUBMITTED',
      totalAmount,
    };

    try {
      if (formMode === 'create') {
        await procurementHttpApi.create(payload);
        showToast('success', `Purchase Order ${data.poNumber} created successfully!`);
      } else if (editingPO) {
        await procurementHttpApi.update(editingPO.id, payload);
        showToast('success', `Purchase Order ${data.poNumber} updated successfully!`);
      }
      setShowForm(false);
      fetchPOs();
    } catch {
      showToast('error', 'Failed to save purchase order. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete Handler ─────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await procurementHttpApi.delete(deleteTarget.id);
      showToast('success', `Purchase Order ${deleteTarget.poNumber} deleted.`);
      setDeleteTarget(null);
      fetchPOs();
    } catch {
      showToast('error', 'Failed to delete purchase order.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Approve Handler ────────────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!approveTarget) return;
    setApproveLoading(true);
    try {
      await procurementHttpApi.approve(approveTarget.id);
      showToast('success', `Purchase Order ${approveTarget.poNumber} approved!`);
      setApproveTarget(null);
      fetchPOs();
    } catch {
      showToast('error', 'Failed to approve purchase order.');
    } finally {
      setApproveLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="flex flex-col gap-6 pb-10">
        {/* ── Page Header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Procurement
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage purchase orders and supplier procurement workflows
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-foreground shadow-lg shadow-blue-500/20 hover:bg-blue-500 active:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create PO
            </button>
          </div>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={FileText}
            label="Total Purchase Orders"
            value={String(totalPOs)}
            sub={`${pos.filter((p) => p.status === 'RECEIVED').length} received this view`}
            color="bg-blue-500"
          />
          <SummaryCard
            icon={Clock}
            label="Pending Approval"
            value={String(pendingCount)}
            sub="Awaiting review"
            color="bg-amber-500"
          />
          <SummaryCard
            icon={DollarSign}
            label="This Month's Spend"
            value={formatCurrency(monthSpend)}
            sub={new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            color="bg-emerald-500"
          />
          <SummaryCard
            icon={TrendingUp}
            label="Avg Lead Time"
            value={`${avgLead} days`}
            sub="Average across all POs"
            color="bg-violet-500"
          />
        </div>

        {/* ── Filters & Search ── */}
        <div className="rounded-2xl border border-border bg-white/[0.03] p-4 backdrop-blur-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by PO number, supplier, created by..."
                className="w-full rounded-xl border border-border bg-input py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-border bg-input px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-border bg-input px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    Sort: {o.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                className="flex items-center justify-center rounded-xl border border-border bg-input p-2.5 text-muted-foreground hover:text-foreground transition-colors"
                title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
              >
                <TrendingUp
                  className={`h-4 w-4 transition-transform duration-200 ${sortDir === 'desc' ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Status Pill Filters */}
          <div className="mt-3 flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((o) => {
              const isActive = statusFilter === o.value;
              return (
                <button
                  key={o.value}
                  onClick={() => setStatusFilter(o.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-foreground shadow-md shadow-blue-500/20'
                      : 'border border-border bg-input text-muted-foreground hover:bg-white/10 hover:text-foreground'
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white/[0.03] backdrop-blur-sm overflow-hidden">
        {/* ── Table ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              <p className="text-sm text-muted-foreground">Loading purchase orders...</p>
            </div>
          ) : pos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-input">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">No purchase orders found</p>
              <p className="text-sm text-muted-foreground">
                {debouncedSearch || statusFilter !== 'ALL'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first purchase order to get started'}
              </p>
              {!debouncedSearch && statusFilter === 'ALL' && (
                <button
                  onClick={handleOpenCreate}
                  className="mt-2 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-foreground hover:bg-blue-500 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create Purchase Order
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {[
                      'Sr No',
                      'PO Number',
                      'Supplier',
                      'Status',
                      'Total Amount',
                      'Items',
                      'Expected Delivery',
                      'Created By',
                      'Actions',
                    ].map((h) => (
                      <th
                        key={h}
                        className={`h-11 px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground ${
                          h === 'Actions' ? 'text-right' : ''
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {pos.map((po, index) => (
                    <tr
                      key={po.id}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Sr No */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-sm text-foreground">
                        {index + 1}
                      </td>

                      {/* PO Number */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                            <FileText className="h-4 w-4 text-blue-400" />
                          </div>
                          <span className="font-semibold text-foreground">{po.poNumber}</span>
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="font-medium text-foreground">{po.supplierName}</p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={po.status} />
                      </td>

                      {/* Total Amount */}
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-emerald-400">
                          {formatCurrency(po.totalAmount)}
                        </span>
                      </td>

                      {/* Items Count */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-input px-2.5 py-1 text-xs font-medium text-foreground">
                          <Package className="h-3 w-3" />
                          {po.items.length} item{po.items.length !== 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Expected Delivery */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-foreground">{formatDate(po.expectedDelivery)}</span>
                        </div>
                      </td>

                      {/* Created By */}
                      <td className="px-4 py-3.5">
                        <span className="text-muted-foreground">{po.createdBy}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Approve button for PENDING/DRAFT POs */}
                          {(po.status === 'PENDING' || po.status === 'DRAFT') && (
                            <button
                              onClick={() => setApproveTarget(po)}
                              title="Approve"
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(po)}
                            title="Edit"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-input text-muted-foreground hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(po)}
                            title="Delete"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-input text-muted-foreground hover:bg-red-500/20 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AiFab
        moduleName="Procurement"
        data={pos}
        suggestedPrompts={[
          'How many purchase orders are pending vs approved?',
          'List top 10 purchase orders by total amount',
          'Summarize this month spend',
          'Which suppliers appear most frequently?',
        ]}
      />

      {/* ── PO Form Modal ── */}
      <POFormModal
        open={showForm}
        mode={formMode}
        initialData={editingPO}
        suppliers={suppliers}
        onClose={() => setShowForm(false)}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />

      {/* ── Delete Confirmation ── */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Purchase Order"
        message={`Are you sure you want to delete ${deleteTarget?.poNumber}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmClass="bg-red-600 hover:bg-red-500"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      {/* ── Approve Confirmation ── */}
      <ConfirmModal
        open={!!approveTarget}
        title="Approve Purchase Order"
        message={`Approve ${approveTarget?.poNumber} from ${approveTarget?.supplierName} for ${formatCurrency(approveTarget?.totalAmount ?? 0)}?`}
        confirmLabel="Approve"
        confirmClass="bg-emerald-600 hover:bg-emerald-500"
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
        loading={approveLoading}
      />

      {/* ── Toasts ── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AppLayout>
  );
}
