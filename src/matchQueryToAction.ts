import {
  Action,
  FallbackRule,
  InternalAction,
  KeywordRule,
  Rule,
  Rules,
  RuleType,
  ShortcutRule,
} from "./types";

export function matchQueryToAction(rules: Rules, query: string): Action | null {
  const queryWordsUppercase = query
    .split(" ")
    .map((word) => word.toUpperCase());
  const matches = rules
    .map((rule) => {
      const ruleType = rule[0];
      switch (ruleType) {
        case "keyword": {
          return matchSearchQueryWithKeywordRule(
            rule,
            query,
            queryWordsUppercase
          );
        }
        case "fallback": {
          return matchSearchQueryWithFallbackRule(rule, query);
        }
        case "shortcut": {
          return matchSearchQueryWithShortcutRule(rule, query);
        }
      }
    })
    .filter((match): match is Action => match != null)
    .sort((a, b) => {
      const typeWeights: Record<RuleType, number> = {
        shortcut: -2,
        keyword: -1,
        fallback: 0,
      };

      return typeWeights[a.rule[0]] - typeWeights[b.rule[0]];
    });

  return matches[0] || null;
}

function matchSearchQueryWithKeywordRule(
  keywordRule: KeywordRule,
  query: string,
  queryWordsUppercase: string[]
): Action | null {
  const keyword = keywordRule[1];
  const actionString = keywordRule[2];

  if (
    queryWordsUppercase.some(
      (wordUppercase) => wordUppercase === keyword.toUpperCase()
    )
  ) {
    const searchTerms = query
      .split(" ")
      .filter((word) => word.toUpperCase() !== keyword.toUpperCase())
      .join(" ");

    return createAction(keywordRule, actionString, searchTerms);
  }

  return null;
}

function matchSearchQueryWithFallbackRule(
  fallbackRule: FallbackRule,
  query: string
): Action | null {
  const actionString = fallbackRule[1];
  return createAction(fallbackRule, actionString, query);
}

function matchSearchQueryWithShortcutRule(
  shortcutRule: ShortcutRule,
  query: string
): Action | null {
  const shortcut = shortcutRule[1];
  if (query.toUpperCase() === shortcut.toUpperCase()) {
    const actionString = shortcutRule[2];
    return createAction(shortcutRule, actionString, query);
  }

  return null;
}

function createAction(rule: Rule, actionString: string, query: string): Action {
  const internalPrefix = "@action:";
  if (actionString.toUpperCase().startsWith(internalPrefix)) {
    return {
      type: "internal",
      subType: actionString.substring(
        internalPrefix.length
      ) as InternalAction["subType"],
      rule,
    };
  }

  if (
    actionString.startsWith("https://") ||
    actionString.startsWith("http://")
  ) {
    const url = expandTemplateUrl(actionString, query);
    let validUrl: boolean;
    try {
      new URL(url);
      validUrl = true;
    } catch {
      validUrl = false;
    }

    if (validUrl) {
      return {
        type: "redirect",
        url,
        rule,
      };
    }
  }

  return { type: "invalid", rule };
}

function expandTemplateUrl(urlTemplate: string, searchTerms: string): string {
  return urlTemplate.replace(/\{searchterms\}/gi, searchTerms);
}
