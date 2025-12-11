import { useState } from 'react'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles.min.css'
import Filter from './Components/Filter'
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useEffect } from 'react'
import ProductTable from './Components/ProductTable'
import Navbar from './Components/Navbar'
import Footer from './Components/Footer'
import { MainPage } from './pages/MainPage'
import Login from './Components/Login'
import Register from './Components/Register'
import ProductDetailsPage from './pages/ProductDetailsPage'
import SearchPage from './pages/SearchPage'
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
import ChatBot from './Components/ChatBot';
import EnterInfo from './Components/EnterInfo';
import UserProfile from './Components/UserProfile';
import CartPage from './pages/CartPage';

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_API_URL + '/auth/me', { withCredentials: true })
        console.debug('Global profile check:', {
          route: location.pathname,
          response: res.data,
          hasPhone: !!res.data?.phoneNumber,
          hasFullName: !!res.data?.fullName
        });
        const u = res.data || {}
        const missingPhone = !res.data.phoneNumber;
        const missingUname = !res.data.fullName;
        if (missingPhone || missingUname) {
          console.debug('Redirecting to /enter-info due to missing fields');
          navigate('/enter-info');
          return;
        }
      } catch (err) {
        console.debug('Profile check error (probably not logged in):', err.message);
      }
    }
    if (location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/enter-info') {
      checkProfile();
    }
  }, [location.pathname, navigate])
  const showNavAndFooter = ['/login', '/register'].includes(location.pathname)

  return (
    <>
      {!showNavAndFooter && <Navbar />}
      {!showNavAndFooter && <ChatBot />}
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrderPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/brands" element={<BrandPage />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/products/:id" element={<AdminProductDetails />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/brands" element={<AdminBrands />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/:id" element={<UserDetails />} />
        <Route path="*" element={<h2 className="text-center my-5">404 - Page Not Found</h2>} />
        <Route path='/enter-info' element={<EnterInfo />} />
      </Routes>
      {!showNavAndFooter && <Footer />}
    </>
  )
}


function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}


export default App
