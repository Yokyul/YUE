// 虚拟节点
export default class VNode {
  constructor(
    tag, //标签类型。如：DIV, SPAN, #TEXT
    elm, //对应的真实节点
    children, //当前虚拟节点的子节点
    text, //当前虚拟节点中的文本
    data, //VNodeData。（保留字段）
    parent, //父级VNode节点
    nodeType, //节点类型
    key
  ) {
    this.tag = tag;
    this.elm = elm;
    this.children = children;
    this.text = text;
    this.data = data;
    this.parent = parent;
    this.nodeType = nodeType;
    this.key = key;
    this.env = {}; //当前节点的环境变量。如使用 v-for 的div，其子节点的数据是属于 div 的。子节点中的 env 就指向 div
    this.instructions = null; //当前节点的指令
    this.template = []; //当前节点涉及的模板
  }
}
