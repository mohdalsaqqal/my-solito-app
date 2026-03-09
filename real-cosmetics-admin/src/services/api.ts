import { Product, Category, Brand, Customer, Block, CmsQuery, CatalogQuery, CmsRelease, AuditLog } from '@/types';

const STORAGE_KEYS = {
  PRODUCTS: 'admin_products',
  CATEGORIES: 'admin_categories',
  BRANDS: 'admin_brands',
  CUSTOMERS: 'admin_customers',
  BLOCKS: 'admin_blocks',
  CMS_QUERIES: 'admin_cms_queries',
  CATALOG_QUERIES: 'admin_catalog_queries_v2',
  CMS_RELEASES: 'admin_cms_releases',
  AUDIT_LOGS: 'admin_audit_logs',
};

// Initial Mock Data
const INITIAL_PRODUCTS: Product[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `prod_${i + 1}`,
  name: `Product ${i + 1}`,
  category: i % 3 === 0 ? 'Skincare' : i % 3 === 1 ? 'Makeup' : 'Fragrance',
  price: parseFloat((Math.random() * 100).toFixed(2)),
  status: i % 5 === 0 ? 'Draft' : 'Active',
  inventory: Math.floor(Math.random() * 1000),
}));

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Skincare', slug: 'skincare', productCount: 120, status: 'Active' },
  { id: 'cat_2', name: 'Makeup', slug: 'makeup', productCount: 85, status: 'Active' },
  { id: 'cat_3', name: 'Fragrance', slug: 'fragrance', productCount: 45, status: 'Active' },
  { id: 'cat_4', name: 'Haircare', slug: 'haircare', productCount: 30, status: 'Inactive' },
];

const INITIAL_BRANDS: Brand[] = [
  { id: 'br_1', name: 'LuxeBeauty', country: 'France', productCount: 45, status: 'Active' },
  { id: 'br_2', name: 'EcoGlow', country: 'USA', productCount: 32, status: 'Active' },
  { id: 'br_3', name: 'PureSkin', country: 'Korea', productCount: 28, status: 'Active' },
  { id: 'br_4', name: 'ScentSation', country: 'Italy', productCount: 15, status: 'Inactive' },
];

const INITIAL_CUSTOMERS: Customer[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `cust_${i + 1}`,
  name: `Customer ${i + 1}`,
  email: `customer${i + 1}@example.com`,
  phone: `+1 555 010${i}`,
  orders: Math.floor(Math.random() * 20),
  totalSpent: parseFloat((Math.random() * 2000).toFixed(2)),
  status: i % 4 === 0 ? 'Inactive' : 'Active',
  lastOrderDate: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
}));

const INITIAL_BLOCKS: Block[] = [
  { 
    id: 'b1', 
    type: 'hero', 
    title: 'Homepage Hero', 
    status: 'valid',
    data: {
      headline: 'Summer Sale is Here',
      subheadline: 'Get up to 50% off on selected items',
      bgImage: 'https://picsum.photos/seed/hero/800/400',
      ctaText: 'Shop Now'
    }
  },
  { 
    id: 'b2', 
    type: 'text', 
    title: 'Mission Statement', 
    status: 'valid',
    data: {
      content: 'We believe in sustainable beauty that empowers everyone. Our products are 100% vegan and cruelty-free.'
    }
  },
  { 
    id: 'b3', 
    type: 'image', 
    title: 'Summer Collection', 
    status: 'invalid', 
    error: 'Missing alt text',
    data: {
      images: [
        'https://picsum.photos/seed/b3-1/400/400',
        'https://picsum.photos/seed/b3-2/400/400',
        'https://picsum.photos/seed/b3-3/400/400'
      ]
    }
  },
];

const INITIAL_CMS_QUERIES: CmsQuery[] = [
  {
    id: 'q1',
    formId: 'contact-us',
    customerName: 'Alice Smith',
    email: 'alice@example.com',
    subject: 'Product Inquiry',
    message: 'Do you ship to Canada?',
    status: 'New',
    date: '2023-10-25',
  },
  {
    id: 'q2',
    formId: 'newsletter',
    customerName: 'Bob Jones',
    email: 'bob@example.com',
    subject: 'Newsletter Signup',
    message: 'Please add me to your newsletter.',
    status: 'Read',
    date: '2023-10-24',
  },
  {
    id: 'q3',
    formId: 'support',
    customerName: 'Charlie Brown',
    email: 'charlie@example.com',
    subject: 'Order Issue',
    message: 'My order #12345 hasn\'t arrived yet.',
    status: 'Replied',
    date: '2023-10-23',
  },
];

const INITIAL_CATALOG_QUERIES: CatalogQuery[] = [
  { 
    id: 'cq1', 
    slug: 'home-best-items', 
    filters: JSON.stringify({ sort: "bestseller", limit: 12, onSale: true }), 
    isActive: true 
  },
  { 
    id: 'cq2', 
    slug: 'home-new-arrivals', 
    filters: JSON.stringify({ sort: "newest", limit: 12 }), 
    isActive: true 
  },
];

