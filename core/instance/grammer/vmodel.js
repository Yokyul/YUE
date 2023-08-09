import { setValue } from "../../util/ObjectUtil.js";

/**
 * 监听输入框的 change 事件，一旦内容改变就修改页面上的值
 * @param {*} vm 
 * @param {*} elm 
 * @param {*} data 
 */
export function vmodel(vm, elm, data) {
  elm.onchange = function (event) {
    setValue(vm._data, data, elm.value);
  };
}
