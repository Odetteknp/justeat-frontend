// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PartnerRestLayout from "./pages/partner/PartnerRestLayout";
import PartnerRiderLayout from "./pages/partner/PartnerRiderLayout";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import HelpPage from "./pages/HelpPage";

function App() {
  return (
    <>
      <Header isLoggedIn={false} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
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
      </Routes>
    </>
  );
}

export default App;
