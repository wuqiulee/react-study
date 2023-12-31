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

export function shallowEqual(obj1 = {}, obj2 = {}) {
  if (obj1 === obj2) {
    return true;
  }
  if (
    typeof obj1 !== "object" ||
    obj1 === null ||
    typeof obj2 !== "object" ||
    obj2 === null
  ) {
    return false;
  }
  let keys1 = Object.keys(obj1);
  let keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (let key of keys1) {
    if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
      return false;
    }
  }
  return true;
}
