import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader, Section, Panel } from '@/components/admin/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Trash2, Code, Sliders } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/admin/DataTable';
import { api } from '@/services/api';
import { CatalogQuery, Category } from '@/types';

export default function CatalogQueries() {
  const [queries, setQueries] = useState<CatalogQuery[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newSlug, setNewSlug] = useState('');
  const [newFilters, setNewFilters] = useState('{ "sort": "bestseller", "limit": 8 }');
  const [isBuilderMode, setIsBuilderMode] = useState(true);

  // Builder State
  const [sort, setSort] = useState('bestseller');
  const [limit, setLimit] = useState(8);
  const [onSale, setOnSale] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    loadQueries();
    loadCategories();
  }, []);

  // Update JSON when builder state changes
  useEffect(() => {
    if (isBuilderMode) {
      const filterObj: any = {
        sort,
        limit: Number(limit),
      };
      
      if (onSale) filterObj.onSale = true;
      if (selectedCategory) filterObj.category = selectedCategory;
      if (minPrice) filterObj.minPrice = Number(minPrice);
      if (maxPrice) filterObj.maxPrice = Number(maxPrice);

      setNewFilters(JSON.stringify(filterObj, null, 2));
    }
  }, [sort, limit, onSale, selectedCategory, minPrice, maxPrice, isBuilderMode]);

  const loadQueries = async () => {
    setIsLoading(true);
    try {
      const data = await api.catalogQueries.list();
      setQueries(data);
    } catch (error) {
      console.error('Failed to load queries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.categories.list();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleCreate = async () => {
    if (!newSlug || !newFilters) return;

    try {
      // Validate JSON
      JSON.parse(newFilters);
      
      await api.catalogQueries.create({
        slug: newSlug,
        filters: newFilters,
        isActive: true
      });
      
      setNewSlug('');
      // Reset builder defaults
      setSort('bestseller');
      setLimit(8);
      setOnSale(false);
      setSelectedCategory('');
      setMinPrice('');
      setMaxPrice('');
      
      loadQueries();
    } catch (error) {
      alert('Invalid JSON format');
      console.error('Failed to create query:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this query?')) {
      try {
        await api.catalogQueries.delete(id);
        loadQueries();
      } catch (error) {
        console.error('Failed to delete query:', error);
      }
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Catalog / Queries" 
        description="Reusable ProductFilter presets used by rails and CMS."
      />
      
      <Section>
        <Panel>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Query Slug
                </label>
                <Input 
                  placeholder="e.g. home-best-items" 
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Product Filter Configuration
                </label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setIsBuilderMode(true)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      isBuilderMode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Sliders className="h-3 w-3" />
                    Builder
                  </button>
                  <button
                    onClick={() => setIsBuilderMode(false)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      !isBuilderMode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Code className="h-3 w-3" />
                    JSON
                  </button>
                </div>
              </div>

              {isBuilderMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Sort Order</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <option value="bestseller">Bestsellers</option>
                      <option value="newest">Newest Arrivals</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Limit Items</label>
                    <Input
                      type="number"
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      min={1}
                      max={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Price Range</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="onSale"
                      className="h-4 w-4 rounded border-gray-300 text-[#ff0000] focus:ring-[#ff0000]"
                      checked={onSale}
                      onChange={(e) => setOnSale(e.target.checked)}
                    />
                    <label htmlFor="onSale" className="text-sm font-medium text-gray-700">
                      Show On Sale Items Only
                    </label>
                  </div>
                </div>
              ) : (
                <textarea 
                  className="flex min-h-[200px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0000]"
                  value={newFilters}
                  onChange={(e) => setNewFilters(e.target.value)}
                />
              )}

              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">
                  Preview: {newFilters.length > 60 ? newFilters.substring(0, 60) + '...' : newFilters}
                </div>
                <Button 
                  className="bg-[#dc2626] hover:bg-[#b91c1c] text-white"
                  onClick={handleCreate}
                >
                  Create query
                </Button>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-4">
                All filtering is centralized through ProductProvider.list(filters).
              </p>

              <div className="rounded-md border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filters</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                          Loading queries...
                        </TableCell>
                      </TableRow>
                    ) : queries.length > 0 ? (
                      queries.map((query) => (
                        <TableRow key={query.id} className="group hover:bg-gray-50">
                          <TableCell className="font-medium text-gray-900 py-4">{query.slug}</TableCell>
                          <TableCell className="py-4">
                            <Badge 
                              className="bg-green-50 text-green-700 hover:bg-green-100 border-green-100 font-normal"
                            >
                              Active
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-gray-600 py-4 max-w-md truncate">
                            {query.filters}
                          </TableCell>
                          <TableCell className="text-right py-4">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600" 
                              onClick={() => handleDelete(query.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                          No queries found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </Panel>
      </Section>
    </PageContainer>
  );
}
