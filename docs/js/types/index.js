/** Maps a question `type` to its renderer. */

import renderCode from "./code.js";
import renderFlashcard from "./flashcard.js";
import renderMcq from "./mcq.js";
import renderMulti from "./multi.js";
import renderNumeric from "./numeric.js";
import renderOrder from "./order.js";
import renderShort from "./short.js";
import renderTrueFalse from "./truefalse.js";

const RENDERERS = {
  mcq: renderMcq,
  multi: renderMulti,
  truefalse: renderTrueFalse,
  flashcard: renderFlashcard,
  numeric: renderNumeric,
  short: renderShort,
  order: renderOrder,
  code: renderCode,
};

export const TYPE_LABELS = {
  mcq: "Multiple choice",
  multi: "Select all",
  truefalse: "True / false",
  flashcard: "Flashcard",
  numeric: "Numeric",
  short: "Worked answer",
  order: "Put in order",
  code: "Code",
};

/** Render the interactive part of a question; `done(correct, extra)` fires once. */
export function renderQuestion(question, done) {
  const render = RENDERERS[question.type];
  if (!render) throw new Error(`No renderer for question type "${question.type}"`);
  return render(question, done);
}
