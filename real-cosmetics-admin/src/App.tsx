import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminShell } from '@/components/admin/AdminShell';
import Dashboard from '@/pages/admin/Dashboard';
import Products from '@/pages/admin/catalog/Products';
import Categories from '@/pages/admin/catalog/Categories';
import Brands from '@/pages/admin/catalog/Brands';
import CatalogQueries from '@/pages/admin/catalog/Queries';
import Promotions from '@/pages/admin/marketing/Promotions';
import PromotionEditor from '@/pages/admin/marketing/Promotions/PromotionEditor';
import Releases from '@/pages/admin/marketing/cms/Releases';
import Blocks from '@/pages/admin/marketing/cms/Blocks';
import CmsQueries from '@/pages/admin/marketing/cms/Queries';
import Orders from '@/pages/admin/Orders';
import Customers from '@/pages/admin/Customers';
import Cache from '@/pages/admin/operations/Cache';
import Audit from '@/pages/admin/operations/Audit';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminShell />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="catalog">
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="brands" element={<Brands />} />
            <Route path="queries" element={<CatalogQueries />} />
          </Route>

          <Route path="marketing">
            <Route path="promotions" element={<Promotions />} />
            <Route path="promotions/new" element={<PromotionEditor />} />
            <Route path="promotions/:id" element={<PromotionEditor />} />
            <Route path="cms">
              <Route path="releases" element={<Releases />} />
              <Route path="blocks" element={<Blocks />} />
              <Route path="queries" element={<CmsQueries />} />
            </Route>
          </Route>

          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />

          <Route path="operations">
            <Route path="cache" element={<Cache />} />
            <Route path="audit" element={<Audit />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
