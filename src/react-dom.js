import {
  REACT_TEXT,
  REACT_FORWORD_REF_TYPE,
  REACT_PROVIDER,
  REACT_CONTEXT,
  REACT_MEMO,
} from "./constants";
import { addEvent } from "./event";

let hookState = []; //这里存放着所有的状态
let hookIndex = 0; //当前的执行的hook的索引
let scheduleUpdate; //调度更新方法

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
      if (newProps[key]) {
        dom[key] = newProps[key];
      }
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
  // 挂载context
  if (type.contextType) {
    classInstance.context = type.contextType._currentValue;
  }
  // 挂在类实例，方便后面更新类组件使用
  vdom.classInstance = classInstance;
  // 执行componentWillMount钩子
  if (classInstance.componentWillMount) {
    classInstance.componentWillMount();
  }
  // 执行类组件的render方法，返回vdom
  const renderVdom = classInstance.render();
  // 将vdom存到类的实例上 用于后面的dom-diff,给类实例和外层类组件都存一份
  classInstance.oldRenderVdom = vdom.oldRenderVdom = renderVdom;
  // 如果类组件上有ref，则将ref指向类组件实例
  if (ref) {
    ref.current = classInstance;
  }
  const dom = createDOM(renderVdom);
  // 把componentDidMount钩子存到真实dom上
  if (classInstance.componentDidMount) {
    dom.componentDidMount = classInstance.componentDidMount.bind(this);
  }
  return dom;
}

/**
 * 挂在forwordrRef组件
 * @param {*} vdom
 * @returns
 */
function mountForwardComponent(vdom) {
  const { type, props, ref } = vdom;
  const renderVdom = type.render(props, ref);
  vdom.oldRenderVdom = renderVdom;
  return createDOM(renderVdom);
}

