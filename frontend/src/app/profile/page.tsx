'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/api';
import { User, Mail, Briefcase, Phone, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', department: '' });

  useEffect(() => {
    api.get('/users/profile')
      .then((res: any) => {
        setUser(res.data);
        setForm({ firstName: res.data.firstName || '', lastName: res.data.lastName || '', phone: res.data.phone || '', department: res.data.department || '' });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/profile', form);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AppLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32}/></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><User className="text-primary"/> My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your personal information</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-6 mb-8 border-b border-border pb-6">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold uppercase border border-primary/30 shadow-lg">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user?.firstName} {user?.lastName}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1"><Mail size={14}/> {user?.email}</p>
              <p className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-bold inline-block mt-2">{user?.role}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-medium text-muted-foreground">First Name</label><input required value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Last Name</label><input required value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Phone size={12}/> Phone</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground" /></div>
              <div><label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Briefcase size={12}/> Department</label><input value={form.department} onChange={e=>setForm({...form,department:e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground" /></div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                {saving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
