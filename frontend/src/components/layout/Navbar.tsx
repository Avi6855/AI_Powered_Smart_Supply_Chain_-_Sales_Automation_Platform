'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search,
  Sun,
  Moon,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { cn, getInitials, stringToColor, formatDateRelative } from '@/lib/utils';
import { useUiStore }           from '@/store/uiStore';
import { useAuthStore }         from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

export function Navbar() {
  const router = useRouter();
  const [showUserMenu,   setShowUserMenu]   = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const currentPage = useUiStore((s) => s.currentPage);
  const theme       = useUiStore((s) => s.theme);
  const setTheme    = useUiStore((s) => s.setTheme);

  const user         = useAuthStore((s) => s.user);
  const logout       = useAuthStore((s) => s.logout);
  const wsConnected  = useNotificationStore((s) => s.wsConnected);
  const unreadCount  = useNotificationStore((s) => s.unreadCount);
  const notifications= useNotificationStore((s) => s.notifications);
  const markAsRead   = useNotificationStore((s) => s.markAsRead);
  const markAllRead  = useNotificationStore((s) => s.markAllAsRead);

  const avatarColor  = user ? stringToColor(`${user.firstName} ${user.lastName}`) : '#8b5cf6';
  const recentNotifs = notifications.slice(0, 6);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const notifTypeColor: Record<string, string> = {
    INFO:    'text-secondary-400',
    WARNING: 'text-warning-400',
    SUCCESS: 'text-success-400',
    ERROR:   'text-danger-400',
    ALERT:   'text-accent-400',
  };

  return (
    <header className="h-16 glass border-b border-white/8 flex items-center justify-between px-6 shrink-0 z-30">
      {/* ── Left: Title + breadcrumb ─────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-base font-bold font-outfit text-slate-100 leading-tight">
            {currentPage}
          </h1>
          <p className="text-xs text-slate-500">
            Dashboard / {currentPage}
          </p>
        </div>
      </div>

      {/* ── Right: Actions ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* WS Status */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          {wsConnected
            ? <Wifi    size={14} className="text-success-400" />
            : <WifiOff size={14} className="text-danger-400" />
          }
          <span className="hidden md:inline">
            {wsConnected ? 'Live' : 'Offline'}
          </span>
        </div>

        {/* Search */}
        <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors">
          <Search size={18} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifPanel((p) => !p); setShowUserMenu(false); }}
            className="relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {showNotifPanel && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-10 w-80 glass-card rounded-2xl border border-white/10 shadow-glass overflow-hidden z-50"
              >
                <div className="flex items-center justify-between p-4 border-b border-white/8">
                  <p className="font-semibold text-slate-200 text-sm">Notifications</p>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllRead()}
                      className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {recentNotifs.length === 0 ? (
                    <p className="text-center text-slate-500 text-sm py-8">
                      No notifications
                    </p>
                  ) : (
                    recentNotifs.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={cn(
                          'flex items-start gap-3 p-3 border-b border-white/4 cursor-pointer hover:bg-white/3 transition-colors',
                          !n.isRead && 'bg-primary-500/5'
                        )}
                      >
                        <div className={cn('text-sm mt-0.5 shrink-0', notifTypeColor[n.type] ?? 'text-slate-400')}>
                          <Bell size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-xs font-semibold truncate', !n.isRead ? 'text-slate-100' : 'text-slate-400')}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-xs text-slate-600 mt-1">{formatDateRelative(n.createdAt)}</p>
                        </div>
                        {!n.isRead && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0 mt-1.5" />
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-white/8">
                  <Link
                    href="/notifications"
                    onClick={() => setShowNotifPanel(false)}
                    className="text-xs text-primary-400 hover:text-primary-300 transition-colors block text-center"
                  >
                    View all notifications
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => { setShowUserMenu((p) => !p); setShowNotifPanel(false); }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: avatarColor }}
            >
              {user ? getInitials(`${user.firstName} ${user.lastName}`) : 'U'}
            </div>
            <span className="hidden md:block text-xs font-medium text-slate-300">
              {user?.firstName}
            </span>
            <ChevronDown size={14} className="text-slate-500" />
          </button>

          {/* User Dropdown */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-10 w-56 glass-card rounded-2xl border border-white/10 shadow-glass overflow-hidden z-50"
              >
                {/* User info */}
                <div className="p-4 border-b border-white/8">
                  <p className="text-sm font-semibold text-slate-100">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
                  <span className="badge badge-primary text-xs mt-2">
                    {user?.role.replace('_', ' ')}
                  </span>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  {[
                    { label: 'Profile',  href: '/profile',  icon: User     },
                    { label: 'Settings', href: '/settings', icon: Settings },
                  ].map((item) => (
                    <Link key={item.href} href={item.href}>
                      <div
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <item.icon size={16} />
                        {item.label}
                      </div>
                    </Link>
                  ))}

                  <div className="border-t border-white/8 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-danger-400 hover:bg-danger-500/10 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Click-away overlay */}
      {(showUserMenu || showNotifPanel) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowUserMenu(false); setShowNotifPanel(false); }}
        />
      )}
    </header>
  );
}
