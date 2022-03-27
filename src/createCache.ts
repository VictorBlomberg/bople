import { DataCache } from "./types";

export function createCache(source: string): DataCache {
  const keyBase = `bople_${btoa(source)}`;
  const cacheKeyRules = `${keyBase}_rules`;
  const cacheKeyTimestamp = `${keyBase}_timestamp`;

  function read(): string | null {
    const cachedRules = localStorage.getItem(cacheKeyRules);
    const cachedTimestamp = JSON.parse(
      localStorage.getItem(cacheKeyTimestamp) ?? "null"
    ) as number | null;

    const maxAgeMs = 1000 * 60; // one minute
    const now = Date.now();
    if (
      cachedRules != null &&
      cachedTimestamp != null &&
      cachedTimestamp > now - maxAgeMs
    ) {
      return cachedRules;
    }

    return null;
  }

  function write(rules: string): void {
    localStorage.setItem(cacheKeyRules, rules);
    localStorage.setItem(cacheKeyTimestamp, JSON.stringify(Date.now()));
  }

  function clear(): void {
    localStorage.removeItem(cacheKeyRules);
    localStorage.removeItem(cacheKeyTimestamp);
  }

  return {
    read,
    write,
    clear,
  };
}
