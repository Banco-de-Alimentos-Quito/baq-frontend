export function getOrCreateUserId() {
  return crypto.randomUUID();
}