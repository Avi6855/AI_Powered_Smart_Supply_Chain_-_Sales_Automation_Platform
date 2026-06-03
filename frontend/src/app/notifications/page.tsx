'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/api';
import { Bell, CheckCircle, Trash2, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications', { params: { size: 50 } });
      setNotifications(res.data?.content || res.data || []);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      toast.error('Error marking as read');
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch {
      toast.error('Error marking all as read');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-end border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Bell className="text-primary" /> Notifications
            </h1>
            <p className="text-sm text-muted-foreground mt-1">View your recent system alerts and messages</p>
          </div>
          {notifications.some(n => !n.isRead) && (
            <button onClick={markAllRead} className="text-sm text-primary hover:underline flex items-center gap-1">
              <CheckCircle size={14} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border">
            <Bell className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-foreground font-medium">You're all caught up!</p>
            <p className="text-sm text-muted-foreground">No new notifications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} onClick={() => !n.isRead && markAsRead(n.id)} className={`bg-card border border-border rounded-xl p-4 flex gap-4 transition-colors cursor-pointer hover:bg-accent/50 ${!n.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}>
                <div className={`mt-1 flex-shrink-0 ${n.type === 'ALERT' ? 'text-destructive' : 'text-primary'}`}>
                  {n.type === 'ALERT' ? <AlertCircle size={20} /> : <Bell size={20} />}
                </div>
                <div>
                  <h3 className={`text-sm ${!n.isRead ? 'font-bold text-foreground' : 'font-medium text-foreground'}`}>{n.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
