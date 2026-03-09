import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function AdminHeader({ toggleSidebar, isSidebarOpen }: AdminHeaderProps) {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#ff0000]"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <nav className="hidden md:flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {pathSegments.map((segment, index) => {
              const isLast = index === pathSegments.length - 1;
              const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
              
              return (
                <li key={path} className="flex items-center">
                  {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                  <span className={cn("text-sm font-medium capitalize", isLast ? "text-gray-900" : "text-gray-500")}>
                    {segment}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search..."
            className="h-9 w-64 rounded-md border border-gray-300 bg-white pl-9 pr-4 text-sm outline-none focus:border-[#ff0000] focus:ring-1 focus:ring-[#ff0000]"
          />
        </div>
        
        <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-[#ff0000]">
          <Bell className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                AU
            </div>
        </div>
      </div>
    </header>
  );
}
