import { REACT_TEXT } from "./constants";
import { addEvent } from "./event";
/**
 * 渲染多个子vdom
 * @param {*} childrenVdoms
 * @param {*} parentDom
 */
function reconcileChildren(childrenVdoms, parentDom) {
  for (let childVom of childrenVdoms) {
    render(childVom, parentDom);
  }
}
/**
 * 根据vdom更新真实dom属性
 * @param {*} dom 真实dom
 * @param {*} oldProps
 * @param {*} newProps 新的vdom
 */
function updateProps(dom, oldProps, newProps) {
  for (let key in newProps) {
    if (key === "children") {
      continue;
    }
    // 更新样式
    if (key === "style") {
      const styleObj = newProps[key];
      for (let attr in styleObj) {
        dom.style[attr] = styleObj[attr];
      }
    } else if (key.startsWith("on")) {
      // 绑定事件
      // dom[key.toLocaleLowerCase()] = newProps[key];
      addEvent(dom, key.toLocaleLowerCase(), newProps[key]);
    } else {
      dom[key] = newProps[key];
    }
  }
}
/**
 * 挂载函数组件
 */
function mountFunctionComponent(vdom) {
  const { type, props } = vdom;
  const renderVdom = type(props);
  vdom.oldRenderVdom = renderVdom;
  return createDOM(renderVdom);
}
/**
 * 挂载类组件
 */
function mountClassComponent(vdom) {
  const { type, props, ref } = vdom;
  const componentProps = { ...props, ...type.defaultProps };
  const classInstance = new type(componentProps);
  // 执行componentWillMount钩子
  if (classInstance.componentWillMount) {
    classInstance.componentWillMount();
  }
  // 执行类组件的render方法，返回vdom
  const renderVdom = classInstance.render();
  // 执行componentDidMount钩子
  if (classInstance.componentDidMount) {
    classInstance.componentDidMount();
  }
  // 将vdom存到类的实例上 用于后面的dom-diff,给类实例和外层类组件都存一份
  classInstance.oldRenderVdom = vdom.oldRenderVdom = renderVdom;
  // 如果类组件上有ref，则将ref指向类组件实例
  if (ref) {
    ref.current = classInstance;
  }
  return createDOM(renderVdom);
}

/**
 * 根据vdom创建真实dom
 * @param {*} vdom
 * @returns 真实dom
 */
function createDOM(vdom) {
  const { type, props, content, ref } = vdom;
  // 真实dom
  let dom = null;
  if (type === REACT_TEXT) {
    // 文本节点
    dom = document.createTextNode(content);
  } else if (typeof type === "function") {
    if (type.isReactComponent) {
      // 处理类组件
      return mountClassComponent(vdom);
    } else {
      // 处理函数组件
      return mountFunctionComponent(vdom);
    }
  } else {
    // dom元素
    dom = document.createElement(type);
  }
  if (props) {
    // 根据vdom更新真实dom属性
    updateProps(dom, {}, props);
    if (Array.isArray(props.children)) {
      reconcileChildren(props.children, dom);
    } else if (typeof props.children === "object") {
      render(props.children, dom);
    }
  }
  // 保存下vdom对应的真实dom，用于后续dom-diff
  vdom.dom = dom;
  // 将ref.current指向真实dom
  if (ref) {
    ref.current = dom;
  }
  return dom;
}
/**
 * 将vdom渲染到页面容器中
 * @param {*} vdom 虚拟dom
 */
function render(vdom, container) {
  const root = createDOM(vdom);
  container.appendChild(root);
}

/**
 * 根据vdom找对应的真实dom
 * @param {*} vdom
 * @returns
 */
export function findDOM(vdom) {
  const { type } = vdom;
  let dom = null;
  // 如果是组件(类或函数组件)，则通过vdom上保存的oldRenderVdom递归调用findDOM
  if (typeof type === "function") {
    // 防止组件返回的还是组件 所以必须递归
    dom = findDOM(vdom.oldRenderVdom);
  } else {
    dom = vdom.dom;
  }
  return dom;
}

/**
 * 根据新老vdom,找出差异并更新到真实dom上
 * @param {*} parentDOM 父dom元素
 * @param {*} oldVdom 老的vdom
 * @param {*} newVdom 新的vdom
 */
export function compareTwoVdom(parentDOM, oldVdom, newVdom) {
  const oldDOM = findDOM(oldVdom);
  const newDOM = createDOM(newVdom);
  // 新的真实dom替换老的真实dom
  parentDOM.replaceChild(newDOM, oldDOM);
}

const ReactDom = {
  render,
};
export default ReactDom;
