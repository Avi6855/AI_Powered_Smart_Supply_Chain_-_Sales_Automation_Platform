'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { AiFab } from '@/components/ai/AiFab';
import { orderApi as ordersApi } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Ban,
  Bot,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
type PaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL' | 'REFUNDED';

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  notes: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt?: string;
}

interface PagedResponse {
  content: Order[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

interface OrderFormData {
  orderNumber: string;
  customerName: string;
  totalAmount: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  notes: string;
  shippingAddress: string;
  status: OrderStatus;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'createdAt,desc', label: 'Newest First' },
  { value: 'createdAt,asc', label: 'Oldest First' },
  { value: 'orderNumber,asc', label: 'Order # (A-Z)' },
  { value: 'orderNumber,desc', label: 'Order # (Z-A)' },
  { value: 'totalAmount,desc', label: 'Highest Amount' },
  { value: 'totalAmount,asc', label: 'Lowest Amount' },
];

const PAYMENT_METHODS = ['Wire Transfer', 'Bank Transfer', 'Credit Card', 'Invoice', 'Cash', 'UPI', 'Cheque'];
const PAYMENT_STATUSES: PaymentStatus[] = ['UNPAID', 'PARTIAL', 'PAID', 'REFUNDED'];
const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

// ─── Helper Functions ─────────────────────────────────────────────────────────

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${year}-${rand}`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function normalizeOrder(raw: any): Order {
  return {
    id: raw?.id,
    orderNumber: raw?.orderNumber ?? raw?.order_number ?? '',
    customerName: raw?.customerName ?? raw?.customer_name ?? '',
    status: (raw?.status ?? 'PENDING') as OrderStatus,
    totalAmount: Number(raw?.totalAmount ?? raw?.total_amount ?? 0),
    paymentStatus: (raw?.paymentStatus ?? raw?.payment_status ?? 'UNPAID') as PaymentStatus,
    paymentMethod: raw?.paymentMethod ?? raw?.payment_method ?? '',
    notes: raw?.notes ?? '',
    shippingAddress: raw?.shippingAddress ?? raw?.shipping_address ?? '',
    createdAt: raw?.createdAt ?? raw?.created_at ?? new Date().toISOString(),
    updatedAt: raw?.updatedAt ?? raw?.updated_at ?? raw?.updated_at,
  };
}

function extractPagedOrders(payload: any): { items: Order[]; totalElements: number; totalPages: number } {
  const data = payload?.data?.data ?? payload?.data ?? payload;
  const content = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
  return {
    items: content.map(normalizeOrder),
    totalElements: data?.totalElements ?? data?.total_elements ?? content.length,
    totalPages: data?.totalPages ?? data?.total_pages ?? 1,
  };
}

// ─── Badge Components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const config: Record<OrderStatus, { cls: string; icon: React.ReactNode; label: string }> = {
    PENDING: {
      cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      icon: <Clock className="h-3 w-3" />,
      label: 'Pending',
    },
    PROCESSING: {
      cls: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
      icon: <Package className="h-3 w-3" />,
      label: 'Processing',
    },
    SHIPPED: {
      cls: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
      icon: <Truck className="h-3 w-3" />,
      label: 'Shipped',
    },
    DELIVERED: {
      cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      icon: <CheckCircle2 className="h-3 w-3" />,
      label: 'Delivered',
    },
    CANCELLED: {
      cls: 'bg-red-500/15 text-red-400 border border-red-500/30',
      icon: <Ban className="h-3 w-3" />,
      label: 'Cancelled',
    },
  };
  const { cls, icon, label } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {icon}
      {label}
    </span>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const config: Record<PaymentStatus, string> = {
    PAID: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    UNPAID: 'bg-red-500/15 text-red-400 border border-red-500/30',
    PARTIAL: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    REFUNDED: 'bg-slate-500/15 text-muted-foreground border border-slate-500/30',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${config[status]}`}>
      {status}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  colorCls,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  colorCls: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-5 flex items-center gap-4 hover:bg-white/[0.06] transition-colors">
      <div className={`p-3 rounded-lg ${colorCls}`}>{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─── Order Form Modal ─────────────────────────────────────────────────────────

interface OrderModalProps {
  mode: 'add' | 'edit' | 'view';
  order?: Order;
  onClose: () => void;
  onSaved: () => void;
}

function OrderModal({ mode, order, onClose, onSaved }: OrderModalProps) {
  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  const [form, setForm] = useState<OrderFormData>({
    orderNumber: order?.orderNumber ?? generateOrderNumber(),
    customerName: order?.customerName ?? '',
    totalAmount: order?.totalAmount?.toString() ?? '',
    paymentMethod: order?.paymentMethod ?? 'Wire Transfer',
    paymentStatus: order?.paymentStatus ?? 'UNPAID',
    notes: order?.notes ?? '',
    shippingAddress: order?.shippingAddress ?? '',
    status: order?.status ?? 'PENDING',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof OrderFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof OrderFormData, string>> = {};
    if (!form.orderNumber.trim()) newErrors.orderNumber = 'Order number is required';
    if (!form.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!form.totalAmount || isNaN(parseFloat(form.totalAmount)) || parseFloat(form.totalAmount) < 0)
      newErrors.totalAmount = 'Valid total amount is required';
    if (!form.shippingAddress.trim()) newErrors.shippingAddress = 'Shipping address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const payload = {
      orderNumber: form.orderNumber.trim(),
      customerName: form.customerName.trim(),
      totalAmount: parseFloat(form.totalAmount),
      paymentMethod: form.paymentMethod,
      paymentStatus: form.paymentStatus,
      notes: form.notes.trim(),
      shippingAddress: form.shippingAddress.trim(),
      status: form.status,
    };

    try {
      if (isEdit && order) {
        await ordersApi.update(order.id, payload);
        toast.success('Order updated successfully!');
      } else {
        await ordersApi.create(payload);
        toast.success('Order created successfully!');
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to save order. Please try again.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key: keyof OrderFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const inputCls = (key: keyof OrderFormData) =>
    `w-full rounded-lg border ${errors[key] ? 'border-red-500/60' : 'border-input'} bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${errors[key] ? 'focus:ring-red-500/40' : 'focus:ring-indigo-500/40'} transition-all disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={!submitting ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-input bg-background shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-input">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/30">
              <ShoppingCart className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {isView ? 'Order Details' : isEdit ? 'Edit Order' : 'Create New Order'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isView ? order?.orderNumber : isEdit ? `Editing ${order?.orderNumber}` : 'Fill in the order information below'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-lg hover:bg-white/8 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-6 space-y-5">

            {/* Row 1: Order Number + Customer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Order Number *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.orderNumber}
                    onChange={set('orderNumber')}
                    disabled={isView}
                    className={inputCls('orderNumber')}
                    placeholder="ORD-2026-0001"
                  />
                  {!isView && (
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, orderNumber: generateOrderNumber() }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Auto
                    </button>
                  )}
                </div>
                {errors.orderNumber && <p className="mt-1 text-xs text-red-400">{errors.orderNumber}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Customer Name *</label>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={set('customerName')}
                  disabled={isView}
                  className={inputCls('customerName')}
                  placeholder="Enter customer name"
                />
                {errors.customerName && <p className="mt-1 text-xs text-red-400">{errors.customerName}</p>}
              </div>
            </div>

            {/* Row 2: Total Amount + Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Total Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.totalAmount}
                  onChange={set('totalAmount')}
                  disabled={isView}
                  className={inputCls('totalAmount')}
                  placeholder="0.00"
                />
                {errors.totalAmount && <p className="mt-1 text-xs text-red-400">{errors.totalAmount}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Payment Method</label>
                <select value={form.paymentMethod} onChange={set('paymentMethod')} disabled={isView} className={inputCls('paymentMethod')}>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Payment Status + Order Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Payment Status</label>
                <select value={form.paymentStatus} onChange={set('paymentStatus')} disabled={isView} className={inputCls('paymentStatus')}>
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Order Status</label>
                <select value={form.status} onChange={set('status')} disabled={isView} className={inputCls('status')}>
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Shipping Address *</label>
              <textarea
                value={form.shippingAddress}
                onChange={set('shippingAddress')}
                disabled={isView}
                rows={2}
                className={`${inputCls('shippingAddress')} resize-none`}
                placeholder="Full shipping address..."
              />
              {errors.shippingAddress && <p className="mt-1 text-xs text-red-400">{errors.shippingAddress}</p>}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notes</label>
              <textarea
                value={form.notes}
                onChange={set('notes')}
                disabled={isView}
                rows={2}
                className={`${inputCls('notes')} resize-none`}
                placeholder="Any special instructions or notes..."
              />
            </div>

            {/* View Mode: timestamps */}
            {isView && order && (
              <div className="rounded-lg border border-input bg-white/[0.02] p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-foreground">{formatDate(order.createdAt)}</span>
                </div>
                {order.updatedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="text-foreground">{formatDate(order.updatedAt)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="text-foreground font-mono">#{order.id}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!isView && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-input bg-white/[0.02]">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-lg border border-input text-sm text-slate-300 hover:bg-white/8 hover:text-foreground transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-foreground text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Order'}
              </button>
            </div>
          )}
          {isView && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-input bg-white/[0.02]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-input text-sm text-slate-300 hover:bg-white/8 hover:text-foreground transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirmation ──────────────────────────────────────────────────────

interface DeleteDialogProps {
  order: Order;
  onClose: () => void;
  onDeleted: () => void;
}

function DeleteDialog({ order, onClose, onDeleted }: DeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await ordersApi.delete(order.id);
      toast.success(`Order ${order.orderNumber} deleted.`);
      onDeleted();
      onClose();
    } catch {
      toast.error('Failed to delete order. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={!loading ? onClose : undefined} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-input bg-background p-6 shadow-2xl shadow-black/60">
        <div className="flex items-center gap-4 mb-5">
          <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30">
            <Trash2 className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Delete Order</h3>
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          </div>
        </div>

        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 mb-6">
          <p className="text-sm text-slate-300">
            Are you sure you want to delete order{' '}
            <span className="font-semibold text-foreground">{order.orderNumber}</span> for{' '}
            <span className="font-semibold text-foreground">{order.customerName}</span>?
          </p>
          <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            All order data will be permanently removed from the system.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-input text-sm text-slate-300 hover:bg-white/8 hover:text-foreground transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-foreground text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Deleting…' : 'Delete Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Inline Status Updater ────────────────────────────────────────────────────

interface StatusDropdownProps {
  order: Order;
  onUpdated: () => void;
}

function StatusDropdown({ order, onUpdated }: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const changeStatus = async (status: OrderStatus) => {
    if (status === order.status) { setOpen(false); return; }
    setLoading(true);
    setOpen(false);
    try {
      await ordersApi.updateStatus(order.id, status);
      toast.success(`Status updated to ${status}`);
      onUpdated();
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="flex items-center"
        title="Change status"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <StatusBadge status={order.status} />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 w-44 rounded-xl border border-input bg-card shadow-xl shadow-black/40 overflow-hidden py-1">
          {ORDER_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => changeStatus(s)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-white/8 transition-colors flex items-center gap-2 ${s === order.status ? 'opacity-50 cursor-default' : ''}`}
            >
              <StatusBadge status={s} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Orders Page ─────────────────────────────────────────────────────────

export default function OrdersPage() {
  // Data state
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 20;

  // UI state
  const [loading, setLoading] = useState(true);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortValue, setSortValue] = useState('createdAt,desc');

  // Modals
  const [modalState, setModalState] = useState<{ open: boolean; mode: 'add' | 'edit' | 'view'; order?: Order }>({
    open: false,
    mode: 'add',
  });
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const allRes = await ordersApi.getAll({ page: 0, size: 1000 } as any);
      const all = extractPagedOrders(allRes);
      setAllOrders(all.items);
    } catch {
      setAllOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    let list = [...allOrders];
    
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((o) => 
        (o.orderNumber?.toLowerCase() ?? '').includes(q) ||
        (o.customerName?.toLowerCase() ?? '').includes(q)
      );
    }
    
    if (statusFilter !== 'ALL') {
      list = list.filter((o) => o.status === statusFilter);
    }
    
    const [field, dir] = sortValue.split(',');
    const desc = dir === 'desc';
    list.sort((a: any, b: any) => {
      const av = a[field];
      const bv = b[field];
      if (av == null && bv == null) return 0;
      if (av == null) return desc ? 1 : -1;
      if (bv == null) return desc ? -1 : 1;
      if (typeof av === 'number' && typeof bv === 'number') return desc ? bv - av : av - bv;
      return desc ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
    });
    
    return list;
  }, [allOrders, debouncedSearch, statusFilter, sortValue]);

  const orders = filteredOrders;

  // Stats from current orders
  const stats = {
    total: allOrders.length,
    pending: allOrders.filter((o) => o.status === 'PENDING').length,
    shipped: allOrders.filter((o) => o.status === 'SHIPPED').length,
    delivered: allOrders.filter((o) => o.status === 'DELIVERED').length,
  };

  const openAdd = () => setModalState({ open: true, mode: 'add' });
  const openEdit = (o: Order) => setModalState({ open: true, mode: 'edit', order: o });
  const openView = (o: Order) => setModalState({ open: true, mode: 'view', order: o });
  const closeModal = () => setModalState({ open: false, mode: 'add' });

  const startIndex = currentPage * PAGE_SIZE + 1;
  const endIndex = Math.min((currentPage + 1) * PAGE_SIZE, totalElements);

  return (
    <AppLayout>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1d2e',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <div className="flex flex-col gap-6 min-h-full">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30">
              <ShoppingCart className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Orders</h1>
              <p className="text-sm text-muted-foreground">Manage and track all customer orders</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-foreground text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
            >
              <Plus className="h-4 w-4" />
              Add Order
            </button>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Orders"
            value={stats.total}
            icon={<ShoppingCart className="h-5 w-5 text-indigo-400" />}
            colorCls="bg-indigo-500/15 border border-indigo-500/20"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={<Clock className="h-5 w-5 text-amber-400" />}
            colorCls="bg-amber-500/15 border border-amber-500/20"
          />
          <StatCard
            label="Shipped"
            value={stats.shipped}
            icon={<Truck className="h-5 w-5 text-purple-400" />}
            colorCls="bg-purple-500/15 border border-purple-500/20"
          />
          <StatCard
            label="Delivered"
            value={stats.delivered}
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
            colorCls="bg-emerald-500/15 border border-emerald-500/20"
          />
        </div>

        <div className="rounded-2xl border border-input bg-white/[0.02] backdrop-blur-sm overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-5 border-b border-input">
            {/* Search */}
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders or customers…"
                className="w-full rounded-xl border border-input bg-input pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
                  className="rounded-xl border border-input bg-input pl-9 pr-8 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all appearance-none cursor-pointer"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-[#1a1d2e]">{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <select
                  value={sortValue}
                  onChange={(e) => { setSortValue(e.target.value); setCurrentPage(0); }}
                  className="rounded-xl border border-input bg-input pl-9 pr-8 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-[#1a1d2e]">{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Refresh */}
              <button
                onClick={fetchOrders}
                disabled={loading}
                className="p-2.5 rounded-xl border border-input bg-input text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                  <ShoppingCart className="absolute inset-0 m-auto h-5 w-5 text-indigo-400" />
                </div>
                <p className="text-sm text-muted-foreground">Loading orders…</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="p-4 rounded-2xl bg-slate-500/10 border border-slate-500/20">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-base font-medium text-foreground">No orders found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {search || statusFilter !== 'ALL' ? 'Try adjusting your search or filters.' : 'Create your first order to get started.'}
                  </p>
                </div>
                {!search && statusFilter === 'ALL' && (
                  <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-foreground text-sm hover:bg-indigo-500 transition-colors">
                    <Plus className="h-4 w-4" />
                    Add Order
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-input bg-white/[0.02]">
                    <th className="h-11 px-5 align-middle text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Sr No</th>
                    <th className="h-11 px-5 align-middle text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Order #</th>
                    <th className="h-11 px-5 align-middle text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Customer</th>
                    <th className="h-11 px-5 align-middle text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="h-11 px-5 align-middle text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap text-right">Total Amount</th>
                    <th className="h-11 px-5 align-middle text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Payment</th>
                    <th className="h-11 px-5 align-middle text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Created</th>
                    <th className="h-11 px-5 align-middle text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((order, index) => (
                    <tr key={order.id} className="hover:bg-white/[0.03] transition-colors group">
                      {/* Sr No */}
                      <td className="px-5 py-4 align-middle whitespace-nowrap text-sm text-foreground">
                        {index + 1}
                      </td>
                      {/* Order # */}
                      <td className="px-5 py-4 align-middle whitespace-nowrap">
                        <span className="font-mono text-sm font-semibold text-indigo-400">{order.orderNumber}</span>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-input flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                            {order.customerName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-foreground font-medium truncate max-w-[180px]">{order.customerName}</span>
                        </div>
                      </td>

                      {/* Status — clickable dropdown */}
                      <td className="px-5 py-4 align-middle whitespace-nowrap">
                        <StatusDropdown order={order} onUpdated={fetchOrders} />
                      </td>

                      {/* Total Amount */}
                      <td className="px-5 py-4 align-middle text-right whitespace-nowrap">
                        <span className="font-semibold text-foreground">{formatCurrency(order.totalAmount)}</span>
                      </td>

                      {/* Payment Status */}
                      <td className="px-5 py-4 align-middle whitespace-nowrap">
                        <PaymentBadge status={order.paymentStatus} />
                      </td>

                      {/* Created Date */}
                      <td className="px-5 py-4 align-middle whitespace-nowrap">
                        <span className="text-muted-foreground">{formatDate(order.createdAt)}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 align-middle">
                        <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openView(order)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEdit(order)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(order)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>

      </div>
      </div>

      <AiFab
        moduleName="Orders"
        data={orders}
        suggestedPrompts={[
          'How many orders are in each status?',
          'List top 10 orders by total amount',
          'How many orders are unpaid or partial?',
          'Summarize total revenue from all orders',
        ]}
      />

      {/* ── Modals ── */}
      {modalState.open && (
        <OrderModal
          mode={modalState.mode}
          order={modalState.order}
          onClose={closeModal}
          onSaved={fetchOrders}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          order={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={fetchOrders}
        />
      )}
    </AppLayout>
  );
}