const INITIAL_RELEASES: CmsRelease[] = [
  {
    id: 'rel_1',
    name: 'Summer Sale Launch',
    description: 'Main homepage update for summer campaign',
    status: 'Published',
    scheduledDate: '2023-06-01',
    createdAt: '2023-05-15',
    updatedAt: '2023-05-30'
  },
  {
    id: 'rel_2',
    name: 'Fall Collection Teaser',
    description: 'Early access banner and featured products',
    status: 'Scheduled',
    scheduledDate: '2023-09-01',
    createdAt: '2023-08-20',
    updatedAt: '2023-08-25'
  },
  {
    id: 'rel_3',
    name: 'Black Friday Prep',
    description: 'Drafting layout for holiday sales',
    status: 'Draft',
    createdAt: '2023-10-01',
    updatedAt: '2023-10-05'
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_1',
    action: 'Create',
    entity: 'Product',
    entityId: 'prod_123',
    user: 'admin@realcosmetics.com',
    details: 'Created new product "Summer Lipstick"',
    timestamp: '2023-10-26T10:30:00Z',
    status: 'Success'
  },
  {
    id: 'log_2',
    action: 'Update',
    entity: 'Category',
    entityId: 'cat_1',
    user: 'editor@realcosmetics.com',
    details: 'Updated category "Skincare" description',
    timestamp: '2023-10-26T09:15:00Z',
    status: 'Success'
  },
  {
    id: 'log_3',
    action: 'Delete',
    entity: 'Brand',
    entityId: 'br_4',
    user: 'admin@realcosmetics.com',
    details: 'Deleted brand "ScentSation"',
    timestamp: '2023-10-25T14:20:00Z',
    status: 'Failure'
  },
  {
    id: 'log_4',
    action: 'Login',
    entity: 'User',
    entityId: 'u_1',
    user: 'admin@realcosmetics.com',
    details: 'User logged in',
    timestamp: '2023-10-25T08:00:00Z',
    status: 'Success'
  }
];

// Generic Storage Helper
const getStorage = <T>(key: string, initialData: T[]): T[] => {
  const stored = localStorage.getItem(key);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(key, JSON.stringify(initialData));
  return initialData;
};

