'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { AiFab } from '@/components/ai/AiFab';
import { supplierApi as suppliersApi } from '@/lib/api';
import {
  Users, Plus, Search, Filter, Star, TrendingUp, Edit2, Trash2,
  MapPin, X, LayoutGrid, LayoutList, AlertTriangle, CheckCircle,
  Loader2, Award, Bot
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [form, setForm] = useState({ name: '', code: '', email: '', status: 'ACTIVE', country: '', performance_score: 100, rating: 5 });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await suppliersApi.getAll({ page: 0, size: 1000 } as any);
        const data = (res as any)?.data?.data ?? (res as any)?.data ?? res;
        const content = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
        const normalized = content.map((s: any) => ({
          ...s,
          performance_score: s?.performance_score ?? s?.performanceScore ?? 0,
          rating: s?.rating ?? 0,
        }));
        setSuppliers(normalized);
      } catch {
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let list = [...suppliers];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => `${s.name} ${s.code} ${s.email} ${s.country}`.toLowerCase().includes(q));
    }
    if (statusFilter !== 'ALL') list = list.filter(s => s.status === statusFilter);
    setFilteredSuppliers(list);
  }, [suppliers, statusFilter, searchQuery]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (selectedSupplier) {
        const payload = {
          name: form.name,
          code: form.code,
          email: form.email,
          status: form.status,
          country: form.country,
          rating: Number(form.rating),
          performanceScore: Number(form.performance_score),
        };
        const res = await suppliersApi.update(selectedSupplier.id, payload);
        const updatedRemote = (res as any)?.data ?? res;
        const updated = suppliers.map((s) =>
          s.id === selectedSupplier.id
            ? { ...s, ...payload, ...updatedRemote, performance_score: payload.performanceScore }
            : s
        );
        setSuppliers(updated);
        toast.success('Supplier updated!');
      } else {
        const payload = {
          name: form.name,
          code: form.code,
          email: form.email,
          status: form.status,
          country: form.country,
          rating: Number(form.rating),
          performanceScore: Number(form.performance_score),
        };
        const res = await suppliersApi.create(payload);
        const created = (res as any)?.data ?? res;
        const entity = { ...created, performance_score: payload.performanceScore };
        setSuppliers((prev) => [entity, ...prev]);
        toast.success('Supplier created!');
      }
      setShowAddModal(false);
    } catch {
      toast.error('Failed to save supplier');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await suppliersApi.delete(Number(id));
      setSuppliers((prev) => prev.filter((s) => String(s.id) !== String(id)));
      toast.success('Supplier deleted');
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
              <Users className="text-primary" /> Suppliers
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage vendor relationships and performance</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setSelectedSupplier(null); setForm({name: '', code: '', email: '', status: 'ACTIVE', country: '', performance_score: 100, rating: 5}); setShowAddModal(true); }} className="btn-primary flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              <Plus size={16} /> Add Supplier
            </button>
          </div>
        </div>

        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search suppliers..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none">
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <div className="flex bg-background border border-input rounded-lg p-1">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><LayoutGrid size={16} /></button>
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><LayoutList size={16} /></button>
          </div>
        </div>

        <div>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-xl border border-border">
                <Users className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-foreground font-medium">No suppliers found.</p>
                <p className="text-sm text-muted-foreground">Add a new supplier to get started.</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredSuppliers.map((s, idx) => (
              <div key={s.id} className="bg-card rounded-xl p-5 border border-border shadow-sm flex flex-col gap-3 group relative">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      <span className="text-muted-foreground mr-2">#{idx + 1}</span>
                      {s.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">{s.code}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${s.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-destructive/20 text-destructive'}`}>{s.status}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin size={14} /> {s.country || 'N/A'}</div>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                  <div className="flex items-center gap-1 text-amber-500 text-sm font-bold"><Star size={14} className="fill-amber-500" /> {s.rating}/5</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedSupplier(s);
                        setForm({
                          name: s.name ?? '',
                          code: s.code ?? '',
                          email: s.email ?? '',
                          status: s.status ?? 'ACTIVE',
                          country: s.country ?? '',
                          performance_score: s.performance_score ?? s.performanceScore ?? 0,
                          rating: s.rating ?? 0,
                        });
                        setShowAddModal(true);
                      }}
                      className="p-1.5 hover:bg-accent rounded text-muted-foreground"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 hover:bg-destructive/20 rounded text-destructive"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
            ) : (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground text-xs uppercase font-medium">
                <tr><th className="px-4 py-3">Sr No</th><th className="px-4 py-3">Supplier</th><th className="px-4 py-3">Code</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Score</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSuppliers.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-accent/50">
                    <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.code}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${s.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-destructive/20 text-destructive'}`}>{s.status}</span></td>
                    <td className="px-4 py-3 text-foreground">{s.performance_score}%</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedSupplier(s);
                          setForm({
                            name: s.name ?? '',
                            code: s.code ?? '',
                            email: s.email ?? '',
                            status: s.status ?? 'ACTIVE',
                            country: s.country ?? '',
                            performance_score: s.performance_score ?? s.performanceScore ?? 0,
                            rating: s.rating ?? 0,
                          });
                          setShowAddModal(true);
                        }}
                        className="p-1.5 hover:bg-accent rounded inline-block"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 hover:bg-destructive/20 text-destructive rounded inline-block ml-1"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            )}
          </div>

        <AiFab
          moduleName="Suppliers"
          data={filteredSuppliers}
          suggestedPrompts={[
            'How many suppliers are active vs inactive?',
            'List top 10 suppliers by performance_score',
            'List bottom 10 suppliers by rating',
            'Which countries have the most suppliers?',
          ]}
        />

        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl border border-border w-full max-w-md overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between items-center">
                <h3 className="font-semibold text-foreground">{selectedSupplier ? 'Edit Supplier' : 'Add Supplier'}</h3>
                <button onClick={() => setShowAddModal(false)}><X size={18} className="text-muted-foreground" /></button>
              </div>
              <form onSubmit={handleSave} className="p-4 space-y-4">
                <div><label className="text-xs font-medium text-muted-foreground">Name</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-medium text-muted-foreground">Code</label><input required value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground" /></div>
                  <div><label className="text-xs font-medium text-muted-foreground">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div>
                </div>
                <div><label className="text-xs font-medium text-muted-foreground">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Country</label><input value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground" /></div>
                <button type="submit" disabled={formLoading} className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium">{formLoading ? 'Saving...' : 'Save Supplier'}</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
