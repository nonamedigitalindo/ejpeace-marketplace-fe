import { useNavigate } from "react-router-dom";
import CartIndicator from "./CartIndicator";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-md py-4 px-6 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div
          className="text-2xl font-bold cursor-pointer"
          onClick={() => navigate("/ejpeace")}
        >
          eJPeace
        </div>

        <nav className="hidden md:flex space-x-8">
          <button
            onClick={() => navigate("/ejpeace")}
            className="text-gray-700 hover:text-black font-medium"
          >
            Home
          </button>
          <button
            onClick={() => navigate("/ejpeace/store")}
            className="text-gray-700 hover:text-black font-medium"
          >
            Store
          </button>
          <button
            onClick={() => navigate("/ejpeace/event")}
            className="text-gray-700 hover:text-black font-medium"
          >
            Events
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          <CartIndicator />
        </div>
      </div>
    </header>
  );
}
