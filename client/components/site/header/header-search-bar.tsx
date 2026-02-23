type HeaderSearchBarProps = {
  keyword?: string;
};

function HeaderSearchBar({ keyword }: HeaderSearchBarProps) {
  return (
    <div className="mx-6 hidden max-w-md grow items-center md:flex">
      <form action="/products" className="relative w-full" method="get">
        <input
          className="w-full rounded-sm border border-zinc-700 bg-zinc-800 px-4 py-3 pr-10 text-sm text-white placeholder-zinc-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Search SKU, Product Name..."
          defaultValue={keyword ?? ""}
          name="keyword"
          type="text"
        />
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary transition-colors hover:text-white"
          type="submit"
        >
          <span className="material-symbols-outlined">search</span>
        </button>
      </form>
    </div>
  );
}

export { HeaderSearchBar };
