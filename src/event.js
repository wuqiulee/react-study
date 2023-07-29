import { UpdateQueue } from "./component";
/**
 * 实现事件委托到document
 * @param {*} dom
 * @param {*} eventType 事件类型
 * @param {*} handler 事件处理函数
 */
export function addEvent(dom, eventType, handler) {
  let store = null;
  if (dom.store) {
    store = dom.store;
  } else {
    dom.store = {};
    store = dom.store;
  }
  store[eventType] = handler;
  // 防止同一事件重复绑定
  if (!document[eventType]) {
    // 所有事件绑定到document上
    document[eventType] = dispatchEvent;
  }
}

function dispatchEvent(event) {
  let { target, type } = event;
  const eventType = `on${type}`;
  // 开启批量更新
  UpdateQueue.isBatchingUpdate = true;
  // 创建合成事件
  const syntheticEvent = createSyntheticEvent(event);
  // 模拟事件冒泡
  while (target) {
    const { store } = target;
    // 取出事件处理函数
    const handler = store && store[eventType];
    // 执行事件处理函数
    handler && handler.call(target, syntheticEvent);
    target = target.parentNode;
  }
  // 事件处理函数执行完后关闭批量更新
  UpdateQueue.isBatchingUpdate = false;
  UpdateQueue.batchUpdate();
}

/**
 * 创建合成事件
 * @param {*} event
 * @returns 返回经过浏览器兼容处理的合成事件
 */
function createSyntheticEvent(event) {
  const syntheticEvent = {};
  for (let key in event) {
    syntheticEvent[key] = event;
  }
  return syntheticEvent;
}
