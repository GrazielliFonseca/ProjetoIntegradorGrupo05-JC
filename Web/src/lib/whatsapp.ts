export const WHATSAPP = "5511940137801";

export const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;

export const productWhatsapp = (name: string) =>
  whatsappLink(`Olá! Gostaria de consultar o produto: ${name}`);