import type { Product } from "@/lib/product";

const raw = [
  ["Esteira condutora de cabos", "/imagens/esteira-condutora.png", "Proteção e organização flexível para cabos e mangueiras em movimento contínuo em máquinas e equipamentos."],
  ["Terminal hidráulico em aço", "/imagens/terminal-hidraulico.png", "Conexão de alta resistência e vedação perfeita para montagem de mangueiras em sistemas de alta pressão."],
  ["Rolamentos", "/imagens/rolamentos.png", "Componentes de precisão para redução de atrito e suporte de eixos em rotações industriais e náuticas."],
  ["Anéis (O-ring)", "/imagens/aneis-oring.png", "Elementos de vedação elastoméricos projetados para evitar vazamentos de fluidos e gases em conexões hidráulicas."],
  ["Mangueira com trança de aço", "/imagens/mangueira-tranca-aco.png", "Tubulação reforçada de alta pressão, ideal para condução de fluidos hidráulicos pesados."],
  ["Unidade hidráulica", "/imagens/unidade-hidraulica.png", "Sistema completo gerador de energia e pressão hidráulica para acionamento de atuadores e máquinas."],
  ["Manômetro", "/imagens/manometro.png", "Instrumento de alta precisão para monitoramento e medição da pressão de trabalho em sistemas hidráulicos."],
] as const satisfies ReadonlyArray<readonly [name: string, imageUrl: string, description: string]>;

export const localProducts: Product[] = raw.map(([name, image_url, description], i) => ({
  id: `local-${i + 1}`,
  name,
  image_url,
  description,
  available: true,
  created_at: "2026-01-01T00:00:00Z",
}));