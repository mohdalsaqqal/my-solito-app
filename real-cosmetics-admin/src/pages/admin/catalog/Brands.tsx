import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader, Section, Panel } from '@/components/admin/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Search, Filter, Download, Plus, MoreHorizontal, X, Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/admin/DataTable';
import { Dialog } from '@/components/ui/Dialog';
import { api } from '@/services/api';
import { Brand } from '@/types';

export default function Brands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBrand, setNewBrand] = useState<Partial<Brand>>({
    name: '',
    country: '',
    productCount: 0,
    status: 'Active',
  });

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setIsLoading(true);
    try {
      const data = await api.brands.list();
      setBrands(data);
    } catch (error) {
      console.error('Failed to load brands:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBrand = async () => {
    try {
      await api.brands.create(newBrand as Omit<Brand, 'id'>);
      setIsCreateOpen(false);
      loadBrands();
      setNewBrand({
        name: '',
        country: '',
        productCount: 0,
        status: 'Active',
      });
    } catch (error) {
      console.error('Failed to create brand:', error);
    }
  };

  const handleDeleteBrand = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this brand?')) {
      try {
        await api.brands.delete(id);
        loadBrands();
      } catch (error) {
        console.error('Failed to delete brand:', error);
      }
    }
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageContainer>
      <PageHeader title="Brands">
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Brand
        </Button>
      </PageHeader>
      
      <Section>
        <Panel className="p-0 overflow-hidden">
          <div className="border-b border-gray-200 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search brands..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
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
                <TableHead>Brand Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                    Loading brands...
                  </TableCell>
                </TableRow>
              ) : filteredBrands.length > 0 ? (
                filteredBrands.map((brand) => (
                  <TableRow key={brand.id} className="group cursor-pointer hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">{brand.name}</TableCell>
                    <TableCell>{brand.country}</TableCell>
                    <TableCell>{brand.productCount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={brand.status === 'Active' ? 'success' : 'secondary'}
                        className={brand.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      >
                        {brand.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                            <Edit className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => handleDeleteBrand(brand.id, e)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <p>No brands found.</p>
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

      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Brand"
        footer={
            <>
                <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateBrand}>Create Brand</Button>
            </>
        }
      >
        <div className="space-y-4">
            <div className="grid gap-2">
                <label className="text-sm font-medium">Brand Name</label>
                <Input 
                    value={newBrand.name}
                    onChange={(e) => setNewBrand({...newBrand, name: e.target.value})}
                    placeholder="e.g. LuxeBeauty"
                />
            </div>
            <div className="grid gap-2">
                <label className="text-sm font-medium">Country</label>
                <Input 
                    value={newBrand.country}
                    onChange={(e) => setNewBrand({...newBrand, country: e.target.value})}
                    placeholder="e.g. France"
                />
            </div>
            <div className="grid gap-2">
                <label className="text-sm font-medium">Status</label>
                <select 
                    className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0000]"
                    value={newBrand.status}
                    onChange={(e) => setNewBrand({...newBrand, status: e.target.value as any})}
                >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>
        </div>
      </Dialog>
    </PageContainer>
  );
}
