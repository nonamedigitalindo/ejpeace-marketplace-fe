// Responsive CardDivision
import Image from "../../ui/Image";
import Button from "../../ui/Button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const CardDivision = ({ item, isActive }) => {
  const navigate = useNavigate();

  const stripHtml = (html) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };

  const truncate = (text, max) => {
    return text.length > max ? text.substring(0, max) + "..." : text;
  };

  const cleanNoted = truncate(stripHtml(item.noted), 60);

  return (
    <motion.div
      onClick={() => navigate(`/ejpeace/division?id=${item.id}`)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`rounded-3xl border p-4 sm:p-5 cursor-pointer bg-white transition-all duration-300
        ${
          isActive
            ? "scale-105 shadow-xl border-black"
            : "scale-100 shadow-md border-gray-300"
        }
      `}
      whileHover={{
        scale: 1.08,
        boxShadow: "0px 10px 25px rgba(0,0,0,0.25)",
        transition: { duration: 0.3 },
      }}
    >
      {/* Responsive Image Container */}
      <div className="w-full h-40 sm:h-48 md:h-56">
        <Image
          src={item.image}
          alt={item.title}
          style="object-contain w-full h-full rounded-2xl"
        />
      </div>

      {/* Responsive Noted Box */}
      <div className="mt-4 border border-gray-300 rounded-lg p-3 sm:p-4 bg-white h-auto sm:h-32 flex flex-col overflow-hidden">
        <h3 className="font-bold text-base sm:text-lg md:text-xl mb-1">
          {item.title}
        </h3>

        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3">
          {cleanNoted}
        </p>
      </div>

      {/* Button Section */}
      <div className="mt-4 flex justify-center">
        <Button style="bg-black text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-md font-medium hover:bg-gray-900 transition text-sm sm:text-base">
          Learn More
        </Button>
      </div>
    </motion.div>
  );
};

export default CardDivision;
