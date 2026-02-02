import { useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WaitlistSignup from "@/components/WaitlistSignup";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import ForFarmers from "@/components/ForFarmers";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    // Handle hash scrolling on page load
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <WaitlistSignup />
        <HowItWorks />
        <Pricing />
        <ForFarmers />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
