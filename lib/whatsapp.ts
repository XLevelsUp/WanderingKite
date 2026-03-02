import { siteConfig } from '@/config/site';

export function generateWhatsAppLink(
  service?: string,
  customMessage?: string,
): string {
  const baseMessage = customMessage || getDefaultMessage(service);
  const encodedMessage = encodeURIComponent(baseMessage);
  return `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodedMessage}`;
}

function getDefaultMessage(service?: string): string {
  const messages: Record<string, string> = {
    photography: "Hi! I'm interested in booking a photography session.",
    rentals: "Hi! I'd like to inquire about camera rentals.",
    studio: 'Hi! I want to book the studio space.',
    podcast: "Hi! I'm interested in the podcast recording studio.",
  };

  return (
    messages[service || ''] ||
    `Hi! I'd like to know more about ${siteConfig.name}.`
  );
}
