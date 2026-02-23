import { HomePage } from "@/components/home/home-page";
import { fetchFeaturedProducts } from "@/lib/catalog-api";

export default async function Home() {
  const featuredProducts = await fetchFeaturedProducts();
  return <HomePage featuredProducts={featuredProducts} />;
}
