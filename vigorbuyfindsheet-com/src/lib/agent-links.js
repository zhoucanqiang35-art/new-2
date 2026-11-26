import platforms from '../data/purchase-agents.json';

export const agents = platforms;
export function agentHref(template, id) {
  return /^\d{8,20}$/.test(id) ? template.replaceAll('{id}', id) : '';
}
