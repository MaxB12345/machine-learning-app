import { selfMark } from "./self-mark.js";

/** Worked answer: reveal the model answer and its steps, then self-rate. */
export default function renderShort(question, done) {
  return selfMark(question, done);
}
