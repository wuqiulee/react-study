import { REACT_TEXT } from "./constants";
/**
 * 将非对象类型的元素转换为对象包裹的元素，方便后续dom diff
 * @param {*} element
 * @returns {object} 包裹后的对象
 */
export function wrapToVdom(element) {
  if (typeof element === "string" || typeof element === "number") {
    return { type: REACT_TEXT, content: element };
  } else {
    return element;
  }
}
