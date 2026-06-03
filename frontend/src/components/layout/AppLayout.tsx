'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search, Bell, Sun, Moon, User, Settings, LogOut, ChevronDown,
  LayoutDashboard, Package, ShoppingCart, FileText, Truck, Users,
  Bot, X, Menu
} from 'lucide-react';
import { useTheme } from 'next-themes';
import toast from 'react-hot-toast';
import api from '@/lib/api';

// ── Navigation routes ──────────────────────────────────────────────────────────
const navRoutes = [
  { href: '/',            label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/inventory',   label: 'Inventory',   icon: Package },
  { href: '/orders',      label: 'Orders',      icon: ShoppingCart },
  { href: '/procurement', label: 'Procurement', icon: FileText },
  { href: '/shipments',   label: 'Shipments',   icon: Truck },
  { href: '/suppliers',   label: 'Suppliers',   icon: Users },
  { href: '/ai-chat',     label: 'AI Assistant',icon: Bot },
];

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  const hr  = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);
  if (min < 1)  return 'just now';
  if (min < 60) return `${min}m ago`;
  if (hr  < 24) return `${hr}h ago`;
  return `${day}d ago`;
}

// ── Global Search Component ────────────────────────────────────────────────────
function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState<any[]>([]);
  const [isOpen, setIsOpen]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const inputRef                  = useRef<HTMLInputElement>(null);
  const wrapperRef                = useRef<HTMLDivElement>(null);
  const debounceRef               = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setIsOpen(false); return; }
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        // We simulate a global search by firing parallel requests to the endpoints
        // In a real production app, you'd want a single dedicated /api/search endpoint.
        const [prodRes, ordRes, suppRes] = await Promise.all([
          api.get('/products', { params: { search: query, size: 3 } }).catch(() => ({ data: [] })),
          api.get('/orders', { params: { search: query, size: 3 } }).catch(() => ({ data: [] })),
          api.get('/suppliers', { params: { search: query, size: 3 } }).catch(() => ({ data: [] }))
        ]);

        const mapped = [
          ...((prodRes.data.content || prodRes.data || []).map((p: any) => ({ id: `p-${p.id}`, type: 'Product', label: p.name, href: '/inventory' }))),
          ...((ordRes.data.content || ordRes.data || []).map((o: any) => ({ id: `o-${o.id}`, type: 'Order', label: o.orderNumber, href: '/orders' }))),
          ...((suppRes.data.content || suppRes.data || []).map((s: any) => ({ id: `s-${s.id}`, type: 'Supplier', label: s.name, href: '/suppliers' })))
        ].slice(0, 8); // top 8 results overall

        setResults(mapped);
        setIsOpen(true);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (href: string) => {
    setQuery('');
    setIsOpen(false);
    router.push(href);
  };

  const typeColors: Record<string, string> = {
    Product:  'bg-blue-500/20 text-blue-500',
    Order:    'bg-purple-500/20 text-purple-500',
    Supplier: 'bg-emerald-500/20 text-emerald-500',
    Shipment: 'bg-amber-500/20 text-amber-500',
    PO:       'bg-orange-500/20 text-orange-500',
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actual records..."
          className="w-full pl-9 pr-9 py-2 rounded-lg border border-input bg-background/50 backdrop-blur-sm text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        />
        {query && (
          <button onClick={() => { setQuery(''); setIsOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        )}
      </div>
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          <div className="p-2 text-xs text-muted-foreground font-medium px-3 pt-3">
            {loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} found`}
          </div>
          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.href)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors text-left"
            >
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[item.type] ?? 'bg-muted text-muted-foreground'}`}>
                {item.type}
              </span>
              <span className="text-sm text-card-foreground truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Notification Panel ─────────────────────────────────────────────────────────
function NotificationPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Fetch real notifications
    api.get('/notifications', { params: { size: 5 } })
      .then((res: any) => setNotifications(res.data.content || res.data || []))
      .catch(() => setNotifications([])); // No demo fallback
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      toast.error('Failed to mark read');
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (e) {
      toast.error('Failed to mark all read');
    }
  };

  return (
    <div className="absolute right-0 top-12 w-80 rounded-2xl border border-border bg-card shadow-xl overflow-hidden z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline">
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-border">
        {notifications.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No notifications</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-accent transition-colors ${!n.isRead ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{getRelativeTime(n.createdAt)}</p>
              </div>
              {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1" />}
            </div>
          ))
        )}
      </div>
      <div className="p-3 border-t border-border">
        <button onClick={() => { onClose(); router.push('/notifications'); }} className="w-full text-center text-xs text-primary hover:underline">
          View all notifications
        </button>
      </div>
    </div>
  );
}

