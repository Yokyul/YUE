import { constructProxy } from "./proxy.js"; //代理 data 选项数据
import { mount } from "./mount.js"; //挂载虚拟节点到真实节点

let uid = 0;

export function initMixin(Yue) {
  Yue.prototype._init = function (options) {
    const vm = this;
    vm.uid = uid++; //唯一id
    vm._isVue = true; //是否为 vue 对象

    // 初始化 data
    if (options && options.data) {
      vm._data = constructProxy(vm, options.data, "");
    }

    // 初始化 created 钩子
    if (options && options.created) {
      vm.created = options.created;
    }

    // 初始化 methods
    if (options && options.methods) {
      vm._methods = options.methods;
      for (let temp in options.methods) {
        vm[temp] = options.methods[temp];
      }
    }

    // 初始化 computed
    if (options && options.computed) {
      vm._computed = options.computed;
      for (let temp in options.computed) {
        vm[temp] = options.computed[temp];
      }
    }

    // 初始化 el 并挂载
    if (options && options.el) {
      let rootDom = document.getElementById(options.el);
      mount(vm, rootDom);
    }
  };
}
