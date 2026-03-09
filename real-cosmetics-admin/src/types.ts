export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  status: 'Active' | 'Draft' | 'Archived';
  inventory: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  status: 'Active' | 'Inactive';
}

export interface Brand {
  id: string;
  name: string;
  country: string;
  productCount: number;
  status: 'Active' | 'Inactive';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  status: 'Active' | 'Inactive' | 'Blocked';
  lastOrderDate: string;
}

export interface BlockData {
  headline?: string;
  subheadline?: string;
  bgImage?: string;
  ctaText?: string;
  content?: string;
  images?: string[];
}

export interface Block {
  id: string;
  type: 'hero' | 'text' | 'image';
  title: string;
  status: 'valid' | 'invalid';
  error?: string;
  data?: BlockData;
}

export interface CmsQuery {
  id: string;
  formId: string;
  customerName: string;
  email: string;
  subject: string;
  message: string;
  status: 'New' | 'Read' | 'Replied';
  date: string;
}

export interface CatalogQuery {
  id: string;
  slug: string;
  filters: string;
  isActive: boolean;
}

export interface CmsRelease {
  id: string;
  name: string;
  description?: string;
  status: 'Draft' | 'Scheduled' | 'Published';
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  user: string;
  details: string;
  timestamp: string;
  status: 'Success' | 'Failure';
}
