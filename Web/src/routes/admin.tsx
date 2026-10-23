import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button, ProductImage } from "@/components";
import { type Product, useProducts } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel Administrativo | JC Hidráulica" }, { name: "description", content: "Gestão de produtos do catálogo." }, { property: "og:title", content: "Painel Administrativo | JC Hidráulica" }, { property: "og:description", content: "Gestão de produtos do catálogo." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

const input = "w-full rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary";

function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    supabase.rpc("claim_first_admin").then(({ data }) => setIsAdmin(!!data));
  }, [session?.user.id]);
  if (!ready) return <div className="min-h-[60vh]" />;
  if (!session) return <Login />;
  if (isAdmin === null) return <div className="min-h-[60vh] p-10 text-center text-muted-foreground">Verificando acesso…</div>;
  if (!isAdmin) return <div className="mx-auto max-w-md px-5 py-20 text-center"><h1 className="font-display text-3xl font-black">Acesso negado</h1><p className="mt-3 text-muted-foreground">Esta conta não tem permissão de administrador.</p><Button kind="outline" className="mt-6" onClick={() => supabase.auth.signOut()}>Sair</Button></div>;
  return <Products email={session.user.email ?? ""} />;
}

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMsg("");
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email")), password = String(fd.get("password"));
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg("E-mail ou senha incorretos.");
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
      setMsg(error ? error.message : "Conta criada! Confirme pelo link enviado ao seu e-mail e depois entre.");
    }
    setBusy(false);
  }
  return <div className="grid min-h-[70vh] place-items-center bg-muted px-5 py-16">
    <form onSubmit={submit} className="w-full max-w-sm border-t-4 border-highlight bg-card p-7 shadow-card">
      <p className="text-xs font-extrabold uppercase tracking-widest text-primary-soft">Área restrita</p>
      <h1 className="mt-2 font-display text-3xl font-black">{mode === "in" ? "Entrar no painel" : "Criar conta"}</h1>
      <div className="mt-6 grid gap-4">
        <input required name="email" type="email" placeholder="E-mail" className={input} autoComplete="email" />
        <input required name="password" type="password" minLength={6} placeholder="Senha" className={input} autoComplete={mode === "in" ? "current-password" : "new-password"} />
        <Button type="submit" disabled={busy}>{mode === "in" ? "Entrar" : "Criar conta"}</Button>
        {msg && <p role="status" className="text-center text-sm text-muted-foreground">{msg}</p>}
      </div>
    </form>
  </div>;
}

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, 800 / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = img.width * s; c.height = img.height * s;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function Products({ email }: { email: string }) {
  const { data = [], isLoading } = useProducts();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["products"] });
  async function toggle(p: Product) { await supabase.from("products").update({ available: !p.available }).eq("id", p.id); refresh(); }
  async function remove(p: Product) { if (!confirm(`Excluir "${p.name}"? Esta ação não pode ser desfeita.`)) return; await supabase.from("products").delete().eq("id", p.id); refresh(); }
  return <div className="min-h-[70vh] bg-muted"><div className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-extrabold uppercase tracking-widest text-primary-soft">Administração · {email}</p><h1 className="mt-2 font-display text-4xl font-black">Gestão de Produtos</h1></div>
      <div className="flex flex-wrap gap-2"><Button kind="yellow" onClick={() => setEditing("new")}><Plus size={18} />Cadastrar Novo Produto</Button><Button kind="outline" onClick={() => supabase.auth.signOut()}><LogOut size={17} />Sair</Button></div>
    </div>
    <div className="overflow-x-auto border border-border bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" role="region" aria-label="Tabela de produtos; deslize horizontalmente para ver todas as colunas" tabIndex={0}>
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-primary text-primary-foreground"><tr><th className="px-5 py-4">Produto</th><th className="px-5 py-4">Descrição</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Ações</th></tr></thead>
        <tbody>
          {isLoading && <tr><td colSpan={4} className="px-5 py-6 text-muted-foreground">Carregando…</td></tr>}
          {!isLoading && data.length === 0 && <tr><td colSpan={4} className="px-5 py-6 text-muted-foreground">Nenhum produto cadastrado.</td></tr>}
          {data.map((p) => <tr key={p.id} className="border-t border-border">
            <td className="px-5 py-3"><div className="flex items-center gap-3"><div className="size-12 shrink-0 overflow-hidden rounded bg-muted"><ProductImage product={p} /></div><span className="font-bold">{p.name}</span></div></td>
            <td className="max-w-xs px-5 py-3 text-muted-foreground"><span className="line-clamp-2">{p.description}</span></td>
            <td className="px-5 py-3"><button role="switch" aria-checked={p.available} onClick={() => toggle(p)} className="flex min-h-11 items-center gap-2"><span className={`relative h-6 w-11 rounded-full transition ${p.available ? "bg-success" : "bg-input"}`}><span className={`absolute top-0.5 size-5 rounded-full bg-card shadow transition ${p.available ? "left-[22px]" : "left-0.5"}`} /></span><span className="text-xs font-bold">{p.available ? "Disponível" : "Indisponível no momento"}</span></button></td>
            <td className="px-5 py-3"><div className="flex justify-end gap-2"><button aria-label="Editar" onClick={() => setEditing(p)} className="grid size-11 place-items-center rounded-md border border-border hover:border-primary"><Pencil size={15} /></button><button aria-label="Excluir" onClick={() => remove(p)} className="grid size-11 place-items-center rounded-md border border-border text-destructive hover:border-destructive"><Trash2 size={15} /></button></div></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </div>{editing && <ProductForm product={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}</div>;
}

function ProductForm({ product, onClose, onSaved }: { product: Product | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [image, setImage] = useState(product?.image_url ?? "");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const row = { name: name.trim(), description: description.trim(), image_url: image.trim() || null };
    const { error } = product ? await supabase.from("products").update(row).eq("id", product.id) : await supabase.from("products").insert(row);
    setBusy(false);
    if (error) setErr("Não foi possível salvar. Tente novamente."); else onSaved();
  }
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-foreground/50 p-4" onClick={onClose}>
    <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-card p-6 shadow-card">
      <div className="flex items-center justify-between"><h2 className="font-display text-2xl font-black">{product ? "Editar produto" : "Novo produto"}</h2><button type="button" onClick={onClose} aria-label="Fechar" className="grid size-11 shrink-0 place-items-center rounded-md hover:bg-muted"><X /></button></div>
      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-bold">Nome do Produto<input required value={name} onChange={(e) => setName(e.target.value)} className={input} /></label>
        <label className="grid gap-2 text-sm font-bold">Imagem (URL)<input value={image.startsWith("data:") ? "" : image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." className={input} /></label>
        <label className="grid gap-2 text-sm font-bold">ou enviar arquivo<input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setImage(await resizeImage(f)); }} className="text-sm font-normal" /></label>
        {image && <img src={image} alt="Pré-visualização" className="h-32 w-32 rounded object-cover" />}
        <label className="grid gap-2 text-sm font-bold">Descrição<textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className={input} /></label>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <div className="flex justify-end gap-2"><Button kind="outline" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={busy}>Salvar</Button></div>
      </div>
    </form>
  </div>;
}
