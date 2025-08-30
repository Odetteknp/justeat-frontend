import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import { getToken } from "./services/tokenStore";

import HomePage from "./pages/HomePage";
import RestPage from "./pages/RestaurantsPage";          
import HelpPage from "./pages/HelpPage";
import MenuPage from "./pages/MenuPage";
import PromoPage from "./pages/PromotionPage";

import LoginPage from "./pages/login/Login";
import RegisterPage from "./pages/register/Register";

// Rider
import { RiderProvider } from "./context/RiderContext";
import RiderLayout from "./layouts/RiderLayout";
import RiderDashboard from "./pages/partner/rider/dashboard";
import RiderWork from "./pages/partner/rider/rider_work";
import RiderHistories from "./pages/partner/rider/rider_work_histories";
import RiderProfile from "./pages/partner/rider/rider_profile";

// Restaurant
import RestaurantLayout from "./layouts/RestaurantLayout";
import RestaurantDashboard from "./pages/partner/restaurant/dashboard";
import RestaurantMenu from "./pages/partner/restaurant/restaurant_menu";
import RestaurantOrder from "./pages/partner/restaurant/restaurant_order";
import RestaurantSetting from "./pages/partner/restaurant/restaurant_setting";

// Admin
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/admin_dashboard";
import AdminReport from "./pages/admin/admin_report";
import AdminRider from "./pages/admin/admin_rider";
import AdminRestaurants from "./pages/admin/admin_restaurant";
import AdminProfile from "./pages/admin/admin_profile";
import AdminPromotion from "./pages/admin/admin_promotion";


// User pages
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import CartPage from "./pages/CartPage";

const isLoggedIn = !!getToken();

export default function App() {
  return (
    <Routes>
      {/* Auth (ไม่มี Header) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Main layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/restaurants" element={<RestPage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
        <Route path="/promotions" element={<PromoPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/help" element={<HelpPage />} />
      </Route>

      {/* Rider layout */}
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

      {/* Restaurant layout */}
      <Route path="/partner/restaurant" element={<RestaurantLayout />}>
        <Route index element={<RestaurantDashboard />} />
        <Route path="dashboard" element={<RestaurantDashboard />} />
        <Route path="order" element={<RestaurantOrder />} />
        <Route path="menu" element={<RestaurantMenu />} />
        <Route path="setting" element={<RestaurantSetting />} />
      </Route>

      {/* Admin layout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="report" element={<AdminReport />} />
        <Route path="rider" element={<AdminRider />} />
        <Route path="restaurant" element={<AdminRestaurants />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="promotion" element={<AdminPromotion />} />
      </Route>
    </Routes>
  );
}
