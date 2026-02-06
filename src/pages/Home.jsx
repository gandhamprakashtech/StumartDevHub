import { Link, useNavigate } from "react-router";
import { useEffect, useState, useRef } from "react";
import { getProducts } from "../services/productService";
import ChooseStumart from "../components/home/ChooseStumart";
import HowItWorks from "../components/home/HowItWorks";
import Statistics from "../components/home/Statistics";
import FeaturedProducts from "../components/home/FeaturedProducts";
import Hero from "../components/home/Hero";

export default function Home() {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100 overflow-x-hidden">
      <h1 className="sr-only">
        GVL Poly Student Marketplace – AANM & VVRSR Polytechnic
      </h1>
      <div className="mx-auto max-w-4xl px-4 pt-4 text-center text-sm text-slate-700">
        <p>Official student marketplace for GVL Polytechnic (AANM & VVRSR).</p>
        <p>
          This platform is not affiliated with Gallymart or any commercial store.
          It is exclusively built for GVL Polytechnic students.
        </p>
      </div>
      <Hero showScrollIndicator={showScrollIndicator} />
      <FeaturedProducts setShowScrollIndicator={setShowScrollIndicator} />
      <Statistics />
      <ChooseStumart />
      <HowItWorks />
    </div>
  );
}
