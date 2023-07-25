import { wrapToVdom } from "./utils";
import { Component } from "./component";
/**
 * 将jsx转换为虚拟dom
 * @param {*} type 元素类型
 * @param {*} config 属性配置对象
 * @param {*} children 子节点
 */
function createElement(type, config, children) {
  if (config) {
    delete config.__source;
    delete config.__self;
  }
  const props = { ...config };
  // 如果函数形参超过3个说明有多个子节点，则需要用数组表示
  if (arguments.length > 3) {
    props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVdom);
  } else {
    props.children = wrapToVdom(children);
  }
  return {
    type,
    props,
  };
}

const react = {
  createElement,
  Component,
};
export default react;
