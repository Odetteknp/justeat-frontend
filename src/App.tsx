import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import { getToken } from "./services/tokenStore";

import HomePage from "./pages/HomePage";
import RestPage from "./pages/RestaurantsPage";          // รายการร้าน
import HelpPage from "./pages/HelpPage";
import MenuPage from "./pages/MenuPage";
import PromoPage from "./pages/PromotionPage";

import LoginPage from "./pages/login/Login";
import RegisterPage from "./pages/register/Register";

import PartnerRestLayout from "./pages/partner/PartnerRestLayout";
import PartnerRiderLayout from "./pages/partner/PartnerRiderLayout";

import RestaurantDetailPage from "./pages/RestaurantDetailPage"; // รายละเอียด/เมนูร้าน
import CartPage from "./pages/CartPage";

const isLoggedIn = !!getToken();

function App() {
  return (
    
    <Routes>
      {/* Auth (ไม่มี Header) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* กลุ่มที่มี Header */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/restaurants" element={<RestPage />} />            {/* เดิม /rest */}
        <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
        <Route path="/promotions" element={<PromoPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/help" element={<HelpPage />} />

        {/* Partner ร้านอาหาร */}
        <Route 
          path="/partner/rest" 
          element={
            // <ProtectedRoute allow={isLoggedIn}>
              <PartnerRestLayout />
            // </ProtectedRoute>
            }
          >
          <Route path="overview" element={<div>📊 Overview</div>} />
          <Route path="menu" element={<div>🍔 Menu</div>} />
          <Route path="orders" element={<div>🛒 Orders</div>} />
          <Route path="settings" element={<div>⚙️ Settings</div>} />
        </Route>

        {/* Partner Rider */}
        <Route
          path="/partner/rider"
          element={
            // <ProtectedRoute allow={isLoggedIn}>
              <PartnerRiderLayout />
            // </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<div>📍 Dashboard</div>} />
          <Route path="jobs" element={<div>🚚 Jobs Today</div>} />
          <Route path="history" element={<div>📖 History</div>} />
          <Route path="settings" element={<div>⚙️ Settings</div>} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
