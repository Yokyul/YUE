# YUE

手写Vue2的部分功能

## 目录介绍

```js
core: Yue 核心代码
├── instance
    ├── grammer //指令语法
        ├── index.js
        ├── vbind.js
        ├── vfor.js
        ├── vmodel.js
        └── von.js
    ├── index.js
    ├── init.js //初始化数据
    ├── mount.js //挂载
    ├── proxy.js //数据代理
    ├── render.js //渲染
```


## 思路

1. **初始化阶段**

首先根据 option 初始化
```js
1. 初始化 data，用到了递归算法
- 将 option.data 传进来的数据使用 defineProperty 进行代理。分 object 和 array

2. 挂载元素，用到了深度优先搜索。
- 生成当前实例的虚拟节点树，放到 vue 实例下的 _vnode 属性上
（mount.js 的 constructVNode()）
- 为渲染做准备工作。如：准备好两个 map 数据。存放每一个 vnode 包含的模板数据；每一个模板数据被那些节点用到。
（render.js 的 prepareRender()）
```

然后根据虚拟节点树渲染真实数据
```js
1. 将虚拟节点树上的模板渲染成真实数据。只看文本节点，不是找子节点下的文本节点
（render.js 的 renderNode()）
```

2. **数据更新阶段**

修改 data 中的值，页面要重新渲染。
（proxy.js 的 set）
> 截止以上两个阶段，只考虑模板在**文本节点**的情况。接下来考虑模板在**属性节点**的情况



3. **v-model 属性**

- 初始化阶段

```js
1. 挂载元素
- 生成当前实例的虚拟节点树。（不仅考虑文本节点，也要考虑属性节点的情况）
  即：分析模板是否有 v-model 属性，有的话将 v-model 对应的值在 `vm._data` 中改变
- 为渲染做准备工作。不仅考虑文本节点，也要考虑 input 的属性节点

2. 将虚拟节点树上的模板渲染成真实数据。（不仅考虑文本节点，也要考虑属性节点的情况）
```

- 数据更新阶段

无修改，已经监听所有 data 数据


> 后续添加....