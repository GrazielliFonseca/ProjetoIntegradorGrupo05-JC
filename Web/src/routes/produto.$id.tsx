import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { ProductImage, WhatsappButton } from "@/components";
import { useProducts } from "@/lib/store";

export const Route = createFileRoute("/produto/$id")({
  head: () => ({ meta: [{ title: "Produto | JC Hidráulica" }, { name: "description", content: "Detalhes do produto náutico — consulte pelo WhatsApp." }, { property: "og:title", content: "Produto | JC Hidráulica" }, { property: "og:description", content: "Detalhes do produto náutico." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { data, isLoading, isPlaceholderData } = useProducts();
  const p = data?.find((x) => x.id === id);
  if (isLoading || (!p && isPlaceholderData)) return <div className="mx-auto max-w-7xl px-5 py-24 text-center text-muted-foreground">Carregando…</div>;
  if (!p) return <div className="mx-auto max-w-7xl px-5 py-24 text-center"><h1 className="font-display text-4xl font-black">Produto não encontrado</h1><Link to="/catalogo" className="mt-4 inline-block font-bold text-primary">Voltar ao catálogo</Link></div>;
  return <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-14">
    <div className="mb-7 flex items-center gap-2 text-sm text-muted-foreground"><Link to="/catalogo">Catálogo</Link><ChevronRight size={14} /><span>{p.name}</span></div>
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-card"><ProductImage product={p} className={p.available ? "" : "grayscale opacity-60"} />{!p.available && <span className="absolute inset-x-0 bottom-0 bg-destructive px-3 py-3 text-center text-sm font-extrabold text-destructive-foreground">Produto indisponível no momento</span>}</div>
      <div className="lg:py-6">
        <h1 className="font-display text-4xl font-black sm:text-5xl">{p.name}</h1>
        <p className="mt-6 leading-7 text-muted-foreground">{p.description}</p>
        <div className="mt-8 max-w-sm"><WhatsappButton product={p} className="h-12" /></div>
      </div>
    </div>
  </div>;
}
