"use client";
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DollarSign, Package, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import { CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, LineChart, Line } from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import { orderApi, productApi, procurementApi, shipmentApi, supplierApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [procurement, setProcurement] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [supRes, poRes, shipRes, prodRes, ordRes] = await Promise.all([
        supplierApi.getAll({ page: 0, size: 1000 } as any),
        procurementApi.getAll({ page: 0, size: 1000 } as any),
        shipmentApi.getAll({ page: 0, size: 1000 } as any),
        productApi.getAll({ page: 0, size: 1000 } as any),
        orderApi.getAll({ page: 0, size: 1000 } as any),
      ]);

      const supData = (supRes as any)?.data?.data ?? (supRes as any)?.data ?? supRes;
      setSuppliers(Array.isArray(supData?.content) ? supData.content : Array.isArray(supData) ? supData : []);

      const poData = (poRes as any)?.data?.data ?? (poRes as any)?.data ?? poRes;
      setProcurement(Array.isArray(poData?.content) ? poData.content : Array.isArray(poData) ? poData : []);

      const shipData = (shipRes as any)?.data?.data ?? (shipRes as any)?.data ?? shipRes;
      setShipments(Array.isArray(shipData?.content) ? shipData.content : Array.isArray(shipData) ? shipData : []);

      const prodData = (prodRes as any)?.data?.data ?? (prodRes as any)?.data ?? prodRes;
      setProducts(Array.isArray(prodData?.content) ? prodData.content : Array.isArray(prodData) ? prodData : []);

      const ordData = (ordRes as any)?.data?.data ?? (ordRes as any)?.data ?? ordRes;
      setOrders(Array.isArray(ordData?.content) ? ordData.content : Array.isArray(ordData) ? ordData : []);
    } catch {
      setSuppliers([]);
      setProcurement([]);
      setShipments([]);
      setProducts([]);
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('storage', fetchData);
    window.addEventListener('app-data-changed', fetchData);
    return () => {
      window.removeEventListener('storage', fetchData);
      window.removeEventListener('app-data-changed', fetchData);
    };
  }, []);

  const totalRevenue = useMemo(() => {
    return orders.reduce((s, o) => s + Number(o?.totalAmount ?? o?.total_amount ?? 0), 0);
  }, [orders]);

  const totalOrders = orders.length;

  const activeProducts = useMemo(() => {
    return products.filter((p) => (p?.isActive ?? p?.is_active ?? true) === true).length;
  }, [products]);

  const lowStockAlerts = useMemo(() => {
    return products.filter((p) => {
      const isLow = p?.isLowStock ?? p?.is_low_stock;
      if (typeof isLow === 'boolean') return isLow;
      const qty = Number(p?.quantityInStock ?? p?.quantity_in_stock ?? 0);
      const reorder = Number(p?.reorderPoint ?? p?.reorder_point ?? 0);
      const min = Number(p?.minimumStockLevel ?? p?.minimum_stock_level ?? 0);
      return qty <= reorder || qty < min;
    }).length;
  }, [products]);

  const revenueChart = useMemo(() => {
    const now = new Date();
    const months: Array<{ key: string; name: string; revenue: number; orders: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const name = d.toLocaleString('en-US', { month: 'short' });
      months.push({ key, name, revenue: 0, orders: 0 });
    }

    const byKey = new Map(months.map((m) => [m.key, m]));
    let totalBase = 0;
    for (const o of orders) {
      const created = o?.createdAt ?? o?.created_at;
      if (!created) continue;
      const d = new Date(created);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const bucket = byKey.get(key);
      const amt = Number(o?.totalAmount ?? o?.total_amount ?? 0);
      if (bucket) {
        bucket.revenue += amt;
        bucket.orders += 1;
      } else if (d < new Date(now.getFullYear(), now.getMonth() - 11, 1)) {
        totalBase += amt;
      }
    }

    let runningTotal = totalBase;
    return months.map((m) => {
      runningTotal += m.revenue;
      return {
        name: m.name,
        revenue: runningTotal,
        monthlyRevenue: m.revenue,
        orders: m.orders,
      };
    });
  }, [orders]);

  const revenueDelta = useMemo(() => {
    const last = revenueChart[revenueChart.length - 1]?.monthlyRevenue ?? 0;
    const prev = revenueChart[revenueChart.length - 2]?.monthlyRevenue ?? 0;
    if (prev <= 0) return null;
    return ((last - prev) / prev) * 100;
  }, [revenueChart]);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Last updated: Just now</span>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
                <span className="text-emerald-500">
                  {revenueDelta === null ? '—' : `${revenueDelta >= 0 ? '+' : ''}${revenueDelta.toFixed(1)}%`}
                </span>
                <span className="ml-1">from last month</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">From current Orders data</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProducts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">From current Inventory data</p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/50 bg-amber-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{lowStockAlerts}</div>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">Requires immediate attention</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChart} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#888'}} tickFormatter={(value) => {
                      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
                      return `$${value}`;
                    }} />
                    <Tooltip 
                      formatter={(value: number) => {
                        if (value >= 1000000) return [`$${(value / 1000000).toFixed(2)}M`, 'Revenue'];
                        if (value >= 1000) return [`$${(value / 1000).toFixed(2)}K`, 'Revenue'];
                        return [`$${value}`, 'Revenue'];
                      }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
