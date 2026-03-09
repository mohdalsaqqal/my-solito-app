import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  dense?: boolean;
}

export function PageContainer({ children, className, dense = false }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-3 md:px-4 lg:px-6",
        dense ? "max-w-[1280px]" : "max-w-[1120px]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-6 md:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      <div className="flex items-center gap-4">{children}</div>
    </div>
  );
}

export function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("mb-6 md:mb-8", className)}>{children}</section>;
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-gray-200 bg-white p-6 shadow-sm", className)}>
      {children}
    </div>
  );
}
