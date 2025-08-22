import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import RestPage from "./pages/RestaurantsPage";
import HelpPage from "./pages/HelpPage";

import LoginPage from "./pages/login/Login";
import RegisterPage from "./pages/register/Register";

import PartnerRestLayout from "./pages/partner/PartnerRestLayout";
import PartnerRiderLayout from "./pages/partner/PartnerRiderLayout";

function App() {
  return (
    <>
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
          <Route path="/rest" element={<RestPage />} />
          <Route path="/help" element={<HelpPage />} />

          {/* Partner ร้านอาหาร */}
          <Route path="/partner/rest" element={<PartnerRestLayout />}>
            <Route path="overview" element={<div>📊 Overview</div>} />
            <Route path="menu" element={<div>🍔 Menu</div>} />
            <Route path="orders" element={<div>🛒 Orders</div>} />
            <Route path="settings" element={<div>⚙️ Settings</div>} />
          </Route>
          
          {/* Partner Rider */}
          <Route path="/partner/rider" element={<PartnerRiderLayout />}>
            <Route path="dashboard" element={<div>📍 Dashboard</div>} />
            <Route path="jobs" element={<div>🚚 Jobs Today</div>} />
            <Route path="history" element={<div>📖 History</div>} />
            <Route path="settings" element={<div>⚙️ Settings</div>} />
          </Route>
        </Route>

      </Routes>

    </>
  );
}

export default App;
