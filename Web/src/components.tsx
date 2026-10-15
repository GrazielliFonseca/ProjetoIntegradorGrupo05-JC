import { Link, useNavigate } from "@tanstack/react-router";
import { Anchor, Search, MessageCircle, MapPin, Phone, Mail, Clock, Ban, ImageOff, Instagram } from "lucide-react";
import { type Product, useStore } from "@/lib/store";
import { productWhatsapp } from "@/lib/whatsapp";

export function Button({children,className="",kind="primary",type="button",onClick,disabled}:{children:React.ReactNode;className?:string;kind?:"primary"|"yellow"|"outline";type?:"button"|"submit";onClick?:()=>void;disabled?:boolean}){return <button type={type} disabled={disabled} onClick={onClick} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-bold transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${kind==="yellow"?"bg-highlight text-highlight-foreground hover:bg-highlight-strong":kind==="outline"?"border border-border bg-card text-foreground hover:border-primary":"bg-primary text-primary-foreground hover:bg-primary-soft"} ${className}`}>{children}</button>}

const INSTAGRAM = "https://instagram.com/jchidraulicaguaruja?dlrf=djAzc2tyZDI3NG43";
const nav = [["/","Início"],["/catalogo","Catálogo"],["/servicos","Serviços"],["/sobre","Sobre nós"],["/contato","Contato"]] as const;

export function Header() {
  const { search, setSearch } = useStore();
  const navigate = useNavigate();
  return <header className="sticky top-0 z-50 border-b border-header-border bg-primary text-primary-foreground shadow-header">
    <div className="mx-auto grid min-h-16 max-w-7xl grid-cols-[auto_minmax(0,1fr)] items-center gap-3 px-4 py-2 sm:gap-5 sm:px-6 lg:flex lg:min-h-18">
      <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="JC Hidráulica - Início">
        <img src="/imagens/logo-jc.png" alt="Logo JC Hidráulica" width={48} height={48} className="size-12 shrink-0 object-contain"/>
        <span className="hidden font-display text-lg font-extrabold leading-tight sm:block">JC<br/><span className="text-highlight">Hidráulica</span></span>
      </Link>
      <form className="relative ml-auto w-full min-w-0 max-w-lg lg:mx-auto lg:flex-1" onSubmit={event => { event.preventDefault(); navigate({ to: "/catalogo" }); }}>
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18}/>
        <input aria-label="Pesquisar produtos" value={search} onChange={event => setSearch(event.target.value)} placeholder="O que você procura?" className="h-12 w-full min-w-0 rounded-md border-0 bg-background pl-10 pr-3 text-base text-foreground outline-none ring-highlight focus:ring-2"/>
      </form>
      <nav aria-label="Navegação principal" className="ml-auto hidden shrink-0 items-center gap-5 text-sm font-semibold lg:flex">
        {nav.map(([to, label]) => <Link key={to} to={to} activeOptions={{exact: to === "/"}} activeProps={{className: "text-highlight"}} className="inline-flex min-h-12 items-center">{label}</Link>)}
      </nav>
    </div>
    <nav aria-label="Navegação no celular" className="overflow-x-auto overscroll-x-contain border-t border-header-border lg:hidden">
      <div className="flex w-max min-w-full items-center justify-between gap-1 px-3 py-2">
        {nav.map(([to, label]) => <Link key={to} to={to} activeOptions={{exact: to === "/"}} activeProps={{className: "bg-highlight text-highlight-foreground"}} inactiveProps={{className: "bg-primary-soft text-primary-foreground hover:text-highlight"}} className="inline-flex min-h-12 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 text-sm font-bold transition">{label}</Link>)}
      </div>
    </nav>
  </header>;
}

export function Footer(){return <footer className="bg-primary text-primary-foreground"><div className="mx-auto grid max-w-7xl gap-9 px-5 py-8 sm:grid-cols-2 sm:py-12 lg:grid-cols-4"><div><div className="mb-4 flex items-center gap-2 font-display text-xl font-bold"><Anchor className="text-highlight"/>JC Hidráulica</div><p className="text-sm leading-6 text-footer-muted">Tradição no balcão, experiência no mar. Peças e serviços para sua embarcação.</p></div><FooterCol title="Contato" lines={[<><MapPin/>Rua Antônio Miguel dos Santos, 123</>,<><Phone/>(11) 94013-7801</>,<><Mail/>JC.comercioservice@gmail.com</>,<a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2"><Instagram className="size-4 text-highlight"/>@jchidraulicaguaruja</a>]}/><FooterCol title="Funcionamento" lines={[<><Clock/>Seg–Sex: 08:00 às 18:00</>,<>Sábado e Domingo: Fechado</>]}/><div><h3 className="mb-4 font-bold text-highlight">Links rápidos</h3><div className="grid gap-2 text-sm text-footer-muted"><Link to="/catalogo">Catálogo de produtos</Link><Link to="/servicos">Serviços de oficina</Link><Link to="/sobre">Sobre nós</Link><Link to="/contato">Fale conosco</Link></div></div></div><div className="border-t border-header-border px-5 py-5 text-center text-xs text-footer-muted">© 2026 JC Hidráulica. Todos os direitos reservados.</div></footer>}
function FooterCol({title,lines}:{title:string;lines:React.ReactNode[]}){return <div><h3 className="mb-4 font-bold text-highlight">{title}</h3><div className="grid gap-3 text-sm text-footer-muted">{lines.map((l,i)=><div key={i} className="flex items-center gap-2 [&>svg]:size-4 [&>svg]:text-highlight">{l}</div>)}</div></div>}

export function ProductImage({product, className=""}:{product:Product; className?:string}) {
  return product.image_url ? (
    <img 
      src={product.image_url} 
      alt={product.name} 
      className={`size-full object-contain bg-card p-2 ${className}`}
    />
  ) : (
    <div className="grid size-full place-items-center text-muted-foreground">
      <ImageOff/>
    </div>
  );
}
export function WhatsappButton({product,className=""}:{product:Product;className?:string}){if(!product.available)return <Button disabled className={`w-full ${className}`}><Ban size={17}/>Indisponível</Button>;return <a href={productWhatsapp(product.name)} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-2 py-2.5 text-center text-sm sm:px-4 font-bold text-primary-foreground transition hover:bg-primary-soft ${className}`}><MessageCircle size={17} className="shrink-0"/><span className="min-w-0">Consultar pelo WhatsApp</span></a>}

