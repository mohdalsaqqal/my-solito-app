import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader, Section, Panel } from '@/components/admin/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Search, Filter, Download, MoreHorizontal, Mail, Phone, Ban, CheckCircle } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/admin/DataTable';
import { api } from '@/services/api';
import { Customer } from '@/types';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await api.customers.list();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
        await api.customers.update(id, { status: newStatus as any });
        loadCustomers();
    } catch (error) {
        console.error('Failed to update customer status:', error);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageContainer>
      <PageHeader title="Customers">
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </PageHeader>
      
      <Section>
        <Panel className="p-0 overflow-hidden">
          <div className="border-b border-gray-200 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search customers..."
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
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="group cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-xs text-gray-500">{customer.id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-xs text-gray-600">
                          <Mail className="mr-1.5 h-3 w-3" />
                          {customer.email}
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Phone className="mr-1.5 h-3 w-3" />
                          {customer.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{customer.orders}</TableCell>
                    <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                    <TableCell>{customer.lastOrderDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={customer.status === 'Active' ? 'success' : customer.status === 'Blocked' ? 'destructive' : 'secondary'}
                        className={
                            customer.status === 'Active' ? 'bg-green-100 text-green-800' : 
                            customer.status === 'Blocked' ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'
                        }
                      >
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => handleToggleStatus(customer.id, customer.status, e)}
                            title={customer.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                            {customer.status === 'Active' ? (
                                <Ban className="h-4 w-4 text-red-500" />
                            ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                        </Button>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <p>No customers found.</p>
                      <Button variant="link" className="mt-2 text-[#ff0000]" onClick={() => setSearchTerm('')}>
                        Clear search
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Panel>
      </Section>
    </PageContainer>
  );
}