function mountContextComponent(vdom) {
  let { type, props } = vdom;
  let renderVdom = props.children(type._context._currentValue);
  vdom.oldRenderVdom = renderVdom;
  return createDOM(renderVdom);
}
function mountProviderComponent(vdom) {
  let { type, props } = vdom;
  //在渲染Provider组件的时候，拿到属性中的value，赋给context._currentValue
  type._context._currentValue = props.value;
  let renderVdom = props.children;
  vdom.oldRenderVdom = renderVdom;
  return createDOM(renderVdom);
}
function mountMemoComponent(vdom) {
  let { type, props } = vdom;
  let renderVdom = type.type(props);
  vdom.prevProps = props; //记录一下老的属性对象，在更新的时候会用到
  vdom.oldRenderVdom = renderVdom;
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
  if (type && type.$$typeof === REACT_MEMO) {
    return mountMemoComponent(vdom);
  } else if (type && type.$$typeof === REACT_CONTEXT) {
    return mountContextComponent(vdom);
  } else if (type && type.$$typeof === REACT_PROVIDER) {
    return mountProviderComponent(vdom);
  }
  if (type && type.$$typeof === REACT_FORWORD_REF_TYPE) {
    return mountForwardComponent(vdom);
  } else if (type === REACT_TEXT) {
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
  mount(vdom, container);
  scheduleUpdate = () => {
    // 让hooks下标置0 从新开始渲染
    hookIndex = 0;
    // 深度对比vdom
    compareTwoVdom(container, vdom, vdom);
  };
}

function mount(vdom, container) {
  const root = createDOM(vdom);
  container.appendChild(root);
  // 执行componentDidMount钩子
  if (root.componentDidMount) {
    root.componentDidMount();
  }
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
  if (typeof type === "string" || type === REACT_TEXT) {
    dom = vdom.dom;
  } else if (typeof type === "function") {
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
 * @param {*} nextDOM 下一个真实dom
 */
export function compareTwoVdom(parentDOM, oldVdom, newVdom, nextDOM) {
  // 如果新老vdom都不存在直接return,比如组件return null
  if (!oldVdom && !newVdom) {
    return;
  } else if (oldVdom && !newVdom) {
    // 如果老的vdom存在，新的vdom不存在，则要卸载老组件
    const currentDom = findDOM(oldVdom);
    currentDom.parentNode.removeChild(currentDom);
    // 执行组件将要卸载钩子
    if (oldVdom.classInstance?.componentWillUnmount) {
      oldVdom.classInstance.componentWillUnmount();
    }
  } else if (!oldVdom && newVdom) {
    // 如果老的vdom不存在，新的vdom存在，则创建新组建
    const newDOM = createDOM(newVdom);
    if (nextDOM) {
      parentDOM.insertBefore(newVdom, nextDOM);
    } else {
      parentDOM.appendChild(newDOM);
    }
    // 执行componentDidMount钩子
    if (newDOM.componentDidMount) {
      newDOM.componentDidMount();
    }
    return newVdom;
  } else if (oldVdom && newVdom && oldVdom.type !== newVdom.type) {
    // 如果新老vdom都存在，且类型不同，比如 div => p,则删除老的创建新的
    const oldDOM = findDOM(oldVdom);
    const newDOM = createDOM(newVdom);
    oldDOM.parentNode.replaceChild(newDOM, oldDOM);
    // 执行组件将要卸载钩子
    if (oldVdom.classInstance?.componentWillUnmount) {
      oldVdom.classInstance.componentWillUnmount();
    }
    // 执行componentDidMount钩子
    if (newDOM.componentDidMount) {
      newDOM.componentDidMount();
    }
    return newVdom;
  } else {
    // 如果新老vdom都存在，且类型相同，则需深度递归 dom diff
    updateElement(oldVdom, newVdom);
    return newVdom;
  }
}
// export function compareTwoVdom(parentDOM, oldVdom, newVdom) {
//   const oldDOM = findDOM(oldVdom);
//   const newDOM = createDOM(newVdom);
//   // 新的真实dom替换老的真实dom
//   parentDOM.replaceChild(newDOM, oldDOM);
// }

/**
 * 更新元素
 * @param {*} oldVdom
 * @param {*} newVdom
 */
function updateElement(oldVdom, newVdom) {
  if (oldVdom.type && oldVdom.type.$$typeof === REACT_MEMO) {
    updateMemoComponent(oldVdom, newVdom);
  } else if (oldVdom.type && oldVdom.type.$$typeof === REACT_PROVIDER) {
    updateProviderComponent(oldVdom, newVdom);
  } else if (oldVdom.type && oldVdom.type.$$typeof === REACT_CONTEXT) {
    updateContextComponent(oldVdom, newVdom);
  } else if (oldVdom.type === REACT_TEXT && newVdom.type === REACT_TEXT) {
    // 新老vdom都是文本节点
    const currentDOM = (newVdom.dom = findDOM(oldVdom));
    // 文本内容不一致才更新
    if (oldVdom.props.content !== newVdom.props.content) {
      currentDOM.textContent = newVdom.props.content;
    }
  } else if (typeof oldVdom.type === "string") {
    // 如果是原生组件，比如div
    // 复用老的真实dom，让新的vdom上的dom等于老的vdom对应的真实dom
    const currentDOM = (newVdom.dom = findDOM(oldVdom));
    // 更新属性
    updateProps(currentDOM, oldVdom.props, newVdom.props);
    // 更新子元素
    updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children);
  } else if (typeof oldVdom.type === "function") {
    if (oldVdom.type.isReactComponent) {
      updateClassComponent(oldVdom, newVdom);
    } else {
      updateFunctionComponent(oldVdom, newVdom);
    }
  }
}
function updateMemoComponent(oldVdom, newVdom) {
  let { type, prevProps } = oldVdom;
  if (type.compare(prevProps, newVdom.props)) {
    newVdom.oldRenderVdom = oldVdom.oldRenderVdom;
    newVdom.prevProps = newVdom.props;
  } else {
    let parentDOM = findDOM(oldVdom).parentNode;
    const { type, props } = newVdom;
    const renderVdom = type.type(props);
    compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, renderVdom);
    newVdom.oldRenderVdom = renderVdom;
    newVdom.prevProps = newVdom.props;
  }
}
function updateProviderComponent(oldVdom, newVdom) {
  let parentDOM = findDOM(oldVdom).parentNode;
  let { type, props } = newVdom;
  type._context._currentValue = props.value;
  let renderVdom = props.children;
  compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, renderVdom);
  newVdom.oldRenderVdom = renderVdom;
}
function updateContextComponent(oldVdom, newVdom) {
  let parentDOM = findDOM(oldVdom).parentNode;
  let { type, props } = newVdom;
  let renderVdom = props.children(type._context._currentValue);
  compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, renderVdom);
  newVdom.oldRenderVdom = renderVdom;
}
/**
 * 更新类组件
 * @param {*} oldVdom
 * @param {*} newVdom
 */
