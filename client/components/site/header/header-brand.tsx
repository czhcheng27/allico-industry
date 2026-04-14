import Image from "next/image";
import Link from "next/link";

function HeaderBrand() {
  return (
    <div className="mr-8 shrink-0">
      <Link href="/" className="group flex items-center gap-3">
        <div className="rounded-sm border border-white/10 bg-white/5 p-1 shadow-sm transition-colors group-hover:border-primary/60">
          <Image
            alt="Allico Industries logo"
            className="h-10 w-auto object-contain md:h-12"
            height={91}
            priority
            src="/logo.jpg"
            width={96}
          />
        </div>
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
