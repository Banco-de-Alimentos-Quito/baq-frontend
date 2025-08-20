export function getOrCreateUserId(): string | null {
  const key = "user_id";
  let userId = localStorage.getItem(key);

  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(key, userId);
  }

  return userId;
}
