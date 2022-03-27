import { DataCache, RuleData } from "./types";

export async function fetchRuleData(
  source: string,
  cache: DataCache
): Promise<RuleData> {
  const cachedRules = cache.read();
  if (cachedRules != null) {
    return { data: cachedRules, cached: true };
  }

  const rulesResponse = await fetch(source, {
    credentials: "omit",
  });
  const rules = await rulesResponse.text();
  cache.write(rules);
  return { data: rules, cached: false };
}
