import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader, Section, Panel } from '@/components/admin/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Search, Filter, Download, Plus, MoreHorizontal, X, Trash2, Edit } from 'lucide-react';
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
import { Product } from '@/types';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    minPrice: '',
    maxPrice: '',
  });

  // New Product State
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    category: 'Skincare',
    price: 0,
    status: 'Draft',
    inventory: 0,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await api.products.list();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    try {
      await api.products.create(newProduct as Omit<Product, 'id'>);
      setIsCreateOpen(false);
      loadProducts();
      setNewProduct({
        name: '',
        category: 'Skincare',
        price: 0,
        status: 'Draft',
        inventory: 0,
      });
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const handleDeleteProduct = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.products.delete(id);
        loadProducts();
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filters.category || product.category === filters.category;
    const matchesStatus = !filters.status || product.status === filters.status;
    const matchesMinPrice = !filters.minPrice || product.price >= parseFloat(filters.minPrice);
    const matchesMaxPrice = !filters.maxPrice || product.price <= parseFloat(filters.maxPrice);

    return matchesSearch && matchesCategory && matchesStatus && matchesMinPrice && matchesMaxPrice;
  });

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const clearFilters = () => {
    setFilters({
      category: '',
      status: '',
      minPrice: '',
      maxPrice: '',
    });
    setIsFilterOpen(false);
  };

  return (
    <PageContainer>
      <PageHeader title="Products">
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </PageHeader>
      
      <Section>
        <Panel className="p-0 overflow-hidden">
          <div className="border-b border-gray-200 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button 
                    variant={activeFiltersCount > 0 ? 'secondary' : 'outline'} 
                    size="sm"
                    onClick={() => setIsFilterOpen(true)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 rounded-full bg-gray-900 px-1.5 py-0.5 text-[10px] text-white">
                        {activeFiltersCount}
                    </span>
                  )}
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2">
                <span className="text-xs font-medium text-gray-500">Active Filters:</span>
                {filters.category && (
                    <Badge variant="secondary" className="gap-1">
                        Category: {filters.category}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({...filters, category: ''})} />
                    </Badge>
                )}
                {filters.status && (
                    <Badge variant="secondary" className="gap-1">
                        Status: {filters.status}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({...filters, status: ''})} />
                    </Badge>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                    <Badge variant="secondary" className="gap-1">
                        Price: {filters.minPrice || '0'} - {filters.maxPrice || '∞'}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({...filters, minPrice: '', maxPrice: ''})} />
                    </Badge>
                )}
                <Button variant="link" size="sm" onClick={clearFilters} className="ml-auto text-xs h-auto p-0">
                    Clear All
                </Button>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className="group cursor-pointer hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.inventory}</TableCell>
                    <TableCell>
                      <Badge
                        variant={product.status === 'Active' ? 'success' : 'secondary'}
                        className={product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                            <Edit className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => handleDeleteProduct(product.id, e)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <p>No products found.</p>
                      <Button variant="link" className="mt-2 text-[#ff0000]" onClick={() => {setSearchTerm(''); clearFilters();}}>
                        Clear search & filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <div className="text-xs text-gray-500">
              Showing <strong>1-{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </Panel>
      </Section>

      {/* Filter Dialog */}
      <Dialog
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Products"
        footer={
            <>
                <Button variant="ghost" onClick={() => setIsFilterOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
            </>
        }
      >
        <div className="space-y-4">
            <div className="grid gap-2">
                <label className="text-sm font-medium">Category</label>
                <select 
                    className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0000]"
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                >
                    <option value="">All Categories</option>
                    <option value="Skincare">Skincare</option>
                    <option value="Makeup">Makeup</option>
                    <option value="Fragrance">Fragrance</option>
                </select>
            </div>
            <div className="grid gap-2">
                <label className="text-sm font-medium">Status</label>
                <select 
                    className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0000]"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                </select>
            </div>
            <div className="grid gap-2">
                <label className="text-sm font-medium">Price Range</label>
                <div className="flex gap-2">
                    <Input 
                        type="number" 
                        placeholder="Min" 
                        value={filters.minPrice}
                        onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                    />
                    <Input 
                        type="number" 
                        placeholder="Max" 
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                    />
                </div>
            </div>
        </div>
      </Dialog>

      {/* Create Product Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Product"
        footer={
            <>
                <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateProduct}>Create Product</Button>
            </>
        }
      >
        <div className="space-y-4">
            <div className="grid gap-2">
                <label className="text-sm font-medium">Product Name</label>
                <Input 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="e.g. Summer Glow Serum"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Category</label>
                    <select 
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0000]"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    >
                        <option value="Skincare">Skincare</option>
                        <option value="Makeup">Makeup</option>
                        <option value="Fragrance">Fragrance</option>
                    </select>
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Status</label>
                    <select 
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0000]"
                        value={newProduct.status}
                        onChange={(e) => setNewProduct({...newProduct, status: e.target.value as any})}
                    >
                        <option value="Draft">Draft</option>
                        <option value="Active">Active</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Price ($)</label>
                    <Input 
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                    />
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Inventory</label>
                    <Input 
                        type="number"
                        value={newProduct.inventory}
                        onChange={(e) => setNewProduct({...newProduct, inventory: parseInt(e.target.value)})}
                    />
                </div>
            </div>
        </div>
      </Dialog>
    </PageContainer>
  );
}
