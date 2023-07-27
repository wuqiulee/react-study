import { findDOM, compareTwoVdom } from "./react-dom";
/**
 * 是否更新组件
 * @param {*} classInstance
 * @param {*} nextState
 */
function shouldUpdate(classInstance, nextState) {
  // 更新组件状态
  classInstance.state = nextState;
  // 更新组件
  classInstance.forceUpdate();
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
    const { classInstance, pendingStates } = this;
    if (pendingStates.length) {
      shouldUpdate(classInstance, this.getState());
    }
  }
  emitUpdate() {
    // 更新组件
    this.updateComponent();
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
    // 获取新的vdom
    const newRenderVdom = this.render();
    console.log(oldDOM.parentNode, "oldDOM", oldRenderVdom);
    // 比较两颗vdom，得到差异更新到真实dom上
    compareTwoVdom(oldDOM.parentNode, oldRenderVdom, newRenderVdom);
    // 更新老的vdom
    this.oldRenderVdom = newRenderVdom;
  }
}
