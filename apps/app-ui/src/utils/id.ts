export function createId(prefix = 'id'): string {
  const random = Math.random().toString(16).slice(2);
  return `${prefix}_${Date.now()}_${random}`;
}
