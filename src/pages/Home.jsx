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
        GVL Poly StuMart – AANM & VVRSR Polytechnic Student Marketplace
      </h1>
      <Hero showScrollIndicator={showScrollIndicator} />
      <FeaturedProducts setShowScrollIndicator={setShowScrollIndicator} />
      <Statistics />
      <ChooseStumart />
      <HowItWorks />
    </div>
  );
}
