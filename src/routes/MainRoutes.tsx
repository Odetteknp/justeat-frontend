import React, { lazy } from "react";
import type { RouteObject } from "react-router-dom";

// Layout ตัวนี้จะเป็นตัวหน้าหลักๆที่ลูกค้าจะเห็น
import MainLayout from "../layouts/MainLayout";

//  จะโชว์ชั่วคราวตอน lazy กำลังโหลด
import Loadable from "../components/third-party/Loadable";

// authen
const LoginPage = Loadable(lazy(() => import("../pages/login/Login")));
const RegisterPage = Loadable(lazy(() => import("../pages/register/Register")));

//  เพจหลัก
const HomePage = Loadable(lazy(() => import("../pages/HomePage")));
const MenuPage = Loadable(lazy(() => import("../pages/MenuPage")));
const RestaurantPage = Loadable(lazy(() => import("../pages/RestaurantsPage")));
const PromotionPage = Loadable(lazy(() => import("../pages/PromotionPage")));
const HelpPage = Loadable(lazy(() => import("../pages/HelpPage")));

// RouteObject สำหรับ Main
const MainRoutes = (): RouteObject => {
  return {
    // root ของลูกค้า ก็หน้า home นั้นแหละ
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },

      {
        path: "menu",
        element: <MenuPage />,
      },

      {
        path: "restaurants",
        element: <RestaurantPage />,
      },

      {
        path: "promotions",
        element: <PromotionPage />,
      },

      {
        path: "help",
        element: <HelpPage />,
      },

      {
        path: "login",
        element: <LoginPage />,
      },

      {
        path: "signup",
        element: <RegisterPage />,
      },
    ],
  };
};

export default MainRoutes;