export function ProductCard({product}:{product:Product}){return <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition hover:-translate-y-1 hover:shadow-card-hover"><Link to="/produto/$id" params={{id:product.id}} className="relative block aspect-square overflow-hidden bg-muted"><ProductImage product={product} className={`transition duration-500 group-hover:scale-105 ${product.available?"":"grayscale opacity-60"}`}/>{!product.available&&<span className="absolute inset-x-0 bottom-0 bg-destructive px-3 py-2 text-center text-xs font-extrabold text-destructive-foreground">Produto indisponível no momento</span>}</Link><div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4"><Link to="/produto/$id" params={{id:product.id}} className="line-clamp-2 font-display text-lg font-bold hover:text-primary-soft">{product.name}</Link><p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">{product.description}</p><WhatsappButton product={product} className="mt-4"/></div></article>}

export function PageHeader({eyebrow,title,description}:{eyebrow:string;title:string;description?:string}){return <section className="border-b border-border bg-primary text-primary-foreground"><div className="mx-auto max-w-7xl px-5 py-7 sm:px-6 sm:py-16"><p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-highlight">{eyebrow}</p><h1 className="font-display text-3xl font-black sm:text-5xl">{title}</h1>{description&&<p className="mt-4 max-w-2xl text-base leading-7 text-footer-muted">{description}</p>}</div></section>}
