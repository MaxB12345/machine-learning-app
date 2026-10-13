import { selfMark } from "./self-mark.js";

/** Flip card: reveal the answer, then self-rate. */
export default function renderFlashcard(question, done) {
  return selfMark(question, done);
}
