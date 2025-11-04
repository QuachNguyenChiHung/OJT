import { useState } from 'react'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles.min.css'
import Filter from './Components/Filter'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
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
import ChatBot from './Components/ChatBot';

function Layout() {
  const location = useLocation()
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
        <Route path="/orders" element={<OrderPage />} />
        <Route path="/brands" element={<BrandPage />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/products/:id" element={<AdminProductDetails />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/brands" element={<AdminBrands />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/:id" element={<UserDetails />} />
        <Route path="*" element={<h2 className="text-center my-5">404 - Page Not Found</h2>} />
        <Route path='/enter-info' element={<OrderForm />} />
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
