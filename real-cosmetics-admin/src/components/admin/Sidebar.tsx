import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingBag,
  Tags,
  Store,
  Search,
  Megaphone,
  FileText,
  Package,
  Users,
  Server,
  Activity,
  ChevronDown,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

// TODO: Implement permission filtering based on user role
// The spec requires:
// - Sidebar hides inaccessible domains.
// - BFF enforces permission.
// - Never trust client role.
const navItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Catalog',
    icon: ShoppingBag,
    items: [
      { title: 'Products', href: '/admin/catalog/products', icon: Package },
      { title: 'Categories', href: '/admin/catalog/categories', icon: Tags },
      { title: 'Brands', href: '/admin/catalog/brands', icon: Store },
      { title: 'Queries', href: '/admin/catalog/queries', icon: Search },
    ],
  },
  {
    title: 'Marketing',
    icon: Megaphone,
    items: [
      { title: 'Promotions', href: '/admin/marketing/promotions', icon: Megaphone },
      {
        title: 'CMS',
        icon: FileText,
        items: [
          { title: 'Releases', href: '/admin/marketing/cms/releases' },
          { title: 'Blocks', href: '/admin/marketing/cms/blocks' },
          { title: 'Queries', href: '/admin/marketing/cms/queries' },
        ],
      },
    ],
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: Package,
  },
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: Users,
  },
  {
    title: 'Operations',
    icon: Server,
    items: [
      { title: 'Cache', href: '/admin/operations/cache', icon: Server },
      { title: 'Audit', href: '/admin/operations/audit', icon: Activity },
    ],
  },
];

export function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-gray-200 bg-white transition-all duration-300 ease-in-out",
        isOpen ? "w-[260px]" : "w-[72px]"
      )}
    >
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <div className={cn("flex items-center gap-2 font-bold text-xl", isOpen ? "px-6 w-full justify-start" : "justify-center")}>
           <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center text-white">R</div>
           {isOpen && <span className="truncate">Real Cosmetics</span>}
        </div>
      </div>

      <div className="h-[calc(100vh-64px-64px)] overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => (
            <NavItem key={item.title} item={item} isOpen={isOpen} currentPath={location.pathname} />
          ))}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 w-full border-t border-gray-200 bg-white p-4">
        <div className={cn("flex items-center gap-3", isOpen ? "" : "justify-center")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          {isOpen && (
            <>
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-gray-900">Admin User</span>
                <span className="truncate text-xs text-gray-500">admin@realcosmetics.com</span>
              </div>
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to logout?')) {
                    console.log('Logging out...');
                    // Add actual logout logic here
                  }
                }}
                className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

interface NavItemProps {
  item: any;
  isOpen: boolean;
  currentPath: string;
  depth?: number;
}

const NavItem: React.FC<NavItemProps> = ({ item, isOpen, currentPath, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const isActive = item.href ? currentPath === item.href : false;
  const hasChildren = item.items && item.items.length > 0;
  const isChildActive = hasChildren && item.items.some((child: any) => 
    child.href === currentPath || (child.items && child.items.some((grandChild: any) => grandChild.href === currentPath))
  );

  React.useEffect(() => {
    if (isChildActive) {
      setIsExpanded(true);
    }
  }, [isChildActive]);

  if (!isOpen && depth > 0) return null; // Hide nested items when collapsed

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const Icon = item.icon;

  return (
    <div className="mb-1">
      {item.href && !hasChildren ? (
        <Link
          to={item.href}
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 hover:text-[#ff0000]",
            isActive ? "bg-gray-50 text-[#ff0000] border-r-2 border-[#ff0000]" : "text-gray-700",
            !isOpen && "justify-center px-2"
          )}
        >
          {Icon && <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-[#ff0000]" : "text-gray-500 group-hover:text-[#ff0000]")} />}
          {isOpen && <span className="ml-3 flex-1">{item.title}</span>}
        </Link>
      ) : (
        <button
          onClick={handleClick}
          className={cn(
            "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 hover:text-[#ff0000]",
            isChildActive ? "text-[#ff0000]" : "text-gray-700",
            !isOpen && "justify-center px-2"
          )}
        >
          {Icon && <Icon className={cn("h-5 w-5 flex-shrink-0", isChildActive ? "text-[#ff0000]" : "text-gray-500 group-hover:text-[#ff0000]")} />}
          {isOpen && (
            <>
              <span className="ml-3 flex-1 text-left">{item.title}</span>
              {hasChildren && (
                <span className="ml-auto">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </span>
              )}
            </>
          )}
        </button>
      )}

      <AnimatePresence>
        {isOpen && hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-2">
              {item.items.map((child: any) => (
                <NavItem key={child.title} item={child} isOpen={isOpen} currentPath={currentPath} depth={depth + 1} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
