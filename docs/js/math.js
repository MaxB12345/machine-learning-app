/** Rich text: `code` spans plus $...$ / $$...$$ maths rendered with KaTeX. */

import { h } from "./dom.js";

const MATH_DELIMITERS = [
  { left: "$$", right: "$$", display: true },
  { left: "$", right: "$", display: false },
];

/** Build an element whose text may contain `code` spans and LaTeX maths. */
export function richText(tag, text, attrs = {}) {
  const element = h(tag, attrs);
  String(text).split("`").forEach((part, index) => {
    element.append(index % 2 ? h("code", {}, part) : document.createTextNode(part));
  });
  if (typeof window.renderMathInElement === "function") {
    window.renderMathInElement(element, { delimiters: MATH_DELIMITERS, throwOnError: false });
  }
  return element;
}
