import { ParsedRuleData, RuleData, Rules } from "./types";

export function parseRuleData(unparsedRules: RuleData): ParsedRuleData {
  return {
    ...unparsedRules,
    rules: (JSON.parse(unparsedRules.data) as { rules: Rules }).rules,
  };
}
