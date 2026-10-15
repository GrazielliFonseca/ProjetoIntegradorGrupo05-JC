import { localProducts, resolveProductImage } from "@/data/products";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import type { Product } from "./product";
export type { Product } from "./product";
export { useStore } from "./store-context";

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    try {
      const timeout = new Promise<never>((_, r) => setTimeout(() => r(new Error("timeout")), 6000));
      const { data, error } = await Promise.race([supabase.from("products").select("*").order("created_at", { ascending: true }), timeout]);
      if (error || !data?.length) return localProducts;
      return data.map((product) => ({ ...product, image_url: resolveProductImage(product.image_url) }));
    } catch {
      return localProducts;
    }
  },
  placeholderData: localProducts as Product[],
});
export const useProducts = () => useQuery(productsQuery);
