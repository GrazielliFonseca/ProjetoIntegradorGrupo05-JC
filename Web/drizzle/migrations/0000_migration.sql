create type public.app_role as enum ('admin');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid not null, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create or replace function public.claim_first_admin() returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  if exists (select 1 from public.user_roles where role='admin') then
    return public.has_role(auth.uid(),'admin');
  end if;
  insert into public.user_roles(user_id, role) values (auth.uid(),'admin');
  return true;
end $$;
revoke execute on function public.claim_first_admin() from anon, public;
grant execute on function public.claim_first_admin() to authenticated;

create table public.products (id uuid primary key default gen_random_uuid(), name text not null, description text not null default '', image_url text, available boolean not null default true, created_at timestamptz not null default now());
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public read" on public.products for select to anon, authenticated using (true);
create policy "admin insert" on public.products for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update" on public.products for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete" on public.products for delete to authenticated using (public.has_role(auth.uid(),'admin'));

insert into public.products (name, description, image_url) values
('Óleo Marinho 4T 1L','Lubrificante de alta performance para motores náuticos 4 tempos.','/produtos/oleo.jpg'),
('Bomba de Porão 1100 GPH','Bomba submersível compacta, resistente à corrosão e de fácil instalação.','/produtos/bomba.jpg'),
('Chave de Grifo 14 polegadas','Corpo reforçado e mordente temperado para manutenção profissional.','/produtos/chave.jpg'),
('Manilha Inox 8 mm','Aço inoxidável naval, ideal para cabos, correntes e ancoragem leve.','/produtos/manilha.jpg'),
('Óleo Hidráulico Náutico','Fluido de alto desempenho para direção e sistemas hidráulicos.','/produtos/oleo.jpg'),
('Bomba d’Água 12V','Pressurização confiável para sistemas de água a bordo.','/produtos/bomba.jpg');