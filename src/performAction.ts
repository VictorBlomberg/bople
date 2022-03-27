import { DataCache, ValidAction } from "./types";

export function performAction(action: ValidAction, cache: DataCache) {
  switch (action.type) {
    case "redirect": {
      document.location = action.url;
      break;
    }
    case "internal": {
      switch (action.subType) {
        case "clear-cache": {
          cache.clear();
          break;
        }
      }
      break;
    }
  }
}
