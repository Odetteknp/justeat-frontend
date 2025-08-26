// MainLayout
import { Outlet } from "react-router-dom";
import Header from "../components/header/Header";
import { getToken } from "../services/tokenStore";

export default function MainLayout() {
  const isLoggedIn = !!getToken();
  return (
    <>
      <Header isLoggedIn={isLoggedIn} />
      <Outlet />
    </>
  );
}
