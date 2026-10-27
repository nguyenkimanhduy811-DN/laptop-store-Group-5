
import { Route, Routes } from 'react-router-dom';

import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import HomePage from './pages/HomePage';
import LaptopListPage from './pages/LaptopListPage';
import LaptopDetailPage from './pages/LaptopDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderListPage from './pages/OrderListPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminLaptopPage from './pages/admin/AdminLaptopPage';
import AdminLaptopFormPage from './pages/admin/AdminLaptopFormPage';
import AdminOrderPage from './pages/admin/AdminOrderPage';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/laptops" element={<LaptopListPage />} />
        <Route path="/laptops/:id" element={<LaptopDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrderListPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminLaptopPage />} />
        <Route path="laptops" element={<AdminLaptopPage />} />
        <Route path="laptops/new" element={<AdminLaptopFormPage />} />
        <Route path="laptops/:id/edit" element={<AdminLaptopFormPage />} />
        <Route path="orders" element={<AdminOrderPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
