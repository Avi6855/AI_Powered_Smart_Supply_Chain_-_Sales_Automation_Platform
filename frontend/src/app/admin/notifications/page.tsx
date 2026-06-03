"use client";

import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { 
  Send, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  ShieldAlert,
  Users,
  Megaphone
} from 'lucide-react';
import { useState } from 'react';
import { notificationsApi } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('INFO');
  const [actionUrl, setActionUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsLoading(true);
    try {
      await notificationsApi.broadcast({
        title,
        message,
        type: type as any,
        actionUrl: actionUrl.trim() || undefined
      });
      toast.success('Notification broadcasted successfully to all users');
      setTitle('');
      setMessage('');
      setActionUrl('');
      setType('INFO');
    } catch (error) {
      console.error('Broadcast error:', error);
      toast.error('Failed to broadcast notification');
    } finally {
      setIsLoading(false);
    }
  };

  const notificationTypes = [
    { value: 'INFO', label: 'Information', icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { value: 'SUCCESS', label: 'Success', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { value: 'WARNING', label: 'Warning', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { value: 'ALERT', label: 'System Alert', icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Broadcast</h1>
            <p className="text-muted-foreground">Create and send custom notifications to all system users</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <Megaphone className="h-6 w-6 text-primary" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 md:col-span-2">
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Notification Title</label>
                <Input 
                  placeholder="e.g., System Maintenance" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message Content</label>
                <Textarea 
                  placeholder="Describe the update or alert in detail..." 
                  className="min-h-[120px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Action URL (Optional)</label>
                  <Input 
                    placeholder="e.g., /inventory or https://..." 
                    value={actionUrl}
                    onChange={(e) => setActionUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notification Type</label>
                  <div className="flex flex-wrap gap-2">
                    {notificationTypes.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setType(t.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          type === t.value 
                            ? `${t.bg} ${t.color} ring-1 ring-inset ring-${t.value.toLowerCase()}-500/50` 
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        <t.icon className="h-3.5 w-3.5" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <Button type="submit" disabled={isLoading} className="gap-2">
                  {isLoading ? 'Sending...' : 'Broadcast to All Users'}
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Card>

          <div className="space-y-6">
            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" /> Targeting
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                This broadcast will be sent to all active users across all departments:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" /> Executive Management
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" /> Warehouse Operations
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" /> Procurement Teams
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" /> Sales & Logistics
                </li>
              </ul>
            </Card>

            <Card className="p-6 border-dashed border-2">
              <h3 className="font-semibold text-sm mb-3 opacity-50">Preview</h3>
              <div className="p-3 rounded-lg border bg-background shadow-sm">
                <div className="flex gap-3">
                  <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    notificationTypes.find(t => t.value === type)?.bg
                  }`}>
                    {(() => {
                      const Icon = notificationTypes.find(t => t.value === type)?.icon || Info;
                      return <Icon className={`h-4 w-4 ${notificationTypes.find(t => t.value === type)?.color}`} />;
                    })()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{title || 'Notification Title'}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {message || 'Your message content will appear here...'}
                    </p>
                    <span className="text-[10px] text-muted-foreground/60 mt-1 block">Just now</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
