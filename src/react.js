import { wrapToVdom } from "./utils";
import { Component } from "./component";
/**
 * 将jsx转换为虚拟dom
 * @param {*} type 元素类型
 * @param {*} config 属性配置对象
 * @param {*} children 子节点
 */
function createElement(type, config, children) {
  let key;
  let ref;
  if (config) {
    delete config.__source;
    delete config.__self;
    key = config.key;
    delete config.key;
    ref = config.ref;
    // delete config.ref;
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
    key,
    ref,
  };
}

function createRef() {
  return { current: null };
}

/**
 * 实现函数组件ref的转发
 * @param {*} FunctionComponent
 * @returns
 */
function forwardRef(FunctionComponent) {
  return class extends Component {
    render() {
      return FunctionComponent(this.props, this.props.ref);
    }
  };
}

const react = {
  createElement,
  Component,
  createRef,
  forwardRef,
};
export default react;
