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
import RiderLayout from "./layouts/RiderLayout";
import RiderDashboard from "./pages/partner/rider/dashboard";
import RiderWork from "./pages/partner/rider/rider_work";
import RiderHistories from "./pages/partner/rider/rider_work_histories";
import RiderProfile from "./pages/partner/rider/rider_profile";

// เพจของร้านอาหาร
import RestaurantLayout from "./layouts/RestaurantLayout";
import RestaurantDashboard from "./pages/partner/restaurant/dashboard";
import RestaurantMenu from "./pages/partner/restaurant/restaurant_menu";
import RestaurantOrder from "./pages/partner/restaurant/restaurant_order";
import RestaurantSetting from "./pages/partner/restaurant/restaurant_setting";

import { RiderProvider } from "./context/RiderContext";

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

      </Route>

      {/* Rider layout แยกออกมา (ไม่มี Header ของ MainLayout) */}
      <Route
        path="/partner/rider"
        element={
          <RiderProvider>
            <RiderLayout />
          </RiderProvider>
        }
      >
        <Route index element={<RiderDashboard />} />
        <Route path="dashboard" element={<RiderDashboard />} />
        <Route path="work" element={<RiderWork />} />
        <Route path="histories" element={<RiderHistories />} />
        <Route path="profile" element={<RiderProfile />} />
      </Route>

      {/* Restaurant layout แยกออกมา (ไม่มี Header ของ MainLayout) */}
      <Route
        path="/partner/restaurant"
        element={
            <RestaurantLayout />
        }
      >
        <Route index element={<RestaurantDashboard />} />
        <Route path="dashboard" element={<RestaurantDashboard />} />
        <Route path="order" element={<RestaurantOrder />} />
        <Route path="menu" element={<RestaurantMenu />} />
        <Route path="setting" element={<RestaurantSetting />} />
      </Route>

      {/* หน้ารายละเอียดร้าน */}
    </Routes>
  );
}