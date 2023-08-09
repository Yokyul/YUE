/**
 * 获取模板对应的值
 * @param {Object} obj 所有模板对应的数据
 * @param {String} code 模板名（两种可能。title、item.title）
 * @returns 
 */
export function getValue(obj, code) {
  if (!obj) {
    return obj;
  }
  let codeList = code.split(".");
  let temp = obj;
  for (let i = 0; i < codeList.length; i++) {
    if (temp[codeList[i]]) {
      temp = temp[codeList[i]];
    } else {
      return undefined;
    }
  }
  return temp;
}

/**
 * 设置模板对应的值
 * @param {Object} obj 所有模板对应的数据。如：{ content: "", obj: {x: "", y: ""} }
 * @param {String} attr 模板名（两种可能。content、obj.x)
 * @param {String} value 要设置的新值
 * @returns 
 */
export function setValue(obj, attr, value) {
  if (!obj) {
    return obj;
  }
  let attrList = attr.split(".");
  let temp = obj;
  for (let i = 0; i < attrList.length - 1; i++) { //不看最后一项
    if (temp[attrList[i]]) {
      temp = temp[attrList[i]];
    } else {
      return;
    }
  }
  if (temp[attrList[attrList.length - 1]] != null) {
    temp[attrList[attrList.length - 1]] = value;
  }
}

/**
 * 合并 env 对象
 * @param {*} obj1 
 * @param {*} obj2 
 * @returns 
 */
export function mergeAttr(obj1, obj2) {
  if (obj1 == null) {
    return clone(obj2);
  }
  if (obj2 == null) {
    return clone(obj1);
  }
  let result = {};
  let obj1Attrs = Object.getOwnPropertyNames(obj1);
  for (let i = 0; i < obj1Attrs.length; i++) {
    result[obj1Attrs[i]] = obj1[obj1Attrs[i]];
  }
  let obj2Attrs = Object.getOwnPropertyNames(obj2);
  for (let i = 0; i < obj2Attrs.length; i++) {
    result[obj2Attrs[i]] = obj2[obj2Attrs[i]];
  }
  return result;
}

/**
 * 深克隆。【经典克隆算法】
 * @param {*} obj 
 * @returns 
 */
export function clone(obj) {
  if (obj instanceof Array) {
    return cloneArray(obj);
  } else if (obj instanceof Object) {
    return cloneObject(obj);
  } else {
    return obj;
  }
}

/**
 * 深克隆数组
 * @param {*} obj 
 * @returns 
 */
function cloneArray(obj) {
  let result = new Array(obj.length);
  for (let i = 0; i < obj.length; i++) {
    result[i] = clone(obj[i]);
  }
  return result;
}

/**
 * 深克隆对象
 * @param {*} obj 
 * @returns 
 */
function cloneObject(obj) {
  let result = {};
  let names = Object.getOwnPropertyNames(obj); //获取代理对象属性
  for (let i = 0; i < names.length; i++) {
    result[names[i]] = clone(obj[names[i]]);
  }
  return result;
}


export function getEnvAttr(vm, vnode) {
  let result = mergeAttr(vm._data, vnode.env);
  result = mergeAttr(result, vm._computed);
  return result;
}

export function execute(obj) {
  if (typeof obj == "function") {
    return obj();
  } else {
    return obj;
  }
}
