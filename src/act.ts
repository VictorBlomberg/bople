import { matchQueryToAction as resolveActionFromQuery } from "./matchQueryToAction";
import { DataCache, Rules, ActResult } from "./types";
import { performAction } from "./performAction";

export function act(
  rules: Rules,
  searchQuery: string | null,
  dry: boolean,
  cache: DataCache
): ActResult {
  if (searchQuery == null) {
    return ["no-query"];
  }

  const action = resolveActionFromQuery(rules, searchQuery);
  if (action == null) {
    return ["no-matching-action"];
  }

  if (action.type === "invalid") {
    return ["invalid-action", action];
  }

  if (dry) {
    return ["dry-action", action];
  }

  performAction(action, cache);
  return ["action", action];
}
