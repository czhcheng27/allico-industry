import Link from "next/link";

function HeaderBrand() {
  return (
    <div className="mr-8 shrink-0">
      <Link href="/" className="group flex flex-col">
        <div className="font-display text-3xl font-black uppercase leading-none tracking-tighter text-primary">
          <span className="block text-2xl text-white transition-colors group-hover:text-primary">
            Allico
          </span>
          <span className="-mt-2 block text-3xl text-primary transition-colors group-hover:text-white">
            Industries
          </span>
        </div>
      </Link>
    </div>
  );
}

export { HeaderBrand };
