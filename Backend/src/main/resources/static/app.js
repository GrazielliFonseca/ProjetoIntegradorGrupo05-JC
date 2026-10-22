(() => {
  'use strict';

  const WA = '5511940137801';
  const PRODUCTS_SEED = [
    ['Esteira condutora de cabos', '/imagens/esteira-condutora.png', 'Proteção e organização flexível para cabos e mangueiras em movimento contínuo em máquinas e equipamentos.'],
    ['Terminal hidráulico em aço', '/imagens/terminal-hidraulico.png', 'Conexão de alta resistência e vedação perfeita para montagem de mangueiras em sistemas de alta pressão.'],
    ['Rolamentos', '/imagens/rolamentos.png', 'Componentes de precisão para redução de atrito e suporte de eixos em aplicações industriais e náuticas.'],
    ['Anéis (O-ring)', '/imagens/aneis-oring.png', 'Elementos de vedação elastoméricos para evitar vazamentos de fluidos e gases em conexões hidráulicas.'],
    ['Mangueira com trança de aço', '/imagens/mangueira-tranca-aco.png', 'Tubulação reforçada de alta pressão, ideal para condução de fluidos hidráulicos pesados.'],
    ['Unidade hidráulica', '/imagens/unidade-hidraulica.png', 'Sistema gerador de energia e pressão hidráulica para acionamento de atuadores e máquinas.'],
    ['Manômetro', '/imagens/manometro.png', 'Instrumento de precisão para monitoramento da pressão de trabalho em sistemas hidráulicos.']
  ].map((p, i) => ({ id: `local-${i + 1}`, name: p[0], image: p[1], description: p[2], available: true }));
  const NAV = [['/', 'Início'], ['/catalogo', 'Catálogo'], ['/servicos', 'Serviços'], ['/sobre', 'Sobre nós'], ['/contato', 'Contato']];
  const app = document.querySelector('#app');
  const state = { products: [], loading: true, loadError: '', search: '', page: 1, adminProducts: [], adminLoading: false, adminLoaded: false, adminError: '', editing: null, busy: false, adminAuthStatus: 'unknown', adminIdentity: null, sessionError: '' };
  let adminSessionGeneration = 0;

  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const safeImage = value => {
    const url = String(value || '');
    return /^(https?:\/\/|\/imagens\/|data:image\/(png|jpeg|jpg|webp);base64,)/i.test(url) ? url : '';
  };
  const waLink = message => `https://wa.me/${WA}?text=${encodeURIComponent(message)}`;
  const productWa = name => waLink(`Olá! Gostaria de consultar o produto: ${name}`);
  const route = () => {
    const raw = location.hash.startsWith('#') ? location.hash.slice(1) : '';
    return (raw.split('?')[0] || '/').replace(/\/$/, '') || '/';
  };
  let lastRoute = route();
  const hashLink = (path, label, cls = '') => `<a class="${cls}" href="#${escapeHtml(path)}">${label}</a>`;
  const button = (label, cls = 'button-yellow', href = '') => href ? `<a class="button ${cls}" href="${escapeHtml(href)}">${label}</a>` : `<button class="button ${cls}" type="button">${label}</button>`;
  const formatProduct = row => {
    const oldUrl = row?.URL ?? row?.url ?? row?.image_url ?? row?.imagem ?? '';
    const rawName = row?.nome ?? row?.name ?? 'Produto';
    const exactSeed = PRODUCTS_SEED.find(p => p.name.toLocaleLowerCase('pt-BR') === String(rawName).toLocaleLowerCase('pt-BR'));
    const url = safeImage(oldUrl) || exactSeed?.image || '';
    return {
      id: String(row?.id ?? ''), name: String(rawName), description: String(row?.descricao ?? row?.description ?? ''),
      image: url, available: (row?.prudutoDisponivel ?? row?.produtoDisponivel ?? row?.available ?? true) !== false
    };
  };
  const request = async (url, options = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal, credentials: 'same-origin', headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) } });
      let payload = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('json')) payload = await response.json();
      else if (response.status !== 204) payload = await response.text();
      if (!response.ok) {
        if (response.status === 401 && url !== '/api/admins/login') resetAdminSession();
        const error = new Error(typeof payload === 'string' && payload ? payload : payload?.message || payload?.mensagem || `Falha na solicitação (${response.status}).`);
        error.status = response.status;
        throw error;
      }
      return payload;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('A solicitação demorou mais do que o esperado. Tente novamente.');
      throw error;
    } finally { clearTimeout(timer); }
  };
  const apiRows = payload => Array.isArray(payload) ? payload : Array.isArray(payload?.produtos) ? payload.produtos : Array.isArray(payload?.content) ? payload.content : [];

  function resetAdminSession() {
    adminSessionGeneration++;
    state.adminAuthStatus = 'anonymous'; state.adminIdentity = null; state.sessionError = '';
    state.adminProducts = []; state.adminLoading = false; state.adminLoaded = false; state.adminError = '';
    state.editing = null; state.busy = false;
    if (route() === '/admin') render();
  }

  async function loadProducts() {
    state.loading = true; state.loadError = ''; render();
    try {
      const rows = apiRows(await request('/api/produtos'));
      state.products = rows.map(formatProduct);
      state.loadError = rows.length ? '' : 'Ainda não há produtos cadastrados. Enquanto isso, confira a loja e fale com a equipe.';
    } catch (error) {
      state.products = PRODUCTS_SEED;
      state.loadError = 'Não foi possível atualizar o catálogo agora. Mostramos uma seleção local; tente novamente em instantes.';
      console.warn('Catálogo indisponível:', error);
    } finally { state.loading = false; render(); }
  }

  function header() {
    const active = route();
    return `<header class="site-header"><div class="wrap header-main">
      ${hashLink('/', '<img src="/imagens/logo-jc.png" alt="JC Hidráulica" width="51" height="51"><span class="brand-name">JC<span>Hidráulica</span></span>', 'brand')}
      <form class="search" id="site-search"><label class="visually-hidden" for="header-search">Pesquisar produtos</label><input id="header-search" name="q" value="${escapeHtml(state.search)}" placeholder="O que você procura?" autocomplete="off"></form>
      <nav class="nav desktop-nav" aria-label="Navegação principal">${NAV.map(([path, label]) => hashLink(path, escapeHtml(label), active === path ? 'active' : '')).join('')}</nav>
    </div><nav class="mobile-nav" aria-label="Navegação no celular">${NAV.map(([path, label]) => hashLink(path, escapeHtml(label), active === path ? 'active' : '')).join('')}</nav></header>`;
  }
  function footer() {
    return `<footer class="site-footer"><div class="wrap footer-grid">
      <div><div class="footer-brand">JC Hidráulica</div><p>Tradição no balcão, experiência no mar. Peças e serviços para sua embarcação.</p></div>
      <div><h3>Contato</h3><ul><li>Rua Antônio Miguel dos Santos, 123</li><li><a href="tel:+5511940137801">(11) 94013-7801</a></li><li><a href="mailto:JC.comercioservice@gmail.com">JC.comercioservice@gmail.com</a></li><li><a href="https://instagram.com/jchidraulicaguaruja" target="_blank" rel="noopener">@jchidraulicaguaruja</a></li></ul></div>
      <div><h3>Funcionamento</h3><ul><li>Segunda a sexta: 08h às 18h</li><li>Sábado e domingo: fechado</li></ul></div>
      <div><h3>Links rápidos</h3><ul>${NAV.slice(1).map(([path, label]) => `<li>${hashLink(path, escapeHtml(label))}</li>`).join('')}</ul></div>
    </div><div class="wrap copyright">© 2026 JC Hidráulica. Todos os direitos reservados.</div></footer>`;
  }
  function pageHero(eyebrow, title, description) {
    return `<section class="page-hero"><div class="wrap"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${description}</p></div></section>`;
  }
  function productCard(p) {
    const image = safeImage(p.image);
    return `<article class="product-card"><a class="product-thumb" href="#/produto/${encodeURIComponent(p.id)}" aria-label="Ver ${escapeHtml(p.name)}">${image ? `<img class="${p.available ? '' : 'unavailable'}" src="${escapeHtml(image)}" alt="${escapeHtml(p.name)}" loading="lazy">` : '<span class="image-fallback">Imagem indisponível</span>'}${p.available ? '' : '<span class="availability-ribbon">Indisponível no momento</span>'}</a>
      <div class="product-info"><h3>${hashLink(`/produto/${encodeURIComponent(p.id)}`, escapeHtml(p.name))}</h3><p>${escapeHtml(p.description)}</p>${p.available ? `<a class="button whatsapp" href="${escapeHtml(productWa(p.name))}" target="_blank" rel="noopener">Consultar pelo WhatsApp</a>` : '<button class="button product-state" type="button" disabled>Indisponível</button>'}</div></article>`;
  }
  function productCollection(list, limit = list.length) {
    if (!list.length) return '<div class="empty-state"><h2>Nenhum produto encontrado</h2><p>Tente outro nome ou fale com a gente para localizar sua peça.</p></div>';
    return `<div class="product-grid">${list.slice(0, limit).map(productCard).join('')}</div>`;
  }
  function home() {
    return `<section class="hero"><img class="hero-art" src="/imagens/hero-jc.png" alt=""><div class="wrap hero-inner"><div class="hero-copy"><span class="eyebrow">Desde 2016 · Baixada Santista</span><h1>Peças náuticas, ferramentas e manutenção hidráulica em um só lugar.</h1><p>Especialistas em hidráulica de barco e oficina. Atendimento direto, diagnóstico preciso e as peças certas para seguir navegando.</p><div class="hero-actions">${button('Conheça nossos serviços&nbsp; →', 'button-yellow', '#/servicos')}${button('Ver catálogo', 'button-outline', '#/catalogo')}</div></div></div></section>
      <section class="section"><div class="wrap"><div class="section-heading"><div><span class="eyebrow">Pronta entrega</span><h2>Destaques do catálogo</h2></div>${hashLink('/catalogo', 'Ver todo o catálogo&nbsp; →', 'text-link')}</div>${state.loading ? '<div class="loading-row"><span class="loader"></span>Carregando produtos…</div>' : productCollection(state.products.filter(p => p.available), 4)}${state.loadError ? `<p class="notice" role="status">${escapeHtml(state.loadError)} ${hashLink('/contato', 'Entre em contato.')}</p>` : ''}</div></section>
      <section class="section section-white"><div class="wrap"><div class="section-heading"><div><span class="eyebrow">Mão na máquina</span><h2>Nossa oficina resolve</h2><p class="muted-intro">Serviço técnico com experiência prática para embarcações de trabalho e lazer.</p></div></div><div class="service-grid"><article class="service-card"><span class="service-mark">01</span><div><h3>Manutenção hidráulica</h3><p>Mangueiras, conexões, direção e sistemas hidráulicos.</p></div></article><article class="service-card"><span class="service-mark">02</span><div><h3>Encomendas e peças raras</h3><p>Localizamos componentes difíceis e soluções sob medida.</p></div></article></div><div class="feature-strip"><span class="feature-dot"></span><span><b>Atendimento técnico de verdade.</b> Fale com quem entende de barco e ferramenta.</span></div></div></section>`;
  }
  function catalog() {
    const query = state.search.trim().toLocaleLowerCase('pt-BR');
    const filtered = state.products.filter(p => p.name.toLocaleLowerCase('pt-BR').includes(query));
    const perPage = 12, pages = Math.max(1, Math.ceil(filtered.length / perPage));
    state.page = Math.min(state.page, pages);
    const rows = filtered.slice((state.page - 1) * perPage, state.page * perPage);
    return `${pageHero('Vitrine', 'Catálogo de produtos', 'Gostou de algum item? Consulte a disponibilidade e fale direto com a nossa equipe.')}
      <section class="section"><div class="wrap"><div class="promo"><p><strong>Serviço especializado:</strong> fazemos prensagem de mangueiras hidráulicas na hora e sob medida. Fale com a gente para saber mais.</p><a class="button button-yellow" href="${escapeHtml(waLink('Olá! Gostaria de saber mais sobre a prensagem de mangueiras hidráulicas.'))}" target="_blank" rel="noopener">Falar no WhatsApp</a></div>
      ${state.loadError ? `<div class="notice" role="status">${escapeHtml(state.loadError)} <button type="button" class="text-link" data-action="retry-products">Tentar novamente</button></div>` : ''}
      ${state.loading ? '<div class="loading-row"><span class="loader"></span>Carregando produtos…</div>' : `<div class="catalog-tools"><span>${filtered.length} ${filtered.length === 1 ? 'produto' : 'produtos'}</span><label><span class="visually-hidden">Filtrar produtos</span><input class="catalog-search" data-catalog-search value="${escapeHtml(state.search)}" placeholder="Buscar no catálogo"></label></div>${productCollection(rows)}${pages > 1 ? `<nav class="pagination" aria-label="Paginação">${Array.from({ length: pages }, (_, i) => `<button class="page-button ${state.page === i + 1 ? 'current' : ''}" data-page="${i + 1}" aria-label="Página ${i + 1}" ${state.page === i + 1 ? 'aria-current="page"' : ''}>${i + 1}</button>`).join('')}</nav>` : ''}`}</div></section>`;
  }
  function productDetail() {
    const id = decodeURIComponent(route().slice('/produto/'.length));
    const p = state.products.find(item => item.id === id);
    if (state.loading) return `<section class="section"><div class="wrap loading-row"><span class="loader"></span>Carregando produto…</div></section>`;
    if (!p) return `<section class="wrap not-found"><strong>404</strong><h1>Produto não encontrado</h1><p>Este item pode ter sido removido ou o endereço está incorreto.</p>${button('Voltar ao catálogo', 'button-yellow', '#/catalogo')}</section>`;
    return `<section class="section"><div class="wrap"><div class="crumbs">${hashLink('/catalogo', 'Catálogo')}　/　${escapeHtml(p.name)}</div><div class="product-detail"><div class="detail-image">${p.image ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" class="${p.available ? '' : 'unavailable'}">` : '<div class="empty-state">Imagem indisponível</div>'}</div><div><span class="eyebrow">Peças JC Hidráulica</span><h1>${escapeHtml(p.name)}</h1>${p.available ? '<span class="status-chip">Disponível para consulta</span>' : '<span class="status-chip off">Indisponível no momento</span>'}<p class="description">${escapeHtml(p.description)}</p>${p.available ? `<a class="button whatsapp" href="${escapeHtml(productWa(p.name))}" target="_blank" rel="noopener">Consultar pelo WhatsApp</a>` : ''}</div></div></div></section>`;
  }
  function about() {
    return `${pageHero('Quem somos', 'Sobre nós', 'Referência em hidráulica e reparos navais na Baixada Santista.')}
      <section class="section"><div class="wrap"><div class="story"><span class="eyebrow">Nossa história</span><h2 class="content-title">Experiência que acompanha você no mar.</h2><p>A JC Hidráulica surgiu para atender à necessidade de reparos navais na Baixada Santista. Com o tempo, ampliamos nosso trabalho e nos tornamos fornecedores de equipamentos hidráulicos e acessórios na região. Cuidamos de cada produto e serviço para oferecer bom funcionamento e durabilidade, com uma equipe experiente, rapidez e atendimento próximo.</p></div><div class="values-grid"><article class="value-card"><span class="value-num">01</span><h2>Missão</h2><p>Oferecer soluções em hidráulica com produtos e serviços de qualidade, respeitando as necessidades, o prazo e o investimento de cada cliente.</p></article><article class="value-card"><span class="value-num">02</span><h2>Visão</h2><p>Ser reconhecida no segmento hidráulico pela confiança, excelência no atendimento e soluções que fazem a diferença.</p></article><article class="value-card"><span class="value-num">03</span><h2>Valores</h2><p>Conduzir nosso negócio com ética, transparência, comprometimento e respeito por clientes, parceiros e equipe.</p></article></div><div style="margin-top:28px">${button('Ver catálogo', 'button-yellow', '#/catalogo')}</div></div></section>`;
  }
  function services() {
    return `${pageHero('Oficina especializada', 'Nossa oficina e serviços', 'Do diagnóstico à peça final, cuidamos da sua embarcação com experiência, ferramental adequado e comunicação direta.')}
      <section class="section"><div class="wrap two-col"><div><span class="eyebrow">Cuidado em cada etapa</span><h2 class="content-title">Conhecimento de cais, serviço de precisão.</h2><p>Nossa equipe atua na manutenção preventiva e corretiva de sistemas hidráulicos. Avaliamos cada caso de perto e indicamos apenas o que precisa ser feito.</p><div class="service-grid" style="grid-template-columns:1fr"><article class="service-card"><span class="service-mark">01</span><div><h3>Manutenção hidráulica</h3><p>Direção, mangueiras, conexões, bombas e vazamentos.</p></div></article><article class="service-card"><span class="service-mark">02</span><div><h3>Encomenda de peças</h3><p>Busca técnica de peças específicas e itens fora de linha.</p></div></article></div></div><form class="quote-form" id="quote-form"><span class="eyebrow">Orçamento rápido</span><h2>Conte o que aconteceu</h2><label class="field">Seu nome<input name="nome" required placeholder="Como podemos chamar você?" autocomplete="name"></label><label class="field">Tipo de embarcação<input name="barco" required placeholder="Lancha, veleiro, bote…"></label><label class="field">Serviço desejado<select name="servico"><option>Manutenção hidráulica</option><option>Encomenda de peça</option><option>Prensagem de mangueira</option></select></label><label class="field">Como podemos ajudar?<textarea name="descricao" required placeholder="Conte um pouco sobre o serviço…"></textarea></label><button class="button button-yellow" type="submit">Pedir orçamento pelo WhatsApp</button><p class="form-note" id="quote-status" role="status"></p></form></div></section>`;
  }
  function contact() {
    const contacts = [['LOCALIZAÇÃO', 'Endereço', 'Rua Antônio Miguel dos Santos, 123'], ['LIGUE', 'Telefone', '(11) 94013-7801'], ['ESCREVA', 'E-mail', 'JC.comercioservice@gmail.com'], ['ACOMPANHE', 'Instagram', '@jchidraulicaguaruja'], ['HORÁRIOS', 'Atendimento', 'Seg–Sex, 08h–18h · Fins de semana fechado']];
    return `${pageHero('Fale com a gente', 'Contato', 'Visite o balcão ou chame no WhatsApp para confirmar estoque e agendar serviços.')}<section class="section"><div class="wrap contact-grid">${contacts.map(([tag, title, value]) => `<article class="contact-card"><span class="contact-icon">${tag}</span><h2>${title}</h2><p>${escapeHtml(value)}</p></article>`).join('')}</div></section><section class="cta-band"><div class="wrap cta-inner"><div><h2>Precisa de uma resposta rápida?</h2><p>Nosso atendimento no WhatsApp é direto com a equipe da loja.</p></div><a class="button button-yellow" href="${escapeHtml(waLink('Olá! Gostaria de falar com a JC Hidráulica.'))}" target="_blank" rel="noopener">Chamar no WhatsApp</a></div></section>`;
  }
  function login() {
    return `<section class="login-wrap"><form class="login-panel" id="login-form"><span class="eyebrow">Área restrita</span><h1>Entrar no painel</h1><p class="muted-intro">Acesse para atualizar os produtos e a disponibilidade do catálogo.</p>${state.sessionError ? `<p class="inline-alert" role="alert">${escapeHtml(state.sessionError)} <button class="text-link" type="button" data-action="retry-session">Tentar novamente</button></p>` : ''}<label class="field">E-mail<input name="email" type="email" autocomplete="username" required placeholder="voce@empresa.com"></label><label class="field">Senha<input name="senha" type="password" autocomplete="current-password" required placeholder="Sua senha"></label><button class="button button-yellow" type="submit" ${state.busy ? 'disabled' : ''}>${state.busy ? 'Entrando…' : 'Entrar'}</button><p class="inline-alert" id="login-error" role="alert"></p><p class="login-help">Somente administradores autorizados podem acessar esta área.</p></form></section>`;
  }
  function sessionLoading() {
    return `<section class="login-wrap"><div class="login-panel" role="status"><span class="eyebrow">Área restrita</span><h1>Verificando acesso</h1><div class="loading-row"><span class="loader"></span>Validando sua sessão segura…</div></div></section>`;
  }
  function adminPanel() {
    const identityLabel = state.adminIdentity?.email || state.adminIdentity?.nome || state.adminIdentity?.name || 'Administrador';
    const rows = state.adminProducts.map(p => `<tr><td><div class="admin-product">${p.image ? `<img src="${escapeHtml(p.image)}" alt="">` : '<img src="/imagens/logo-jc.png" alt="">'}<strong>${escapeHtml(p.name)}</strong></div></td><td class="description-cell">${escapeHtml(p.description)}</td><td><button class="status-toggle" role="switch" aria-checked="${p.available}" aria-label="Mudar disponibilidade de ${escapeHtml(p.name)}" data-action="toggle-product" data-id="${escapeHtml(p.id)}"><span class="toggle-track"></span>${p.available ? 'Disponível' : 'Indisponível'}</button></td><td><div class="row-actions"><button class="icon-button" type="button" data-action="edit-product" data-id="${escapeHtml(p.id)}" aria-label="Editar ${escapeHtml(p.name)}">✎</button><button class="icon-button delete" type="button" data-action="delete-product" data-id="${escapeHtml(p.id)}" aria-label="Excluir ${escapeHtml(p.name)}">×</button></div></td></tr>`).join('');
    return `<section class="admin-area"><div class="wrap"><div class="admin-head"><div><span class="eyebrow">Administração · ${escapeHtml(identityLabel)}</span><h1>Gestão de produtos</h1></div><div class="admin-actions"><button class="button button-yellow" data-action="new-product" type="button">＋ Cadastrar produto</button><button class="button button-plain" data-action="logout" type="button">Sair</button></div></div>
      ${state.adminError ? `<div class="error-box" role="alert">${escapeHtml(state.adminError)} <button class="text-link" data-action="reload-admin" type="button">Tentar novamente</button></div>` : ''}
      <div class="table-wrap"><table><thead><tr><th>Produto</th><th>Descrição</th><th>Status</th><th style="text-align:right">Ações</th></tr></thead><tbody>${state.adminLoading ? '<tr><td colspan="4"><div class="loading-row"><span class="loader"></span>Carregando produtos…</div></td></tr>' : rows || '<tr><td colspan="4">Nenhum produto cadastrado.</td></tr>'}</tbody></table></div></div></section>${state.editing ? productModal() : ''}`;
  }
  function productModal() {
    const p = state.editing === 'new' ? null : state.editing;
    const image = p?.image || '';
    return `<div class="modal-backdrop" data-action="close-modal"><form class="modal admin-form" id="product-form" data-id="${escapeHtml(p?.id || '')}"><div class="modal-head"><h2>${p ? 'Editar produto' : 'Novo produto'}</h2><button type="button" data-action="close-modal" aria-label="Fechar">×</button></div><label class="field">Nome do produto<input name="nome" required value="${escapeHtml(p?.name || '')}"></label><label class="field">Imagem (URL)<input name="URL" value="${escapeHtml(image.startsWith('data:') ? '' : image)}" placeholder="https://…" inputmode="url"></label><label class="field">Ou enviar arquivo<input name="arquivo" type="file" accept="image/*"></label><img class="preview" data-preview src="${escapeHtml(image || '/imagens/logo-jc.png')}" alt="Pré-visualização"><label class="field" style="margin-top:17px">Descrição<textarea name="descricao" required>${escapeHtml(p?.description || '')}</textarea></label><p class="inline-alert" data-form-error role="alert"></p><div class="modal-actions"><button class="button button-plain" type="button" data-action="close-modal">Cancelar</button><button class="button button-yellow" type="submit" ${state.busy ? 'disabled' : ''}>${state.busy ? 'Salvando…' : 'Salvar produto'}</button></div></form></div>`;
  }
  function notFound() {
    return `<section class="wrap not-found"><strong>404</strong><h1>Esta página não foi encontrada</h1><p>Confira o endereço ou volte para a página inicial.</p>${button('Ir para o início', 'button-yellow', '#/')}</section>`;
  }
  function render() {
    const current = route();
    let content;
    if (current === '/') content = home();
    else if (current === '/catalogo') content = catalog();
    else if (current.startsWith('/produto/')) content = productDetail();
    else if (current === '/sobre') content = about();
    else if (current === '/servicos') content = services();
    else if (current === '/contato') content = contact();
    else if (current === '/admin') content = state.adminAuthStatus === 'authenticated' ? adminPanel() : ['unknown', 'checking'].includes(state.adminAuthStatus) ? sessionLoading() : login();
    else content = notFound();
    app.innerHTML = `${header()}<main>${content}</main>${footer()}`;
    document.title = ({ '/': 'JC Hidráulica | Peças e Oficina Naval', '/catalogo': 'Catálogo de Produtos | JC Hidráulica', '/sobre': 'Sobre nós | JC Hidráulica', '/servicos': 'Oficina e Serviços Navais | JC Hidráulica', '/contato': 'Contato | JC Hidráulica', '/admin': 'Painel Administrativo | JC Hidráulica' })[current] || (current.startsWith('/produto/') ? 'Produto | JC Hidráulica' : 'Página não encontrada | JC Hidráulica');
    if (current === '/admin' && state.adminAuthStatus === 'unknown') bootstrapAdminSession();
    if (current === '/admin' && state.adminAuthStatus === 'authenticated' && !state.adminLoading && !state.adminLoaded && !state.adminError) loadAdminProducts();
  }
  async function loadAdminProducts() {
    state.adminLoading = true; state.adminError = ''; render();
    try { state.adminProducts = apiRows(await request('/api/admins/produtos')).map(formatProduct); }
    catch (error) { state.adminError = `Não foi possível carregar os produtos. ${error.message}`; }
    finally { state.adminLoading = false; state.adminLoaded = true; render(); }
  }
  async function bootstrapAdminSession() {
    if (state.adminAuthStatus === 'checking') return;
    const generation = ++adminSessionGeneration;
    state.adminAuthStatus = 'checking'; state.sessionError = ''; render();
    try {
      const result = await request('/api/admins/session');
      if (generation !== adminSessionGeneration) return;
      const identity = result?.admin || result?.user || result;
      if (!identity || typeof identity !== 'object' || result?.authenticated === false || result?.success === false) {
        state.adminAuthStatus = 'anonymous'; state.adminIdentity = null;
      } else {
        state.adminIdentity = identity;
        state.adminAuthStatus = 'authenticated';
        state.adminProducts = []; state.adminLoaded = false; state.adminError = '';
      }
    } catch (error) {
      if (generation !== adminSessionGeneration) return;
      if (error.status !== 401) {
        state.adminAuthStatus = 'error';
        state.sessionError = 'Não foi possível verificar sua sessão. Confira sua conexão e tente novamente.';
      }
    }
    render();
  }
  async function resizeImage(file) {
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = new Image();
      await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = objectUrl; });
      const scale = Math.min(1, 800 / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas'); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', .82);
    } finally { URL.revokeObjectURL(objectUrl); }
  }

  document.addEventListener('input', event => {
    const target = event.target;
    if (target.matches('#header-search, [data-catalog-search]')) {
      state.search = target.value;
      if (route() === '/catalogo' || target.id === 'header-search') {
        const selection = target.selectionStart;
        render();
        const next = document.querySelector(target.id === 'header-search' ? '#header-search' : '[data-catalog-search]');
        if (next) { next.focus(); next.setSelectionRange(selection, selection); }
      }
    }
  });
  document.addEventListener('submit', async event => {
    const form = event.target;
    if (form.id === 'site-search') { event.preventDefault(); location.hash = '#/catalogo'; return; }
    if (form.id === 'quote-form') {
      event.preventDefault(); const data = new FormData(form);
      const message = `Olá! Sou ${data.get('nome')}. Gostaria de um orçamento para ${data.get('servico')} em uma embarcação ${data.get('barco')}. Problema: ${data.get('descricao')}`;
      window.open(waLink(message), '_blank', 'noopener,noreferrer');
      document.querySelector('#quote-status').textContent = 'Seu pedido foi preparado no WhatsApp. É só enviar a mensagem.';
      return;
    }
    if (form.id === 'login-form') {
      event.preventDefault(); if (state.busy) return;
      const data = new FormData(form), email = String(data.get('email')).trim(), senha = String(data.get('senha'));
      state.busy = true; render();
      try {
        await request('/api/admins/login', { method: 'POST', body: JSON.stringify({ email, senha }) });
        state.busy = false; state.adminAuthStatus = 'unknown'; state.adminIdentity = null;
        state.adminProducts = []; state.adminLoaded = false; state.adminError = ''; state.adminLoading = false;
        await bootstrapAdminSession();
      } catch (error) {
        state.busy = false; render();
        const node = document.querySelector('#login-error'); if (node) node.textContent = 'E-mail ou senha incorretos, ou o serviço está indisponível. Tente novamente.';
      }
      return;
    }
    if (form.id === 'product-form') {
      event.preventDefault(); if (state.busy) return;
      const data = new FormData(form), file = data.get('arquivo');
      const row = { nome: String(data.get('nome')).trim(), descricao: String(data.get('descricao')).trim(), URL: String(data.get('URL')).trim(), prudutoDisponivel: form.dataset.id ? state.editing.available : true };
      const errorEl = form.querySelector('[data-form-error]');
      state.busy = true; const submit = form.querySelector('[type="submit"]'); submit.disabled = true; submit.textContent = 'Salvando…';
      try {
        if (file instanceof File && file.size) row.URL = await resizeImage(file);
        if (row.URL && !safeImage(row.URL)) throw new Error('Informe um endereço de imagem válido (http ou https).');
        const id = form.dataset.id;
        await request(id ? `/api/produtos/${encodeURIComponent(id)}` : '/api/produtos', { method: id ? 'PUT' : 'POST', body: JSON.stringify(row) });
        state.busy = false; state.editing = null; state.adminProducts = []; state.adminLoaded = false; render();
      } catch (error) { state.busy = false; submit.disabled = false; submit.textContent = 'Salvar produto'; errorEl.textContent = error.message || 'Não foi possível salvar o produto. Tente novamente.'; }
    }
  });
  document.addEventListener('change', async event => {
    if (event.target.matches('[name="arquivo"]')) {
      const file = event.target.files?.[0]; if (!file) return;
      try { const url = await resizeImage(file); const preview = document.querySelector('[data-preview]'); if (preview) preview.src = url; const urlInput = document.querySelector('[name="URL"]'); if (urlInput) urlInput.dataset.upload = url; }
      catch { const error = document.querySelector('[data-form-error]'); if (error) error.textContent = 'Não foi possível abrir essa imagem. Escolha outro arquivo.'; }
    }
  });
  document.addEventListener('input', event => {
    if (event.target.matches('[name="URL"]')) {
      event.target.dataset.upload = '';
      const preview = document.querySelector('[data-preview]'); if (preview) preview.src = safeImage(event.target.value) || '/imagens/logo-jc.png';
    }
  });
  document.addEventListener('click', async event => {
    const actionNode = event.target.closest('[data-action]');
    if (!actionNode) {
      const pageButton = event.target.closest('[data-page]');
      if (pageButton) { state.page = Number(pageButton.dataset.page); render(); }
      return;
    }
    const action = actionNode.dataset.action;
    if (action === 'retry-products') loadProducts();
    if (action === 'reload-admin') loadAdminProducts();
    if (action === 'retry-session') { state.adminAuthStatus = 'unknown'; state.sessionError = ''; render(); }
    if (action === 'new-product') { state.editing = 'new'; render(); }
    if (action === 'edit-product') { state.editing = state.adminProducts.find(p => p.id === actionNode.dataset.id) || null; render(); }
    if (action === 'close-modal') { if (event.target === actionNode || actionNode.tagName === 'BUTTON') { event.preventDefault(); state.editing = null; state.busy = false; render(); } }
    if (action === 'logout') {
      actionNode.disabled = true;
      try { await request('/api/admins/logout', { method: 'POST' }); }
      catch (error) { console.warn('Logout request did not complete:', error); }
      resetAdminSession();
    }
    if (action === 'toggle-product') {
      const product = state.adminProducts.find(p => p.id === actionNode.dataset.id); if (!product) return;
      actionNode.disabled = true;
      try { await request(`/api/produtos/${encodeURIComponent(product.id)}/status`, { method: 'PATCH', body: JSON.stringify({ prudutoDisponivel: !product.available }) }); await loadAdminProducts(); }
      catch (error) { state.adminError = `Não foi possível atualizar a disponibilidade. ${error.message}`; render(); }
    }
    if (action === 'delete-product') {
      const product = state.adminProducts.find(p => p.id === actionNode.dataset.id); if (!product || !window.confirm(`Excluir “${product.name}”? Esta ação não pode ser desfeita.`)) return;
      actionNode.disabled = true;
      try { await request(`/api/produtos/${encodeURIComponent(product.id)}`, { method: 'DELETE' }); await loadAdminProducts(); }
      catch (error) { state.adminError = `Não foi possível excluir o produto. ${error.message}`; render(); }
    }
  });
  window.addEventListener('hashchange', () => {
    const current = route();
    if (current === '/admin' && lastRoute !== '/admin') {
      state.adminAuthStatus = 'unknown'; state.adminIdentity = null; state.adminProducts = [];
      state.adminLoaded = false; state.adminError = ''; state.sessionError = '';
    }
    lastRoute = current; state.page = 1; render(); window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  window.addEventListener('error', event => { console.error('Erro na interface:', event.message); });
  if (!location.hash) location.hash = '#/';
  render();
  loadProducts();
})();