const setStorage = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// API Service
export const api = {
  products: {
    list: async (): Promise<Product[]> => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate latency
      return getStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    },
    create: async (product: Omit<Product, 'id'>): Promise<Product> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const products = getStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      const newProduct = { ...product, id: `prod_${Date.now()}` };
      setStorage(STORAGE_KEYS.PRODUCTS, [newProduct, ...products]);
      return newProduct;
    },
    update: async (id: string, updates: Partial<Product>): Promise<Product> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const products = getStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      const index = products.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Product not found');
      const updatedProduct = { ...products[index], ...updates };
      products[index] = updatedProduct;
      setStorage(STORAGE_KEYS.PRODUCTS, products);
      return updatedProduct;
    },
    delete: async (id: string): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const products = getStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      setStorage(STORAGE_KEYS.PRODUCTS, products.filter(p => p.id !== id));
    },
  },

  categories: {
    list: async (): Promise<Category[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return getStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    },
    create: async (category: Omit<Category, 'id'>): Promise<Category> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const categories = getStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
      const newCategory = { ...category, id: `cat_${Date.now()}` };
      setStorage(STORAGE_KEYS.CATEGORIES, [newCategory, ...categories]);
      return newCategory;
    },
    update: async (id: string, updates: Partial<Category>): Promise<Category> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const categories = getStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
      const index = categories.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Category not found');
      const updatedCategory = { ...categories[index], ...updates };
      categories[index] = updatedCategory;
      setStorage(STORAGE_KEYS.CATEGORIES, categories);
      return updatedCategory;
    },
    delete: async (id: string): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const categories = getStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
      setStorage(STORAGE_KEYS.CATEGORIES, categories.filter(c => c.id !== id));
    },
  },

  brands: {
    list: async (): Promise<Brand[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return getStorage(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
    },
    create: async (brand: Omit<Brand, 'id'>): Promise<Brand> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const brands = getStorage(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
      const newBrand = { ...brand, id: `br_${Date.now()}` };
      setStorage(STORAGE_KEYS.BRANDS, [newBrand, ...brands]);
      return newBrand;
    },
    update: async (id: string, updates: Partial<Brand>): Promise<Brand> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const brands = getStorage(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
      const index = brands.findIndex(b => b.id === id);
      if (index === -1) throw new Error('Brand not found');
      const updatedBrand = { ...brands[index], ...updates };
      brands[index] = updatedBrand;
      setStorage(STORAGE_KEYS.BRANDS, brands);
      return updatedBrand;
    },
    delete: async (id: string): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const brands = getStorage(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
      setStorage(STORAGE_KEYS.BRANDS, brands.filter(b => b.id !== id));
    },
  },

  customers: {
    list: async (): Promise<Customer[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return getStorage(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    },
    update: async (id: string, updates: Partial<Customer>): Promise<Customer> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const customers = getStorage(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
      const index = customers.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Customer not found');
      const updatedCustomer = { ...customers[index], ...updates };
      customers[index] = updatedCustomer;
      setStorage(STORAGE_KEYS.CUSTOMERS, customers);
      return updatedCustomer;
    },
    delete: async (id: string): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const customers = getStorage(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
      setStorage(STORAGE_KEYS.CUSTOMERS, customers.filter(c => c.id !== id));
    },
  },

  blocks: {
    list: async (): Promise<Block[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return getStorage(STORAGE_KEYS.BLOCKS, INITIAL_BLOCKS);
    },
    updateAll: async (blocks: Block[]): Promise<Block[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setStorage(STORAGE_KEYS.BLOCKS, blocks);
      return blocks;
    },
    create: async (block: Omit<Block, 'id'>): Promise<Block> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const blocks = getStorage(STORAGE_KEYS.BLOCKS, INITIAL_BLOCKS);
      const newBlock = { ...block, id: `b${Date.now()}` };
      setStorage(STORAGE_KEYS.BLOCKS, [...blocks, newBlock]);
      return newBlock;
    },
    delete: async (id: string): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const blocks = getStorage(STORAGE_KEYS.BLOCKS, INITIAL_BLOCKS);
      setStorage(STORAGE_KEYS.BLOCKS, blocks.filter(b => b.id !== id));
    },
  },

  cmsQueries: {
    list: async (): Promise<CmsQuery[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return getStorage(STORAGE_KEYS.CMS_QUERIES, INITIAL_CMS_QUERIES);
    },
    update: async (id: string, updates: Partial<CmsQuery>): Promise<CmsQuery> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const queries = getStorage(STORAGE_KEYS.CMS_QUERIES, INITIAL_CMS_QUERIES);
      const index = queries.findIndex(q => q.id === id);
      if (index === -1) throw new Error('Query not found');
      const updatedQuery = { ...queries[index], ...updates };
      queries[index] = updatedQuery;
      setStorage(STORAGE_KEYS.CMS_QUERIES, queries);
      return updatedQuery;
    },
    delete: async (id: string): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const queries = getStorage(STORAGE_KEYS.CMS_QUERIES, INITIAL_CMS_QUERIES);
      setStorage(STORAGE_KEYS.CMS_QUERIES, queries.filter(q => q.id !== id));
    },
  },

  catalogQueries: {
    list: async (): Promise<CatalogQuery[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return getStorage(STORAGE_KEYS.CATALOG_QUERIES, INITIAL_CATALOG_QUERIES);
    },
    create: async (query: Omit<CatalogQuery, 'id'>): Promise<CatalogQuery> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const queries = getStorage(STORAGE_KEYS.CATALOG_QUERIES, INITIAL_CATALOG_QUERIES);
      const newQuery = { ...query, id: `cq_${Date.now()}` };
      setStorage(STORAGE_KEYS.CATALOG_QUERIES, [newQuery, ...queries]);
      return newQuery;
    },
    delete: async (id: string): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const queries = getStorage(STORAGE_KEYS.CATALOG_QUERIES, INITIAL_CATALOG_QUERIES);
      setStorage(STORAGE_KEYS.CATALOG_QUERIES, queries.filter(q => q.id !== id));
    },
  },

  releases: {
    list: async (): Promise<CmsRelease[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return getStorage(STORAGE_KEYS.CMS_RELEASES, INITIAL_RELEASES);
    },
    create: async (release: Omit<CmsRelease, 'id' | 'createdAt' | 'updatedAt'>): Promise<CmsRelease> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const releases = getStorage(STORAGE_KEYS.CMS_RELEASES, INITIAL_RELEASES);
      const now = new Date().toISOString().split('T')[0];
      const newRelease = { 
        ...release, 
        id: `rel_${Date.now()}`,
        createdAt: now,
        updatedAt: now
      };
      setStorage(STORAGE_KEYS.CMS_RELEASES, [newRelease, ...releases]);
      return newRelease;
    },
    update: async (id: string, updates: Partial<CmsRelease>): Promise<CmsRelease> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const releases = getStorage(STORAGE_KEYS.CMS_RELEASES, INITIAL_RELEASES);
      const index = releases.findIndex(r => r.id === id);
      if (index === -1) throw new Error('Release not found');
      
      const updatedRelease = { 
        ...releases[index], 
        ...updates,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      releases[index] = updatedRelease;
      setStorage(STORAGE_KEYS.CMS_RELEASES, releases);
      return updatedRelease;
    },
    delete: async (id: string): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const releases = getStorage(STORAGE_KEYS.CMS_RELEASES, INITIAL_RELEASES);
      setStorage(STORAGE_KEYS.CMS_RELEASES, releases.filter(r => r.id !== id));
    },
  },

  audit: {
    list: async (): Promise<AuditLog[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return getStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    },
  },
};
