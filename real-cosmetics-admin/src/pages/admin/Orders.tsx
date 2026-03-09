import React, { useState } from 'react';
import { PageContainer, PageHeader, Section, Panel } from '@/components/admin/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Search, Filter, Download, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/admin/DataTable';

const ORDERS = Array.from({ length: 8 }).map((_, i) => ({
  id: `ord_${1000 + i}`,
  customer: `Customer ${i + 1}`,
  date: new Date().toISOString().split('T')[0],
  total: (Math.random() * 500).toFixed(2),
  status: ['Pending', 'Processing', 'Shipped', 'Delivered'][i % 4],
  items: Math.floor(Math.random() * 5) + 1,
}));

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = ORDERS.filter((order) =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageContainer>
      <PageHeader title="Orders" />
      
      <Section>
        <Panel className="p-0 overflow-hidden">
          <div className="border-b border-gray-200 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="group cursor-pointer hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>${order.total}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === 'Delivered' ? 'success' :
                          order.status === 'Shipped' ? 'default' :
                          order.status === 'Processing' ? 'secondary' : 'warning'
                        }
                        className={
                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'Processing' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <p>No orders found.</p>
                      <Button variant="link" className="mt-2 text-[#ff0000]" onClick={() => setSearchTerm('')}>
                        Clear search
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <div className="text-xs text-gray-500">
              Showing <strong>1-{filteredOrders.length}</strong> of <strong>{ORDERS.length}</strong> orders
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </Panel>
      </Section>
    </PageContainer>
  );
}
