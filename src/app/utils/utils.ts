export function getOrCreateUserId(): string | null {
  // No tocar localStorage durante SSR
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return null;
  }

  const key = "user_id";
  let userId = localStorage.getItem(key);

  if (!userId) {
    // usar crypto.randomUUID si está disponible, si no fallback determinista
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      userId = crypto.randomUUID();
    } else {
      userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }
    try {
      localStorage.setItem(key, userId);
    } catch (e) {
      // Silenciar errores de almacenamiento (por ejemplo modo privado)
      console.warn("No se pudo guardar user_id en localStorage:", e);
    }
  }

  return userId;
}