// ── User Menu ─────────────────────────────────────────────────────────────────
function UserMenu({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Fetch actual user profile
    api.get('/users/profile')
      .then((res: any) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const handleNavigate = (href: string) => { onClose(); router.push(href); };

  return (
    <div className="absolute right-0 top-12 w-52 rounded-2xl border border-border bg-card shadow-xl overflow-hidden z-50">
      <div className="p-4 border-b border-border">
        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm mx-auto mb-2 uppercase">
          {user ? (user.firstName?.[0] + (user.lastName?.[0] || '')) : 'U'}
        </div>
        <p className="text-sm font-semibold text-center text-foreground">{user ? `${user.firstName} ${user.lastName}` : 'User'}</p>
        <p className="text-xs text-muted-foreground text-center">{user?.email || 'Loading...'}</p>
      </div>
      <div className="p-2">
        {[
          { label: 'Profile',       href: '/profile',       icon: User },
          { label: 'Settings',      href: '/settings',      icon: Settings },
          { label: 'Notifications', href: '/notifications', icon: Bell },
        ].map(({ label, href, icon: Icon }) => (
          <button
            key={href}
            onClick={() => handleNavigate(href)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
        <div className="border-t border-border mt-2 pt-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ── App Layout ─────────────────────────────────────────────────────────────────
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname                    = usePathname();
  const { theme, setTheme }         = useTheme();
  const [mounted, setMounted]       = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotif, setShowNotif]   = useState(false);
  const [showUser,  setShowUser]    = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setShowNotif(false);
    setShowUser(false);
    setSidebarOpen(false);
  }, [pathname]);

  const currentPageLabel = navRoutes.find((r) => r.href === pathname)?.label ?? 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:relative z-40 h-full w-64 flex flex-col bg-card border-r border-border
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-border">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">
            SC
          </div>
          <div>
            <h2 className="font-bold text-sm leading-tight">SupplyAI</h2>
            <p className="text-xs text-muted-foreground">Enterprise Platform</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navRoutes.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'}
                `}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-border space-y-1">
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
            <Settings size={18} />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border bg-card shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen((p) => !p)}
              className="md:hidden p-2 rounded-lg hover:bg-accent text-muted-foreground"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <p className="text-xs text-muted-foreground">Dashboard / {currentPageLabel}</p>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-4 hidden sm:block">
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              {mounted && (theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />)}
            </button>

            <div className="relative">
              <button
                onClick={() => { setShowNotif((p) => !p); setShowUser(false); }}
                className="relative p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <Bell size={18} />
              </button>
              {showNotif && <NotificationPanel onClose={() => setShowNotif(false)} />}
            </div>

            <div className="relative">
              <button
                onClick={() => { setShowUser((p) => !p); setShowNotif(false); }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-accent transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                  U
                </div>
                <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
              </button>
              {showUser && <UserMenu onClose={() => setShowUser(false)} />}
            </div>
          </div>
        </header>

        {/* Click-away */}
        {(showNotif || showUser) && (
          <div className="fixed inset-0 z-10" onClick={() => { setShowNotif(false); setShowUser(false); }} />
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}