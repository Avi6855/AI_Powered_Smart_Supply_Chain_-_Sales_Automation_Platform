import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Package, ShoppingCart, Truck, Users, Bot, LogOut, FileText, Megaphone } from 'lucide-react';
import { useStore } from '@/store/useStore';

const routes = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/procurement', label: 'Procurement', icon: FileText },
  { href: '/shipments', label: 'Shipments', icon: Truck },
  { href: '/suppliers', label: 'Suppliers', icon: Users },
  { href: '/ai-chat', label: 'AI Assistant', icon: Bot },
];

const adminRoutes = [
  { href: '/admin/notifications', label: 'Broadcast', icon: Megaphone },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useStore();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card/50 glass-panel">
      <div className="p-6">
        <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            SC
          </div>
          SupplyAI
        </h2>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-2 px-4">
          {routes.map((route) => {
            const Icon = route.icon;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-primary/10 hover:text-primary",
                  pathname === route.href ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-md" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {route.label}
              </Link>
            )
          })}

          {isAdmin && (
            <>
              <div className="mt-4 mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Administration
              </div>
              {adminRoutes.map((route) => {
                const Icon = route.icon;
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-primary/10 hover:text-primary",
                      pathname === route.href ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-md" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {route.label}
                  </Link>
                )
              })}
            </>
          )}
        </nav>
      </div>
      <div className="p-4 mt-auto border-t">
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-all hover:bg-destructive/10">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
