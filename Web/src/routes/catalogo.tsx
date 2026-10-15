import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader, ProductCard } from "@/components";
import { useProducts, useStore } from "@/lib/store";
import { whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/catalogo")({
  head: () => ({ meta: [{ title: "Catálogo de Produtos | JC Hidráulica" }, { name: "description", content: "Veja nossos produtos náuticos e consulte disponibilidade direto pelo WhatsApp." }, { property: "og:title", content: "Catálogo de Produtos | JC Hidráulica" }, { property: "og:description", content: "Produtos para sua embarcação e oficina — consulte pelo WhatsApp." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Catalogo,
});

const PER_PAGE = 12;
function Catalogo() {
  const { data = [], isLoading } = useProducts();
  const { search } = useStore();
  const [page, setPage] = useState(1);
  const list = useMemo(() => data.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())), [data, search]);
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  return <>
    <PageHeader eyebrow="Vitrine" title="Catálogo de Produtos" description="Gostou de algum item? Clique em “Consultar pelo WhatsApp” e fale direto com a gente." />
    <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-lg border-l-8 border-highlight bg-primary p-4 sm:p-6 text-primary-foreground shadow-card sm:flex-row sm:items-center">
        <p className="text-base leading-7"><strong className="text-highlight">Serviço Especializado:</strong> Realizamos serviço de prensagem de mangueiras hidráulicas na hora e sob medida! Entre em contato para saber mais.</p>
        <a href={whatsappLink("Olá! Gostaria de saber mais sobre a prensagem de mangueiras hidráulicas.")} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-md bg-highlight px-5 py-2.5 text-sm font-bold text-highlight-foreground hover:bg-highlight-strong"><MessageCircle size={17} />Falar no WhatsApp</a>
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando produtos…</p> : list.length === 0 ? <div className="border border-dashed border-border bg-card p-12 text-center text-muted-foreground">Nenhum produto encontrado.</div> :
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{list.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((p) => <ProductCard key={p.id} product={p} />)}</div>}
      {pages > 1 && <div className="mt-10 flex justify-center gap-2">{Array.from({ length: pages }, (_, i) => i + 1).map((n) => <button key={n} onClick={() => setPage(n)} className={`grid size-10 place-items-center rounded-sm border font-bold ${page === n ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>{n}</button>)}</div>}
    </div>
  </>;
}
