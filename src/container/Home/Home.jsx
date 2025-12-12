import HeroSection from "../../components/Hero/HeroSection";
import DivisionCarousel from "./section/Division";
// import ClipSection from "./section/Clip";
import EventSection from "./section/Event";
import ProductSection from "./section/Product";
// import CartExample from "../../components/CartExample";

export default function HomePage() {
  return (
    <div className="w-full">
      <HeroSection />
      <DivisionCarousel />
      <EventSection />
      <ProductSection />
    </div>
  );
}
