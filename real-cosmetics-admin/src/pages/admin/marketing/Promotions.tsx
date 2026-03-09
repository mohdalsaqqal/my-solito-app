import React, { useState } from 'react';
import { PageContainer, PageHeader, Section, Panel } from '@/components/admin/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Search, Filter, Plus, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/admin/DataTable';

const PROMOTIONS = [
  { id: 'promo_1', name: 'Summer Sale', code: 'SUMMER2024', type: 'Percentage', value: '20%', status: 'Active', startDate: '2024-06-01', endDate: '2024-08-31' },
  { id: 'promo_2', name: 'Welcome Bonus', code: 'WELCOME10', type: 'Fixed Amount', value: '$10.00', status: 'Active', startDate: '2024-01-01', endDate: '2024-12-31' },
  { id: 'promo_3', name: 'Black Friday', code: 'BF2024', type: 'Percentage', value: '50%', status: 'Scheduled', startDate: '2024-11-29', endDate: '2024-11-30' },
  { id: 'promo_4', name: 'Flash Sale', code: 'FLASH50', type: 'Percentage', value: '50%', status: 'Expired', startDate: '2024-01-01', endDate: '2024-01-02' },
];

export default function Promotions() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPromotions = PROMOTIONS.filter((promo) =>
    promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promo.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageContainer>
      <PageHeader title="Promotions">
        <Link to="/admin/marketing/promotions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Promotion
          </Button>
        </Link>
      </PageHeader>
      
      <Section>
        <Panel className="p-0 overflow-hidden">
          <div className="border-b border-gray-200 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search promotions..."
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
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Window</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPromotions.length > 0 ? (
                filteredPromotions.map((promo) => (
                  <TableRow key={promo.id} className="group cursor-pointer hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">{promo.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-gray-100 px-1 py-0.5 text-xs font-mono text-gray-800">{promo.code}</code>
                    </TableCell>
                    <TableCell>{promo.type}</TableCell>
                    <TableCell>{promo.value}</TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {promo.startDate} - {promo.endDate}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          promo.status === 'Active' ? 'success' :
                          promo.status === 'Scheduled' ? 'warning' : 'secondary'
                        }
                        className={
                            promo.status === 'Active' ? 'bg-green-100 text-green-800' :
                            promo.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {promo.status}
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
                      <p>No promotions found.</p>
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
