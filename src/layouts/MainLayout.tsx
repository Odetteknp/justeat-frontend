// MainLayout
import { Outlet } from "react-router-dom";
import Header from "../components/Header"

export default function MainLayout() {
    const isLoggedIn = !!localStorage.getItem("token");
    return (
        <>
            <Header isLoggedIn={isLoggedIn} />
            <Outlet />
        </>
    )
}