import { renderData } from "./render.js"; //渲染页面
import { rebuild } from "./mount.js";
import { getValue } from "../util/ObjectUtil.js";

/**
 * data 中的数据改变，页面要重新渲染。使用代理的方式监听属性修改
 * @param {Object} vm Yue对象
 * @param {Object|Array} obj 腰要代理的数据
 * @param {*} namespace 当前修改的是 data 选项的哪一个值。
 * @returns
 */
export function constructProxy(vm, obj, namespace) {
  let proxyObj = null;
  if (obj instanceof Array) {
    // 代理数组的每个元素
    proxyObj = new Array(obj.length);
    for (let i = 0; i < proxyObj.length; i++) {
      proxyObj[i] = constructProxy(vm, obj[i], namespace);
    }
    // 代理数组本身
    proxyObj = proxyArr(vm, obj, namespace);
  } else if (obj instanceof Object) {
    proxyObj = constructObjectProxy(vm, obj, namespace);
  } else {
    throw new Error("data option must be a object！！！！");
  }
  return proxyObj;
}

/**
 * 代理 object 类型的 data 数据
 * @param {*} vm
 * @param {*} obj
 * @param {*} namespace
 * @returns
 */
function constructObjectProxy(vm, obj, namespace) {
  let proxyObj = {};
  for (const prop in obj) {
    // 代理后，通过 this.data.xxx 获取响应式效果
    Object.defineProperty(proxyObj, prop, {
      configurable: true,
      set(value) {
        obj[prop] = value;
        renderData(vm, getNameSpace(namespace, prop));
      },
      get() {
        return obj[prop];
      },
    });

    // 代理后，通过 this.xxx 获取响应式效果
    Object.defineProperty(vm, prop, {
      configurable: true,
      set(value) {
        obj[prop] = value;
        let val = getValue(vm._data, getNameSpace(namespace, prop));
        if (val instanceof Array) {
          rebuild(vm, getNameSpace(namespace, prop));
          renderData(vm, getNameSpace(namespace, prop));
        } else {
          renderData(vm, getNameSpace(namespace, prop));
        }
      },
      get() {
        return obj[prop];
      },
    });

    // 递归
    if (obj[prop] instanceof Object) {
      proxyObj[prop] = constructProxy(vm, obj[prop], getNameSpace(namespace, prop));
    }
  }
  return proxyObj;
}

/**
 * 代理 array 类型的 data 数据
 * @param {*} vm
 * @param {*} arr
 * @param {*} namespace
 * @returns
 */
function proxyArr(vm, arr, namespace) {
  let obj = {
    eleType: "Array",
    toString() {
      let result = "";
      for (let i = 0; i < arr.length; i++) {
        result += arr[i] + ", ";
      }
      return result.substring(0, result.length - 2);
    },
    push() {},
    pop() {},
    shift() {},
    unshift() {},
  };
  defArrayFunc.call(vm, obj, "push", namespace, vm);
  defArrayFunc.call(vm, obj, "pop", namespace, vm);
  defArrayFunc.call(vm, obj, "shift", namespace, vm);
  defArrayFunc.call(vm, obj, "unshift", namespace, vm);
  arr.__proto__ = obj;
  return arr;
}

const arrayProto = Array.prototype; // 获取Array的原型
function defArrayFunc(obj, func, namespace, vm) {
  Object.defineProperty(obj, func, {
    enumerable: true,
    configurable: true,
    value(...args) {
      let original = arrayProto[func];
      const result = original.apply(this, args);
      rebuild(vm, getNameSpace(namespace, ""));
      renderData(vm, getNameSpace(namespace, ""));
      return result;
    },
  });
}



/**
 * 获取当前修改的是 data 选项的哪一个值。对象第一层：content；第二层：obj.x；...
 * @param {*} nowNameSpace
 * @param {*} nowProp
 * @returns
 */
function getNameSpace(nowNameSpace, nowProp) {
  if (nowNameSpace == null || nowNameSpace == "") {
    return nowProp;
  } else if (nowProp == null || nowProp == "") {
    return nowNameSpace;
  } else {
    return nowNameSpace + "." + nowProp;
  }
}