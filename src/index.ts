import { fetchRuleData as fetchRuleData } from "./fetchRuleData";
import { parseRuleData as parseRuleData } from "./parseRuleData";
import { resolveParamaters } from "./resolveParamaters";
import { createCache } from "./createCache";
import { createTerminal } from "./createTerminal";
import { Action, ActResult, DataCache } from "./types";
import { act } from "./act";

init().catch((error) => console.error(error));

async function init(): Promise<void> {
  const [terminalElement, writeToTerminal] = createTerminal();

  const { rulesSource, searchQuery, dry } = resolveParamaters(
    document.location.href
  );

  if (rulesSource == null || dry) {
    createDomElements(terminalElement);
  } else {
    createDomElementsWithDelay(terminalElement, 2500);
  }

  describeParameters(writeToTerminal, rulesSource, searchQuery, dry);

  if (rulesSource == null) {
    writeToTerminal("No rules source.");
    return;
  }

  const cache = createCache(rulesSource);
  const ruleData = await resolveRuleData(writeToTerminal, rulesSource, cache);
  const actResult = act(ruleData.rules, searchQuery, dry, cache);
  describeActResult(actResult, writeToTerminal);
}

function createDomElementsWithDelay(
  terminalElement: HTMLElement,
  delayMs: number
) {
  setTimeout(() => createDomElements(terminalElement), delayMs);
}

function createDomElements(terminalElement: HTMLElement) {
  const root = document.createElement("div");
  document.body.append(root);
  root.append(terminalElement);
}

function describeParameters(
  writeToTerminal: (text: string) => void,
  rulesSource: string | null,
  searchQuery: string | null,
  dry: boolean
) {
  writeToTerminal(`Using rules from source: ${rulesSource ?? "<null>"}`);
  writeToTerminal(`Using search query: ${searchQuery ?? "<null>"}`);

  if (dry) {
    writeToTerminal(`Dry mode, no actions will be performed.`);
  }
}

function describeActResult(
  actResult: ActResult,
  writeToTerminal: (text: string) => void
) {
  switch (actResult[0]) {
    case "no-query": {
      writeToTerminal("No Query");
      break;
    }
    case "no-matching-action": {
      writeToTerminal("No Matching Action.");
      break;
    }
    case "invalid-action": {
      writeToTerminal("Matching Action is Invalid.");
      describeAction(writeToTerminal, actResult[1]);
      break;
    }
    case "dry-action": {
      writeToTerminal("Running in Dry Mode, action not performed.");
      describeAction(writeToTerminal, actResult[1]);
      break;
    }
    case "action": {
      writeToTerminal("Performed action.");
      describeAction(writeToTerminal, actResult[1]);
      break;
    }
  }
}

function describeAction(
  writeToTerminal: (text: string) => void,
  action: Action
) {
  writeToTerminal(JSON.stringify(action));
}

async function resolveRuleData(
  writeToTerminal: (text: string) => void,
  rulesSource: string,
  cache: DataCache
) {
  const unparsedRules = await fetchRuleData(rulesSource, cache);

  writeToTerminal(
    `Using ${unparsedRules.cached ? "cached " : ""}rule data:\n${
      unparsedRules.data
    }`
  );

  const rules = parseRuleData(unparsedRules);
  return rules;
}
