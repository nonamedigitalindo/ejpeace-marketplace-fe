import Image from "../../ui/Image";

import Button from "../../ui/Button";

const CardProduct = () => {
  return (
    <main className="w-[300px] h-[409px] border border-black">
      <Image src="./images/wakil.jpg" style="w-full h-80" />

      <section className="p-3 flex justify-between items-center">
        <article>
          <h1 className="font-bold">KAOS A</h1>
          <p>Rp. 100.000</p>
        </article>

        <Button style="bg-black text-white rounded-full px-5 py-2">
          Beli Sekarang
        </Button>
      </section>
    </main>
  );
};

export default CardProduct;
