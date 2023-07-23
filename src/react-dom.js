import { REACT_TEXT } from "./constants";
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
    } else {
      dom[key] = newProps[key];
    }
  }
}
/**
 * 根据vdom创建真实dom
 * @param {*} vdom
 * @returns 真实dom
 */
function createDOM(vdom) {
  const { type, props, content } = vdom;
  console.log(vdom, "vdom");
  // 真实dom
  let dom = null;
  if (type === REACT_TEXT) {
    // 文本节点
    dom = document.createTextNode(content);
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
  return dom;
}
/**
 * 将vdom渲染到页面容器中
 * @param {*} vdom 虚拟dom
 */
function render(vdom, container) {
  const root = createDOM(vdom);
  console.log(container, vdom);
  container.appendChild(root);
}

const ReactDom = {
  render,
};
export default ReactDom;
