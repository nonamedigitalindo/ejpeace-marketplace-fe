import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const MainLayout = ({ children }) => {
  return (
    <div>
      <Navbar />

      <main>
        {children} <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
