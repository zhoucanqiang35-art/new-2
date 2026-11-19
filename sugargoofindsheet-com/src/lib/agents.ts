import entries from './agents.json';
import { sourceUrl, type Product } from './catalog';
const buyingAgents = entries.map(agent => ({
  label: agent.name,
  logo: agent.logo,
  url: (product: Product) => agent.template.replace('{productId}', encodeURIComponent(product.weidianId)),
}));
export const defaultCatalogAgent = buyingAgents.find(agent => agent.label === 'Sugargoo')!;
export const catalogAgents = [{label:'FindSpreadsheet', logo:'', url:sourceUrl}, ...buyingAgents];
export const otherAgentLinks = (product: Product) => buyingAgents.filter(agent => agent !== defaultCatalogAgent).map(agent => ({label:agent.label, logo:agent.logo, url:agent.url(product)}));