function updateClassComponent(oldVdom, newVdom) {
  const classInstance = (newVdom.classInstance = oldVdom.classInstance);
  newVdom.oldRenderVdom = oldVdom.oldRenderVdom;
  // 执行componentWillReceiveProps钩子
  if (classInstance.componentWillReceiveProps) {
    classInstance.componentWillReceiveProps();
  }
  classInstance.updater.emitUpdate(newVdom.props);
}

/**
 * 更新函数组件
 * @param {*} oldVdom
 * @param {*} newVdom
 */
function updateFunctionComponent(oldVdom, newVdom) {
  const parentDOM = findDOM(oldVdom).parentNode;
  const { type, props } = newVdom;
  const renderVdom = type(props);
  newVdom.oldRenderVdom = renderVdom;
  // 递归对比差异
  compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, renderVdom);
}

/**
 * 更新儿子们
 * @param {*} parentDOM
 * @param {*} oldVChildren
 * @param {*} newVChildren
 */
function updateChildren(parentDOM, oldVChildren, newVChildren) {
  // 统一处理为数组，方便diff
  oldVChildren = Array.isArray(oldVChildren) ? oldVChildren : [oldVChildren];
  newVChildren = Array.isArray(newVChildren) ? newVChildren : [newVChildren];
  // 找出新老最多子元素的数量
  const maxLength = Math.max(oldVChildren.length, newVChildren.length);
  // 一一对比
  for (let i = 0; i < maxLength; i++) {
    // 找到当前vdom的下一个真实dom，方便insertBefore
    const nextVDOM = oldVChildren.find(
      (item, index) => index > i && item && findDOM(item)
    );
    compareTwoVdom(
      parentDOM,
      oldVChildren[i],
      newVChildren[i],
      nextVDOM && findDOM(nextVDOM)
    );
  }
}

export function useState(initialState) {
  // 如果不存在则给当前hook赋初始state
  if (!hookState[hookIndex]) {
    hookState[hookIndex] = initialState;
  }
  // 保存当前hook下标
  const currenIndex = hookIndex;
  // 更新state方法
  const setState = (newState) => {
    hookState[currenIndex] =
      typeof newState === "function"
        ? newState(hookState[currenIndex])
        : newState;
    // 执行调度更新方法
    scheduleUpdate();
  };
  return [hookState[hookIndex++], setState];
}
export function useMemo(factoryFn, deps) {
  if (hookState[hookIndex]) {
    // 说明不是第一次是更新
    let [lastMemo, lastDeps] = hookState[hookIndex];
    let inequality = deps.some((dep, index) => dep !== lastDeps[index]);
    // 如果依赖数组有一项不相同就返回新的值并将最新值保存起来，否则返回上一次的值
    if (inequality) {
      let newMemo = factoryFn();
      hookState[hookIndex++] = [newMemo, deps];
      return newMemo;
    } else {
      hookIndex++;
      return lastMemo;
    }
  } else {
    // 第一次进来将当前函数返回值保存起来，并将该值返回
    let newMemo = factoryFn();
    hookState[hookIndex++] = [newMemo, deps];
    return newMemo;
  }
}

const ReactDom = {
  render,
};
export default ReactDom;
