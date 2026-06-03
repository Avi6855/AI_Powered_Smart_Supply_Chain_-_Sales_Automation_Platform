'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Settings, Shield, Bell, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Settings className="text-primary"/> Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your application preferences</p>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl"><Moon className="text-primary" /></div>
              <div>
                <h3 className="font-semibold text-foreground">Appearance</h3>
                <p className="text-sm text-muted-foreground">Toggle between Light and Dark mode</p>
              </div>
            </div>
            <select value={theme} onChange={e => setTheme(e.target.value)} className="bg-background border border-input text-foreground rounded-lg px-3 py-2 outline-none">
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-between opacity-60">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-xl"><Bell className="text-amber-500" /></div>
              <div>
                <h3 className="font-semibold text-foreground">Email Notifications</h3>
                <p className="text-sm text-muted-foreground">Coming soon: Configure which alerts you receive via email</p>
              </div>
            </div>
            <button disabled className="px-4 py-2 bg-muted text-muted-foreground rounded-lg cursor-not-allowed">Configure</button>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-between opacity-60">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl"><Shield className="text-emerald-500" /></div>
              <div>
                <h3 className="font-semibold text-foreground">Security</h3>
                <p className="text-sm text-muted-foreground">Coming soon: Change your password and 2FA</p>
              </div>
            </div>
            <button disabled className="px-4 py-2 bg-muted text-muted-foreground rounded-lg cursor-not-allowed">Manage</button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
