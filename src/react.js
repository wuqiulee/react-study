import { wrapToVdom } from "./utils";
import { Component } from "./component";
import { REACT_FORWORD_REF_TYPE } from "./constants";
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

/**
 * 根据老元素 克隆出新元素
 * @param {*} oldElement
 * @param {*} newProps
 * @param {*} children
 */
function cloneElement(oldElement, newProps, children) {
  if (arguments.length > 3) {
    children = Array.prototype.slice.call(arguments, 2).map(wrapToVdom);
  } else {
    children = wrapToVdom(children);
  }
  const props = { ...oldElement.props, ...newProps, children };
  return { ...oldElement, props };
}

function createRef() {
  return { current: null };
}

/**
 * 实现函数组件ref的转发
 * @param {*} FunctionComponent
 * @returns
 */
// function forwardRef(FunctionComponent) {
//   return class extends Component {
//     render() {
//       return FunctionComponent(this.props, this.props.ref);
//     }
//   };
// }
function forwardRef(render) {
  return {
    $$typeof: REACT_FORWORD_REF_TYPE,
    render,
  };
}

function createContext() {
  const Provider = ({ value, children }) => {
    Provider._value = value;
    return children;
  };
  const Consumer = ({ children }) => {
    return children(Provider._value);
  };
  return { Provider, Consumer };
}
const react = {
  createElement,
  cloneElement,
  Component,
  createRef,
  forwardRef,
  createContext,
};
export default react;
