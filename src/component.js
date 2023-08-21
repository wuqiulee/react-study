import { findDOM, compareTwoVdom } from "./react-dom";
export const UpdateQueue = {
  // 控制是否批量更新
  isBatchingUpdate: false,
  updaters: [],
  batchUpdate() {
    for (let updater of UpdateQueue.updaters) {
      updater.updateComponent();
    }
    UpdateQueue.isBatchingUpdate = false;
    UpdateQueue.updaters.length = 0;
  },
};
/**
 * 是否更新组件
 * @param {*} classInstance
 * @param {*} nextState
 */
function shouldUpdate(classInstance, nextProps, nextState) {
  // 维护一个是否要更新的变量
  let willUpdate = true;
  // 如果组件实例上有shouldComponentUpdate钩子，并且返回值为false则不更新
  if (
    classInstance.shouldComponentUpdate &&
    !classInstance.shouldComponentUpdate(nextProps, nextState)
  ) {
    willUpdate = false;
  }
  // 如果更新则执行componentWillUpdate钩子
  if (classInstance.componentWillUpdate && willUpdate) {
    classInstance.componentWillUpdate();
  }
  // 组件不管是否更新props和state都会更新
  if (nextProps) {
    classInstance.props = nextProps;
  }
  if (classInstance.getDerivedStateFromProps) {
    const nextState = classInstance.getDerivedStateFromProps(
      nextProps,
      classInstance.state
    );
    if (nextState) {
      classInstance.state = nextState;
    }
  } else {
    // 更新组件状态
    classInstance.state = nextState;
  }
  if (willUpdate) {
    // 更新组件
    classInstance.forceUpdate();
  }
}
/**
 * 更新器，用于更新组件状态
 */
class Updater {
  constructor(classInstance) {
    this.classInstance = classInstance;
    // 待执行的状态队列
    this.pendingStates = [];
    // 保存setState第二次参数回调函数
    this.callbacks = [];
  }
  // 根据老状态和pendingStates计算新状态并返回
  getState() {
    const { classInstance, pendingStates } = this;
    // 组件实例上定义的状态
    let { state } = classInstance;
    pendingStates.forEach((nextState) => {
      if (typeof item === "function") {
        nextState = nextState();
      }
      // 新老状态合并
      state = { ...state, ...nextState };
    });
    // 执行setState第二次参数回调函数
    this.callbacks.forEach((callback) => callback());
    this.callbacks.length = 0;
    // 清空pendingStates
    pendingStates.length = 0;
    // 返回合并后的新状态
    return state;
  }
  updateComponent() {
    const { classInstance, pendingStates, nextProps } = this;
    if (pendingStates.length || nextProps) {
      shouldUpdate(classInstance, nextProps, this.getState());
    }
  }
  emitUpdate(nextProps) {
    this.nextProps = nextProps;
    // 批量更新将当前类实例存起来
    if (UpdateQueue.isBatchingUpdate) {
      UpdateQueue.updaters.push(this);
    } else {
      // 更新组件
      this.updateComponent();
    }
  }
  // 每调一次setState都执行，将state和回调函数往队列里push
  addState(partialState, callback) {
    this.pendingStates.push(partialState);
    // 因为setState第二个参数是可选的，所有做一层判断
    if (typeof callback === "function") {
      this.callbacks.push(callback);
    }
    // 触发更新逻辑
    this.emitUpdate();
  }
}
export class Component {
  // 类组件的标志
  static isReactComponent = true;
  constructor(props) {
    this.props = props;
    this.state = {};
    this.updater = new Updater(this);
  }
  setState(partialState, callback) {
    this.updater.addState(partialState, callback);
  }
  // 更新组件
  forceUpdate() {
    // 获取老的vdom
    const oldRenderVdom = this.oldRenderVdom;
    // 关键步骤 根据老的vdom找出老的真实dom
    const oldDOM = findDOM(oldRenderVdom);
    if (this.constructor.contextType) {
      this.context = this.constructor.contextType._currentValue;
    }
    // 获取新的vdom
    const newRenderVdom = this.render();
    const extraArgs = this.getSnapshotBeforeUpdate();
    // 比较两颗vdom，得到差异更新到真实dom上
    compareTwoVdom(oldDOM.parentNode, oldRenderVdom, newRenderVdom);
    // 更新老的vdom
    this.oldRenderVdom = newRenderVdom;
    // 执行componentDidUpdate钩子
    if (this.componentDidUpdate) {
      this.componentDidUpdate(this.props, this.state, extraArgs);
    }
  }
}
