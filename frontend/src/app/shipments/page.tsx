'use client';

import React, { useMemo, useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { AiFab } from '@/components/ai/AiFab';
import { orderApi, shipmentApi } from '@/lib/api';
import {
  Truck, Plus, MapPin, X,
  Loader2, Edit2, Trash2, Bot
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ trackingNumber: '', orderId: '', carrier: '', status: 'IN_TRANSIT', origin: '', destination: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [ordersRes, shipmentsRes] = await Promise.all([
          orderApi.getAll({ page: 0, size: 1000 } as any),
          shipmentApi.getAll({ page: 0, size: 1000 } as any),
        ]);

        const ordersData = (ordersRes as any)?.data?.data ?? (ordersRes as any)?.data ?? ordersRes;
        const ordersList = Array.isArray(ordersData?.content) ? ordersData.content : Array.isArray(ordersData) ? ordersData : [];
        setOrders(ordersList);

        const shipData = (shipmentsRes as any)?.data?.data ?? (shipmentsRes as any)?.data ?? shipmentsRes;
        const shipList = Array.isArray(shipData?.content) ? shipData.content : Array.isArray(shipData) ? shipData : [];
        setShipments(shipList);
      } catch {
        setOrders([]);
        setShipments([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredShipments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return shipments;
    return shipments.filter((s) =>
      `${s.trackingNumber} ${s.carrier} ${s.currentLocation ?? ''} ${s.destinationAddress ?? ''} ${s.status}`
        .toLowerCase()
        .includes(q)
    );
  }, [shipments, searchQuery]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        trackingNumber: form.trackingNumber,
        orderId: form.orderId ? Number(form.orderId) : null,
        carrier: form.carrier,
        status: form.status,
        currentLocation: form.origin,
        destinationAddress: form.destination,
      };

      if (selected) {
        const res = await shipmentApi.update(Number(selected.id), payload);
        const updatedRemote = (res as any)?.data ?? res;
        setShipments((prev) => prev.map((s) => (Number(s.id) === Number(selected.id) ? { ...s, ...updatedRemote, ...payload } : s)));
        toast.success('Shipment updated');
      } else {
        const res = await shipmentApi.create(payload);
        const created = (res as any)?.data ?? res;
        setShipments((prev) => [created, ...prev]);
        toast.success('Shipment created');
      }
      setShowModal(false);
    } catch {
      toast.error('Failed to save shipment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this shipment?')) return;
    try {
      await shipmentApi.delete(Number(id));
      setShipments((prev) => prev.filter((s) => Number(s.id) !== Number(id)));
      toast.success('Shipment deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Truck className="text-primary" /> Shipments
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Track and manage outgoing and incoming logistics</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setSelected(null); setForm({trackingNumber: '', orderId: '', carrier: '', status: 'PENDING', origin: '', destination: ''}); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              <Plus size={16} /> New Shipment
            </button>
          </div>
        </div>

        <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : filteredShipments.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border">
            <Truck className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-foreground font-medium">No shipments found.</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground text-xs uppercase">
                <tr><th className="px-4 py-3">Sr No</th><th className="px-4 py-3">Tracking #</th><th className="px-4 py-3">Carrier</th><th className="px-4 py-3">Route</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredShipments.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-accent/50">
                    <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono font-medium text-foreground">{s.trackingNumber}</td>
                    <td className="px-4 py-3 text-foreground">{s.carrier}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">Route {s.id}</div>
                      <div className="text-muted-foreground text-xs mt-0.5"><MapPin size={12} className="inline mr-1"/>{s.currentLocation ?? '—'} → {s.destinationAddress ?? '—'}</div>
                    </td>
                    <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${s.status==='DELIVERED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>{s.status}</span></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setSelected(s); setForm({ trackingNumber: s.trackingNumber ?? '', orderId: String(s.orderId ?? ''), carrier: s.carrier ?? '', status: s.status ?? 'IN_TRANSIT', origin: s.currentLocation ?? '', destination: s.destinationAddress ?? '' }); setShowModal(true); }} className="p-1.5 hover:bg-accent rounded inline-block"><Edit2 size={14} className="text-foreground" /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 hover:bg-destructive/20 rounded inline-block ml-1"><Trash2 size={14} className="text-destructive" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>

        <AiFab
          moduleName="Shipments"
          data={filteredShipments}
          suggestedPrompts={[
            'How many shipments are delivered vs in transit?',
            'List top 10 carriers by shipment count',
            'Which routes appear most often?',
            'Count exceptions',
          ]}
        />

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl border border-border w-full max-w-md overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between items-center">
                <h3 className="font-semibold text-foreground">{selected ? 'Edit Shipment' : 'Create Shipment'}</h3>
                <button onClick={() => setShowModal(false)}><X size={18} className="text-muted-foreground" /></button>
              </div>
              <form onSubmit={handleSave} className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-medium text-muted-foreground">Tracking Number</label><input required value={form.trackingNumber} onChange={e => setForm({...form, trackingNumber: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground" /></div>
                  <div><label className="text-xs font-medium text-muted-foreground">Carrier</label><input required value={form.carrier} onChange={e => setForm({...form, carrier: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground" /></div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Linked Order</label>
                  <select value={form.orderId} onChange={e => setForm({...form, orderId: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground">
                    <option value="">Select an order...</option>
                    {orders.map(o => <option key={o.id} value={o.id}>{o.orderNumber} - {o.customerName}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-medium text-muted-foreground">Origin</label><input value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground" /></div>
                  <div><label className="text-xs font-medium text-muted-foreground">Destination</label><input value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground" /></div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground">
                    {['PENDING','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED','EXCEPTION'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={saving} className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium">{saving ? 'Saving...' : 'Save Shipment'}</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
