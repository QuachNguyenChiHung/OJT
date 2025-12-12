
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles.min.css'
import Filter from './Components/Filter'
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import api from './api/axios'
import { useEffect } from 'react'
import ProductTable from './Components/ProductTable'
import Navbar from './Components/Navbar'
import Footer from './Components/Footer'
import { MainPage } from './pages/MainPage'
import Login from './Components/Login'
import Register from './Components/Register'
import ProductDetailsPage from './pages/ProductDetailsPage'
// SearchPage removed - search is now inline on HomePage
import OrderPage from './pages/OrderPage'
import OrderForm from './Components/OrderForm'
import AdminProducts from './admin/AdminProducts'
import AdminProductDetails from './admin/AdminProductDetails'
import AdminCategories from './admin/AdminCategories'
import CategoryPage from './pages/CategoryPage'
import BrandPage from './pages/BrandPage'
import AdminBrands from './admin/AdminBrands'
import AdminUsers from './admin/AdminUsers'
import UserDetails from './admin/UserDetails'
import AdminOrders from './admin/AdminOrders'
import AdminOrderDetails from './admin/AdminOrderDetails'
import AdminHomeSections from './admin/AdminHomeSections'
import AdminSale from './admin/AdminSale'
import ChatBot from './Components/ChatBot';
import { ToastProvider } from './Components/Toast';
import EnterInfo from './Components/EnterInfo';
import UserProfile from './Components/UserProfile';
import UpdateProfile from './Components/UpdateProfile';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ForgotPassword from './Components/ForgotPassword';
import HomePage from './pages/HomePage';
import WishlistPage from './pages/WishlistPage';
import ReviewPage from './pages/ReviewPage';

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Pages that require complete profile (phone + name)
  const profileRequiredPages = ['/checkout', '/orders', '/profile', '/update-profile'];
  
  useEffect(() => {
    const checkProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return; // Not logged in, skip check
      
      // Only check profile for pages that require it
      const needsProfileCheck = profileRequiredPages.some(p => location.pathname.startsWith(p));
      if (!needsProfileCheck) return;
      
      try {
        const res = await api.get('/auth/me')
        const missingPhone = !res.data?.phoneNumber;
        const missingUname = !res.data?.fullName;
        if (missingPhone || missingUname) {
          navigate('/enter-info');
          return;
        }
      } catch (err) {
        console.debug('Profile check error:', err.message);
      }
    }
    checkProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, navigate]);

  // Pages that should NOT show footer
  const hideFooterPages = ['/login', '/register', '/forgot-password', '/home', '/product', '/cart', '/checkout', '/orders', '/profile', '/update-profile', '/brands', '/admin', '/enter-info'];
  const shouldHideFooter = hideFooterPages.some(p => location.pathname.startsWith(p)) || location.pathname !== '/';
  
  // Only show footer on MainPage (/)
  const showFooter = location.pathname === '/';

  return (
    <>
      <ChatBot />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        {/* /search removed - search is now inline on HomePage */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrderPage />} />
        <Route path="/review/:productId" element={<ReviewPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
        <Route path="/brands" element={<BrandPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/admin" element={<AdminProducts />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/products/:id" element={<AdminProductDetails />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/brands" element={<AdminBrands />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/:id" element={<UserDetails />} />
        <Route path="/admin/home-sections" element={<AdminHomeSections />} />
        <Route path="/admin/sale" element={<AdminSale />} />
        <Route path="*" element={<h2 className="text-center my-5">404 - Page Not Found</h2>} />
        <Route path='/enter-info' element={<EnterInfo />} />
      </Routes>
      {showFooter && <Footer />}
    </>
  )
}


function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Layout />
      </ToastProvider>
    </BrowserRouter>
  )
}


export default App