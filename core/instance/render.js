import { getValue } from "../util/ObjectUtil.js";

let template2Vnode = new Map();
let vnode2Template = new Map();

/**
 * 为渲染准备数据 template2Vnode、vnode2Template
 * @param {*} vm 
 * @param {*} vnode 
 * @returns 
 */
export function prepareRender(vm, vnode) {
  if (vnode == null) {
    return;
  }
  // 文本节点
  if (vnode.nodeType == 3) {
    analysisTemplateString(vnode);
  }
  // 元素节点
  if (vnode.nodeType == 1) {
    analysisAttr(vnode);
  }
  // 代表无意义的虚拟节点
  if (vnode.nodeType == 0) {
    setTemplate2Vnode("{{" + vnode.data + "}}", vnode);
    setVnode2Template("{{" + vnode.data + "}}", vnode);
  }

  for (let i = 0; i < vnode.children.length; i++) {
    prepareRender(vm, vnode.children[i]);
  }
}

/**
 * 分析文本节点的模板字符串
 * @param {Object} vnode 虚拟节点（文本类型）
 */
function analysisTemplateString(vnode) {
  let templateStrList = vnode.text.match(/{{[a-zA-Z0-9_.]+}}/g);
  for (let i = 0; templateStrList && i < templateStrList.length; i++) {
    setTemplate2Vnode(templateStrList[i], vnode);
    setVnode2Template(templateStrList[i], vnode);
  }
}

/**
 * 分析存在 v-model 属性的元素节点的模板字符串
 * @param {*} vm 
 * @param {*} vnode 
 * @returns 
 */
function analysisAttr(vnode) {
  let attrNames = vnode.elm.getAttributeNames();
  if (attrNames.indexOf("v-model") > -1) {
    setTemplate2Vnode("{{" + vnode.elm.getAttribute("v-model") + "}}", vnode);
    setVnode2Template("{{" + vnode.elm.getAttribute("v-model") + "}}", vnode);
  }
}

/**
 * 每个模板对应的 vnode。如：content 对应哪些节点（页面用几次就有几个节点）
 * @param {*} template 
 * @param {*} vnode 
 */
function setTemplate2Vnode(template, vnode) {
  let templateSet = template2Vnode.get(getTemplateName(template));
  if (templateSet) {
    templateSet.push(vnode);
  } else {
    template2Vnode.set(getTemplateName(template), [vnode]);
  }
}

/**
 * 每个 vnode 对应的模板。如：div 元素用了哪些模板字段（可能 content1 content2）
 * @param {*} template 
 * @param {*} vnode 
 */
function setVnode2Template(template, vnode) {
  let vnodeSet = vnode2Template.get(vnode);
  if (vnodeSet) {
    vnodeSet.push(getTemplateName(template));
  } else {
    vnode2Template.set(vnode, [getTemplateName(template)]);
  }
}

/**
 * 去除模板字符串的 {{}}
 * @param {String} text 模板字符串。如 {{content}}
 * @returns 如：content
 */
function getTemplateName(text) {
  return text.substring(2, text.length - 2);
}


/**
 * 根据准备好的数据开始渲染（即修改真实节点的 nodeValue）
 * @param {*} Yue 
 */
export function renderMixin(Yue) {
  Yue.prototype._render = function () {
    renderNode(this, this._vnode);
  };
}

/**
 * 修改 data 中的值，页面要重新渲染
 * @param {*} vm 
 * @param {*} data 
 */
export function renderData(vm, data) {
  let vnodes = template2Vnode.get(data);
  if (vnodes != null) {
    for (let i = 0; i < vnodes.length; i++) {
      renderNode(vm, vnodes[i]);
    }
  }
}

/**
 * 将虚拟节点树上的模板渲染成真实数据。只看文本节点，不是找子节点下的文本节点
 * @param {Object} vm
 * @param {Object} vnode
 */
export function renderNode(vm, vnode) {
  if (vnode.nodeType == 3) {
    let templates = vnode2Template.get(vnode);
    if (templates) {
      let result = vnode.text;
      for (let i = 0; i < templates.length; i++) {
        let templateValue = getTemplateValue([vm._data, vnode.env], templates[i]);
        if (templateValue) {
          result = result.replace("{{" + templates[i] + "}}", templateValue);
        }
      }
      vnode.elm.nodeValue = result;
    }
  } else if (vnode.nodeType == 1 && vnode.tag == "INPUT") {
    let templates = vnode2Template.get(vnode);
    if (templates) {
      for (let i = 0; i < templates.length; i++) {
        let templateValue = getTemplateValue([vm._data, vnode.env], templates[i]);
        if (templateValue) {
          vnode.elm.value = templateValue;
        }
      }
    }
  } else {
    for (let i = 0; i < vnode.children.length; i++) {
      renderNode(vm, vnode.children[i]);
    }
  }
}

/**
 * 根据模板（如：{{ content }}）找到对应的数据（如：内容）
 * @param {Array} objs 两种取值。vm._data 或 vnode.env，分别代表模板的值在 data 定义了，模板的值不是 data 上的。如 v-for 子节点的数据是 父节点提供的
 * @param {String} templateName 模板名
 * @returns
 */
function getTemplateValue(objs, templateName) {
  for (let i = 0; i < objs.length; i++) {
    let temp = getValue(objs[i], templateName);
    if (temp != null) {
      return temp;
    }
  }
  return null;
}


export function getVNodeByTemplate(template) {
  return template2Vnode.get(template);
}

export function clearMap() {
  template2Vnode.clear();
  vnode2Template.clear();
}


