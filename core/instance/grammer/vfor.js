import VNode from "../../vdom/vnode.js";
import { getValue } from "../../util/ObjectUtil.js";

/**
 * 
 * @param {*} vm 
 * @param {String} instructions v-for 的模板。如：(key) in list
 * @param {*} elm 
 * @param {*} parent 
 * @returns 
 */
export function vforInit(vm, instructions, elm, parent) {
  let virtualNode = new VNode(
    elm.nodeName,
    elm,
    [],
    "",
    getVirtualNodeData(instructions)[2],
    parent,
    0,
    ""
  );
  virtualNode.instructions = instructions;
  parent.elm.removeChild(elm);
  parent.elm.appendChild(document.createTextNode("")); //由于删除原来带 v-for 的节点会将后面的文本节点一起删除，所以补一个
  let resultSet = analysisInstructions(vm, instructions, elm, parent);
  return virtualNode;
}

/**
 * 将 v-for 的模板解析为数组。如：(key) in list => ["(key)", "in", "list"]
 * @param {String} instructions 
 * @returns
 */
function getVirtualNodeData(instructions) {
  let insSet = instructions.trim().split(" ");
  if (insSet.length != 3 || (insSet[1] != "in" && insSet[1] != "of")) {
    throw new Error("error");
  }
  return insSet;
}

/**
 * 分析指令
 * @param {*} vm 
 * @param {String} instructions (key) in list
 * @param {*} elm 
 * @param {*} parent 
 * @returns 
 */
function analysisInstructions(vm, instructions, elm, parent) {
  let insSet = getVirtualNodeData(instructions);
  let dataSet = getValue(vm._data, insSet[2]);
  if (!dataSet) {
    throw new Error("error");
  }
  let resultSet = [];
  for (let i = 0; i < dataSet.length; i++) {
    let tempDom = document.createElement(elm.nodeName);
    tempDom.innerHTML = elm.innerHTML;
    let env = analysisKV(insSet[0], dataSet[i], i);
    tempDom.setAttribute("env", JSON.stringify(env));
    parent.elm.appendChild(tempDom);
    resultSet.push(tempDom);
  }
  return resultSet;
}


/**
 * 获取生成的每一个元素用到的模板数据。如：{ key: "", index:  }
 * @param {*} instructions 如: (key, index)
 * @param {*} value 
 * @param {*} index 
 * @returns 
 */
function analysisKV(instructions, value, index) {
  if (/([a-zA-z0-9-_$]+)/.test(instructions)) {
    //带括号的形式
    instructions = instructions.trim();
    instructions = instructions.substring(1, instructions.length - 1);
  }
  let keys = instructions.split(",");
  if (keys.length == 0) {
    throw new Error("error");
  }
  let obj = {};
  if (keys.length == 1) {
    obj[keys[0].trim()] = value;
  }
  if (keys.length == 2) {
    obj[keys[0].trim()] = index;
  }
  return obj;
}
