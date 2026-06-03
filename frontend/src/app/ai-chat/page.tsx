"use client";

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Bot, BrainCircuit } from 'lucide-react';
import { ScopedAiAssistant } from '@/components/ai/ScopedAiAssistant';
import { orderApi, productApi, procurementApi, shipmentApi, supplierApi } from '@/lib/api';

type AgentId =
  | 'inventory'
  | 'orders'
  | 'procurement'
  | 'shipments'
  | 'suppliers'
  | 'sales_analytics';

const AGENTS: Array<{ id: AgentId; title: string }> = [
  { id: 'inventory', title: 'Inventory AI' },
  { id: 'orders', title: 'Orders AI' },
  { id: 'procurement', title: 'Procurement AI' },
  { id: 'shipments', title: 'Shipments AI' },
  { id: 'suppliers', title: 'Suppliers AI' },
  { id: 'sales_analytics', title: 'Sales Analytics AI' },
];

function extractPagedContent(payload: any): any[] {
  const data = payload?.data?.data ?? payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function AiChatPage() {
  const [active, setActive] = useState<AgentId>('inventory');

  const [inventory, setInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [procurement, setProcurement] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [supRes, poRes, shipRes] = await Promise.all([
          supplierApi.getAll({ page: 0, size: 1000 } as any),
          procurementApi.getAll({ page: 0, size: 1000 } as any),
          shipmentApi.getAll({ page: 0, size: 1000 } as any),
        ]);

        setSuppliers(extractPagedContent(supRes));
        setProcurement(extractPagedContent(poRes));
        setShipments(extractPagedContent(shipRes));
      } catch {
        setSuppliers([]);
        setProcurement([]);
        setShipments([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await productApi.getAll({ page: 0, size: 1000 });
        setInventory(extractPagedContent(res));
      } catch {
        setInventory([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await orderApi.getAll({ page: 0, size: 1000 });
        setOrders(extractPagedContent(res));
      } catch {
        setOrders([]);
      }
    })();
  }, []);

  const salesAnalyticsData = useMemo(() => {
    const normalizedOrders = orders.map((o: any) => ({
      totalAmount: Number(o?.totalAmount ?? o?.total_amount ?? 0),
      createdAt: o?.createdAt ?? o?.created_at ?? null,
    }));

    const totalRevenue = normalizedOrders.reduce((s: number, o: any) => s + (Number.isFinite(o.totalAmount) ? o.totalAmount : 0), 0);
    const totalOrders = normalizedOrders.length;
    const activeProducts = inventory.filter((p: any) => (p?.isActive ?? p?.is_active ?? true) === true).length;

    const lowStockAlerts = inventory.filter((p: any) => {
      const isLow = p?.isLowStock ?? p?.is_low_stock;
      if (typeof isLow === 'boolean') return isLow;
      const qty = Number(p?.quantityInStock ?? p?.quantity_in_stock ?? 0);
      const reorder = Number(p?.reorderPoint ?? p?.reorderPoint ?? p?.reorder_point ?? 0);
      const min = Number(p?.minimumStockLevel ?? p?.minimum_stock_level ?? 0);
      return qty <= reorder || qty < min;
    }).length;

    return [
      {
        totalRevenue,
        totalOrders,
        activeProducts,
        lowStockAlerts,
        procurementCount: procurement.length,
        shipmentsCount: shipments.length,
        suppliersCount: suppliers.length,
      },
    ];
  }, [inventory, orders, procurement, shipments, suppliers]);

  const { moduleName, data, prompts } = useMemo(() => {
    if (active === 'inventory') return { moduleName: 'Inventory', data: inventory, prompts: ['List the top 5 products by unit price', 'How many products are low stock?'] };
    if (active === 'orders') return { moduleName: 'Orders', data: orders, prompts: ['Summarize total revenue from all orders', 'Count by status'] };
    if (active === 'procurement') return { moduleName: 'Procurement', data: procurement, prompts: ['How many purchase orders are pending vs approved?', 'Summarize this month spend'] };
    if (active === 'shipments') return { moduleName: 'Shipments', data: shipments, prompts: ['How many shipments are delivered vs in transit?', 'List top carriers by shipment count'] };
    if (active === 'suppliers') return { moduleName: 'Suppliers', data: suppliers, prompts: ['How many suppliers are active vs inactive?', 'Which countries have the most suppliers?'] };
    return { moduleName: 'Sales Analytics', data: salesAnalyticsData, prompts: ['Explain revenue drivers', 'Summarize KPIs', 'What should we prioritize next?'] };
  }, [active, inventory, orders, procurement, shipments, suppliers, salesAnalyticsData]);

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 pb-2 border-b">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
            <p className="text-sm text-muted-foreground">Select an agent and ask questions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-h-0">
          <Card className="p-4 md:col-span-1">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-primary" /> Active Agents
            </h3>
            <div className="space-y-2">
              {AGENTS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setActive(a.id)}
                  className={`w-full flex items-center gap-2 text-sm p-2 rounded-md border transition-colors ${
                    active === a.id ? 'bg-primary/10 border-primary/30 text-foreground' : 'bg-background border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {a.title}
                </button>
              ))}
            </div>
          </Card>

          <div className="md:col-span-3 min-h-0">
            <ScopedAiAssistant moduleName={moduleName} data={data} suggestedPrompts={prompts} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
