import { createFileRoute, Link } from "@tanstack/react-router";
import { Anchor, Handshake, Wrench } from "lucide-react";
import { Button, PageHeader } from "@/components";

export const Route = createFileRoute("/sobre")({
  head: () => ({ meta: [{ title: "Sobre nós | JC Hidráulica" }, { name: "description", content: "Conheça a história da JC Hidráulica, loja e oficina náutica." }, { property: "og:title", content: "Sobre nós | JC Hidráulica" }, { property: "og:description", content: "Tradição no balcão, experiência no mar." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Sobre,
});

const values: Array<[typeof Anchor, string, string]> = [[Anchor, "Missão", "Apresentar soluções na área de hidráulica através da nossa experiência, oferecendo produtos e serviços que atendam às necessidades e expectativas de nossos clientes, tendo por base qualidade, preço, prazo e respeito."], [Wrench, "Visão", "Prezar pela confiança e fidelidade ao cliente, sendo uma empresa reconhecida no segmento de hidráulica pela excelência no atendimento e pelas soluções oferecidas."], [Handshake, "Valores", "Conduzir o nosso negócio de forma ética e transparente, com comprometimento e respeito com nossos clientes, parceiros e colaboradores."]];

function Sobre() {
  return <>
    <PageHeader eyebrow="Quem somos" title="Sobre nós" description="Referência em hidráulica e reparos navais na Baixada Santista." />
    <section className="mx-auto max-w-5xl px-5 py-8 sm:py-14 sm:px-6">
      <h2 className="font-display text-3xl font-black">Nossa história</h2>
      <p className="mt-4 text-lg leading-8 text-muted-foreground">A JC Hidráulica veio através da necessidade de mercado dentro da Baixada Santista por conta de reparos navais, assim desenvolvendo e englobando novos mercados, se tornando uma das maiores fornecedoras de equipamentos hidráulicos e acessórios da nossa região. Todo material comercializado e restaurado pela JC Hidráulica garante o bom funcionamento dos equipamentos e a sua durabilidade. Além disso, contamos com uma equipe capacitada com vários anos de experiência, sempre visando à máxima satisfação de nossos clientes de forma que saibam que estão fechando uma parceria com quem verdadeiramente preza pela rapidez e bom atendimento.</p>
      <div className="mt-10 grid gap-5 sm:grid-cols-3">{values.map(([Icon, t, d]) => <article key={t} className="h-full border-t-4 border-highlight bg-card p-6 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover"><span className="grid size-14 place-items-center rounded-full bg-secondary text-primary"><Icon aria-hidden="true" size={30} strokeWidth={1.8} /></span><h2 className="mt-5 font-display text-2xl font-black">{t}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{d}</p></article>)}</div>
      <div className="mt-10"><Link to="/catalogo"><Button kind="yellow">Ver catálogo</Button></Link></div>
    </section>
  </>;
}
