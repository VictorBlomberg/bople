export function createTerminal(): [HTMLElement, (text: string) => void] {
  function applyTerminalStyle(style: CSSStyleDeclaration) {
    style.backgroundColor = "#222";
    style.borderRadius = ".5em";
    style.color = "#eee";
    style.fontFamily = "monospace";
    style.margin = "1em";
    style.overflowY = "auto";
    style.padding = "1em";
    style.whiteSpace = "pre-wrap";
  }

  const element = document.createElement("div");

  const textNode = document.createTextNode("");
  element.append(textNode);

  applyTerminalStyle(element.style);

  function write(text: string): void {
    (textNode.nodeValue?.length ?? 0) !== 0 && (textNode.nodeValue += "\n");
    textNode.nodeValue += text;
  }

  return [element, write];
}
