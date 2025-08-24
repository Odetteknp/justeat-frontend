import { Routes, Route, useLocation } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import RestPage from "./pages/RestaurantsPage";
import HelpPage from "./pages/HelpPage";

import LoginPage from "./pages/login/Login";
import RegisterPage from "./pages/register/Register";

import PartnerRestLayout from "./pages/partner/PartnerRestLayout";

// เพจของไรเดอร์
import RiderLayout from "./components/RiderLayout";
import RiderDashboard from "./pages/partner/rider/dashboard";
import RiderWork from "./pages/partner/rider/rider_work";
import RiderHistories from "./pages/partner/rider/rider_work_histories";
import RiderProfile from "./pages/partner/rider/rider_profile";

import RestaurantDetailPage from "./pages/RestaurantDetailPage";

export default function App() {
  return (
    <Routes>
      {/* Auth (ไม่มี Header) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* กลุ่มที่มี Header (MainLayout ครอบ) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/rest" element={<RestPage />} />
        <Route path="/help" element={<HelpPage />} />

        {/* Partner ร้านอาหาร (ยังอยู่ใต้ MainLayout ถ้ายังอยากให้มี Header) */}
        <Route path="/partner/rest" element={<PartnerRestLayout />}>
          <Route path="overview" element={<div>📊 Overview</div>} />
          <Route path="menu" element={<div>🍔 Menu</div>} />
          <Route path="orders" element={<div>🛒 Orders</div>} />
          <Route path="settings" element={<div>⚙️ Settings</div>} />
        </Route>
      </Route>

      {/* Rider layout แยกออกมา (ไม่มี Header ของ MainLayout) */}
      <Route path="/partner/rider" element={<RiderLayout />}>
        <Route index element={<RiderDashboard />} />
        <Route path="dashboard" element={<RiderDashboard />} />
        <Route path="work" element={<RiderWork />} />
        <Route path="histories" element={<RiderHistories />} />
        <Route path="profile" element={<RiderProfile />} />
      </Route>

      {/* หน้ารายละเอียดร้าน */}
      <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
    </Routes>
  );
}