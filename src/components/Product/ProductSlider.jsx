import ProductCard from "./ProductCard";

export default function ProductSlider() {
  const products = [
    { id: 1, name: "T-Shirt 01", image: "/shirt1.jpg", price: 120000 },
    { id: 2, name: "T-Shirt 02", image: "/shirt2.jpg", price: 130000 },
  ];

  return (
    <section className="py-10 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">PRODUCT</h2>
      
      <div className="flex gap-4 overflow-x-auto pb-4">
        {products.map((p) => <ProductCard key={p.id} data={p} />)}
      </div>
    </section>
  );
}
