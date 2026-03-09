import React from 'react';
import { PageContainer, PageHeader, Section, Panel } from '@/components/admin/PageContainer';
import { ArrowUpRight, ArrowDownRight, AlertTriangle, Activity, Package, Users, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const KPICard = ({ title, value, change, trend, icon: Icon, href }: any) => (
  <Link to={href} className="block">
    <Panel className="flex flex-col justify-between p-6 transition-all hover:border-[#ff0000] hover:shadow-md h-full">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-sm font-medium text-gray-500">{title}</span>
          <div className="mt-2 text-3xl font-bold text-gray-900">{value}</div>
        </div>
        <div className="rounded-full bg-gray-50 p-2">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs">
        {trend === 'up' ? (
          <ArrowUpRight className="mr-1 h-4 w-4 text-green-600" />
        ) : (
          <ArrowDownRight className="mr-1 h-4 w-4 text-red-600" />
        )}
        <span className={cn("font-medium", trend === 'up' ? "text-green-600" : "text-red-600")}>
          {change}
        </span>
        <span className="ml-1 text-gray-500">from last month</span>
      </div>
    </Panel>
  </Link>
);

const AlertItem = ({ title, description, severity }: any) => (
  <div className="flex items-start gap-3 border-b border-gray-100 py-3 last:border-0">
    <AlertTriangle className={cn("h-5 w-5 shrink-0 mt-0.5", severity === 'high' ? "text-red-500" : "text-yellow-500")} />
    <div>
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-xs text-gray-500">{description}</p>
      <button className="mt-1 text-xs font-medium text-[#ff0000] hover:underline">Resolve</button>
    </div>
  </div>
);

const AuditItem = ({ user, action, target, time }: any) => (
  <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
        {user.charAt(0)}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">
          {user} <span className="font-normal text-gray-500">{action}</span> {target}
        </p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </div>
  </div>
);

const TopItem = ({ name, sales, revenue }: any) => (
  <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
        <Package className="h-5 w-5 text-gray-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{name}</p>
        <p className="text-xs text-gray-500">{sales} sales</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm font-medium text-gray-900">{revenue}</p>
    </div>
  </div>
);

export default function Dashboard() {
  return (
    <PageContainer>
      <PageHeader title="Dashboard" />
      
      <Section>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard 
            title="Total Revenue" 
            value="$45,231.89" 
            change="+20.1%" 
            trend="up" 
            icon={ShoppingBag} 
            href="/admin/orders"
          />
          <KPICard 
            title="Active Users" 
            value="2,350" 
            change="+180.1%" 
            trend="up" 
            icon={Users} 
            href="/admin/customers"
          />
          <KPICard 
            title="Pending Orders" 
            value="12" 
            change="-19%" 
            trend="down" 
            icon={Package} 
            href="/admin/orders"
          />
          <KPICard 
            title="System Health" 
            value="98.9%" 
            change="+0.1%" 
            trend="up" 
            icon={Activity} 
            href="/admin/operations/audit"
          />
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Section className="mb-0">
            <Panel>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium">Top Items</h3>
                <Link to="/admin/catalog/products" className="text-sm font-medium text-[#ff0000] hover:underline">
                  View All
                </Link>
              </div>
              <div>
                <TopItem name="Hydrating Serum" sales="1,234" revenue="$45,231" />
                <TopItem name="Matte Lipstick" sales="890" revenue="$21,450" />
                <TopItem name="Night Cream" sales="650" revenue="$32,100" />
                <TopItem name="Vitamin C Booster" sales="430" revenue="$18,900" />
              </div>
            </Panel>
          </Section>

          <Section className="mb-0">
            <Panel>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium">Recent Audit Log</h3>
                <Link to="/admin/operations/audit" className="text-sm font-medium text-[#ff0000] hover:underline">
                  View All
                </Link>
              </div>
              <div>
                <AuditItem user="Admin User" action="updated product" target="Hydrating Serum" time="2 minutes ago" />
                <AuditItem user="Marketing Team" action="published promotion" target="Summer Sale" time="1 hour ago" />
                <AuditItem user="System" action="cleared cache" target="CDN" time="3 hours ago" />
                <AuditItem user="Admin User" action="refunded order" target="#ORD-1234" time="5 hours ago" />
              </div>
            </Panel>
          </Section>
        </div>

        <div className="space-y-6">
          <Section className="mb-0">
            <Panel className="border-l-4 border-l-yellow-400">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <h3 className="text-lg font-medium">System Alerts</h3>
              </div>
              <div>
                <AlertItem 
                  title="High Cache Miss Rate" 
                  description="Cache miss rate exceeded 15% in the last hour." 
                  severity="medium" 
                />
                <AlertItem 
                  title="Inventory Low" 
                  description="Product 'Night Cream' is below safety stock." 
                  severity="high" 
                />
                <AlertItem 
                  title="API Latency" 
                  description="Average response time > 500ms." 
                  severity="medium" 
                />
              </div>
            </Panel>
          </Section>
        </div>
      </div>
    </PageContainer>
  );
}
