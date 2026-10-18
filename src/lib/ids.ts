/** IDs must also work on plain HTTP LAN hosts, where crypto.randomUUID is unavailable. */
export function newId(prefix = 'id'): string {
  const c = typeof crypto !== 'undefined' ? crypto : undefined;
  if (c && typeof c.randomUUID === 'function') return prefix + '-' + c.randomUUID();
  const random = new Uint8Array(16);
  if (c && typeof c.getRandomValues === 'function') c.getRandomValues(random);
  else for (let i = 0; i < random.length; i++) random[i] = Math.floor(Math.random() * 256);
  return prefix + '-' + Date.now().toString(36) + '-' + [...random].map(n => n.toString(16).padStart(2, '0')).join('');
}
