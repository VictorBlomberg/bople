import {
  Action,
  FallbackRule,
  InternalAction,
  KeywordRedirectRule,
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
        case "keyword-redirect": {
          return matchSearchQueryWithKeywordRedirectRule(
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
        shortcut: -3,
        "keyword-redirect": -2,
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

    return createAction(keywordRule, actionString, searchTerms, null);
  }

  return null;
}

function matchSearchQueryWithKeywordRedirectRule(
  keywordRedirectRule: KeywordRedirectRule,
  query: string,
  queryWordsUppercase: string[]
): Action | null {
  const keyword = keywordRedirectRule[1];
  const match = keywordRedirectRule[2];
  const actionString = keywordRedirectRule[3];

  if (
    !queryWordsUppercase.some(
      (wordUppercase) => wordUppercase === keyword.toUpperCase()
    )
  ) {
    return null;
  }

  const sourceUrlString = query
    .split(" ")
    .filter((word) => word.toUpperCase() !== keyword.toUpperCase())
    .join(" ");

  let sourceUrl: URL;
  try {
    sourceUrl = new URL(sourceUrlString);
  } catch {
    return null;
  }

  const isHostMatch =
    match.host == null ||
    match.host.toUpperCase() === sourceUrl.host.toUpperCase();
  if (!isHostMatch) {
    return null;
  }

  return createAction(
    keywordRedirectRule,
    actionString,
    sourceUrlString,
    sourceUrl
  );
}

function matchSearchQueryWithFallbackRule(
  fallbackRule: FallbackRule,
  query: string
): Action | null {
  const actionString = fallbackRule[1];
  return createAction(fallbackRule, actionString, query, null);
}

function matchSearchQueryWithShortcutRule(
  shortcutRule: ShortcutRule,
  query: string
): Action | null {
  const shortcut = shortcutRule[1];
  if (query.toUpperCase() === shortcut.toUpperCase()) {
    const actionString = shortcutRule[2];
    return createAction(shortcutRule, actionString, query, null);
  }

  return null;
}

function createAction(
  rule: Rule,
  actionString: string,
  query: string,
  sourceUrl: URL | null
): Action {
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
    const url = expandTemplateUrl(actionString, query, sourceUrl);
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

function expandTemplateUrl(
  urlTemplate: string,
  searchTerms: string,
  sourceUrl: URL | null
): string {
  let result = urlTemplate.replace(/\{searchterms\}/gi, searchTerms);

  if (sourceUrl != null) {
    result = result.replace(/\{host\}/gi, sourceUrl.host);
    result = result.replace(/\{path\}/gi, sourceUrl.pathname);
    result = result.replace(/\{query\}/gi, sourceUrl.search);
    result = result.replace(/\{fragment\}/gi, sourceUrl.hash);
  }

  return result;
}
