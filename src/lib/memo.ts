import "server-only";

/**
 * Cache mémoire par instance, avec durée de vie stricte (jamais de valeur périmée servie) et
 * déduplication des requêtes simultanées : absorbe les pics sur une même page sans afficher de vieux chiffres.
 */
export function memo<A extends unknown[], R>(fn: (...args: A) => Promise<R>, ttlMs: number, max = 5000) {
  const store = new Map<string, { at: number; value: Promise<R> }>();
  return (...args: A): Promise<R> => {
    const key = JSON.stringify(args);
    const hit = store.get(key);
    if (hit && Date.now() - hit.at < ttlMs) return hit.value;
    const value = fn(...args);
    store.set(key, { at: Date.now(), value });
    value.catch(() => store.delete(key));
    if (store.size > max) store.delete(store.keys().next().value!);
    return value;
  };
}
