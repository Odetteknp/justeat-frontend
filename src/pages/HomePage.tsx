import { useEffect, useState } from "react";
import HomePromoSection from "../components/sections/HomePromoSection";
import CategoriesRow from "../components/sections/CategoriesRow";
import { categoriesMock } from "../mock/categories";
import "./HomePage.css";
import PopularStoresContainer from "../components/PopularStoresContainer";


export default function HomePage() {

  return (
    <div className="container mx-auto px-4 py-6">
      <HomePromoSection />

      <div style={{ height: 24 }}/>

      <div className="container mx-auto px-4 py-6">
        <CategoriesRow items={categoriesMock} />
      </div>

      <div className="container mx-auto px-4 py-6">
        <PopularStoresContainer variant="scroll" cardWidth={220} />
      </div>

    </div>

  );
}
