export type UrlTemplate = string;

export type FallbackRule = ["fallback", UrlTemplate];
export type KeywordRule = ["keyword", string, UrlTemplate];
export type ShortcutRule = ["shortcut", string, string];

export type Rule = FallbackRule | KeywordRule | ShortcutRule;
export type RuleType = Rule[0];
export type Rules = Rule[];

export type PurgeCacheInternalAction = {
  type: "internal";
  subType: "clear-cache";
  rule: Rule;
};
export type InternalAction = PurgeCacheInternalAction;
export type RedirectAction = { type: "redirect"; url: string; rule: Rule };
export type ValidAction = InternalAction | RedirectAction;
export type InvalidAction = { type: "invalid"; rule: Rule };
export type Action = ValidAction | InvalidAction;

export type RuleData = { cached: boolean; data: string };
export type ParsedRuleData = RuleData & { rules: Rules };

export type DataCache = {
  read: () => string | null;
  write: (ruleData: string) => void;
  clear: () => void;
};

export type ActResult =
  | ["no-query"]
  | ["no-matching-action"]
  | ["invalid-action", InvalidAction]
  | ["dry-action", ValidAction]
  | ["action", ValidAction];
