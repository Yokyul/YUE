import { initMixin } from "./init.js";
import { initMount } from "./mount.js";
import { renderMixin } from "./render.js";

initMixin(Yue); //vue原型提供 _init 方法
initMount(Yue); //vue原型提供 $mount 方法
renderMixin(Yue); //vue原型提供 _render 方法

function Yue(options) {
  console.log(this);
  this._init(options); //初始化配置
  if (this.created != null) {
    this.created.call(this);
  }
  this._render();
}

export default Yue;
