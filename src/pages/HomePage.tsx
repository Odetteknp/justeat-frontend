import { useEffect, useState } from "react";
import HomePromoSection from "../components/sections/HomePromoSection";
import CategoriesRow from "../components/sections/CategoriesRow";
import { categoriesMock } from "../mock/categories";
import "./HomePage.css";


export default function HomePage() {

  return (
    <div className="container mx-auto px-4 py-6">
      <HomePromoSection />

      <div style={{ height: 24 }}/>

      <div className="CatagoiresRow">
        <CategoriesRow items={categoriesMock} />
      </div>

    </div>

  );
}
