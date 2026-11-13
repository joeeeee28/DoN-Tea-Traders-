import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import {
  CategoriesPage,
  OurSourcingPage,
  OurStoryPage,
  TeaOriginsPage,
} from './pages/StorySourcingOriginsPages';
import { WholesalePage } from './pages/WholesalePage';
import { BlogDetailPage, BlogListPage } from './pages/BlogPages';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { ContactPage, FaqsPage, PolicyPage } from './pages/ContactPolicyFaqPages';
import { AccountPage } from './pages/AccountPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#29251F]">
      <ScrollToTop />
      <Header />
      <CartDrawer />
      <SearchModal />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/our-story" element={<OurStoryPage />} />
          <Route path="/our-sourcing" element={<OurSourcingPage />} />
          <Route path="/tea-origins" element={<TeaOriginsPage />} />
          <Route path="/wholesale" element={<WholesalePage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/order-confirmation/:reference"
            element={<OrderConfirmationPage />}
          />
          <Route path="/policies/shipping" element={<PolicyPage type="shipping" />} />
          <Route path="/policies/returns" element={<PolicyPage type="returns" />} />
          <Route path="/policies/privacy" element={<PolicyPage type="privacy" />} />
          <Route path="/policies/terms" element={<PolicyPage type="terms" />} />
          <Route path="/faqs" element={<FaqsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <AppShell />
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
