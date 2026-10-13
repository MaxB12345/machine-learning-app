/** Tiny DOM helpers so views can build elements without a framework. */

/** h("div", {class: "x", onclick: fn}, child, "text") creates an element. */
export function h(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (name.startsWith("on")) element.addEventListener(name.slice(2), value);
    else if (value !== false && value != null) element.setAttribute(name, value);
  }
  for (const child of children.flat()) {
    element.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return element;
}

export function show(container, ...nodes) {
  container.replaceChildren(...nodes);
  window.scrollTo(0, 0);
}
