### 学习 vue 源码

```
npm install

```

```js
{
  "scripts": {
    "dev": "rollup -w -c scripts/config.js --sourcemap --environment TARGET:web-full-dev"
  }
}
```

```js
//开启之后修改文件才生效
npm run dev
```

### dist 文件中的 js 文件

|                               | UMD                | CommonJS              | ES Module          |
| ----------------------------- | ------------------ | --------------------- | ------------------ |
| **Full**                      | vue.js             | vue.common.js         | vue.esm.js         |
| **Runtime-only**              | vue.runtime.js     | vue.runtime.common.js | vue.runtime.esm.js |
| **Full (production)**         | vue.min.js         |                       |                    |
| **Runtime-only (production)** | vue.runtime.min.js |                       |                    |

### 源代码目录

```js
/*
  主要的目录文件
    benchmarks：性能、基准测试
    dist：构建打包的输出目录
    examples:案例目录
    flow：flow 语法的类型声明
    packages： 一些额外的包
    scripts：所有的配置文件的存放位置，比如 rollup 的配置文件
    src：vue 源码目录
    test:测试目录
    types:TS 类型声明

    .circleci:
    .github:
    node_modules:
*/
```

```
├── benchmarks                  性能、基准测试
├── dist                        构建打包的输出目录
├── examples                    案例目录
├── flow                        flow 语法的类型声明
├── packages                    一些额外的包，比如：负责服务端渲染的包 vue-server-renderer、配合 vue-loader 使用的的 vue-template-compiler，还有 weex 相关的
│   ├── vue-server-renderer
│   ├── vue-template-compiler
│   ├── weex-template-compiler
│   └── weex-vue-framework
├── scripts                     所有的配置文件的存放位置，比如 rollup 的配置文件
├── src                         vue 源码目录
│   ├── compiler                编译器
│   ├── core                    运行时的核心包
│   │   ├── components          全局组件，比如 keep-alive
│   │   ├── config.js           一些默认配置项
│   │   ├── global-api          全局 API，比如熟悉的：Vue.use()、Vue.component() 等
│   │   ├── instance            Vue 实例相关的，比如 Vue 构造函数就在这个目录下
│   │   ├── observer            响应式原理
│   │   ├── util                工具方法
│   │   └── vdom                虚拟 DOM 相关，比如熟悉的 patch 算法就在这儿
│   ├── platforms               平台相关的编译器代码
│   │   ├── web
│   │   └── weex
│   ├── server                  服务端渲染相关
├── test                        测试目录
├── types                       TS 类型声明

```

### Vue 的初始化过程（new Vue(options)）都做了什么？
+ 找到 vue 的入口文件:通过debbuge的方法找到/src/core/instance/index.js入口文件
```js
/*
Vue 的初始化过程（new Vue(options)）都做了什么？
  ==>处理组件配置项
  ==>初始化根组件时进行了选项合并操作，将全局配置合并到根组件的局部配置上
  ==>初始化每个子组件时做了一些性能优化，将组件配置对象上的一些深层次属性放到 vm.$options 选项中，以提高代码的执行效率
  ==>初始化组件实例的关系属性，比如 $parent、$children、$root、$refs 等
  ==>处理自定义事件
  ==>调用 beforeCreate 钩子函数
  ==>初始化组件的 inject 配置项，得到 ret[key] = val 形式的配置对象，然后对该配置对象进行响应式处理，并代理每个 key 到 vm 实例上
  ==>数据响应式，处理 props、methods、data、computed、watch 等选项
  ==>解析组件配置项上的 provide 对象，将其挂载到 vm._provided 属性上
  ==>调用 created 钩子函数
  ==>如果发现配置项上有 el 选项，则自动调用 $mount 方法，也就是说有了 el 选项，就不需要再手动调用 $mount 方法，反之，没提供 el 选项则必须调用 $mount
  ==>接下来则进入挂载阶段
*/
```
### Vue 响应式原理是怎么实现的？
```js
/*
  一、响应式的核心是通过 Object.defineProperty 拦截对数据的访问和设置
  二、响应式的数据分为两类：
    + 对象，循环遍历对象的所有属性，为每个属性设置 getter、setter，以达到拦截访问和设置的目的，如果属性值依旧为对象，则递归为属性值上的每个 key 设置 getter、setter
        ==>访问数据时（obj.key)进行依赖收集，在 dep 中存储相关的 watcher
        ==>设置数据时由 dep 通知相关的 watcher 去更新
    + 数组，增强数组的那 7 个可以更改自身的原型方法，然后拦截对这些方法的操作
        ==>添加新数据时进行响应式处理，然后由 dep 通知 watcher 去更新
        ==>删除数据时，也要由 dep 通知 watcher 去更新
*/

```
### Vue 的异步更新机制是如何实现的？
```js
/*
Vue 的异步更新机制的核心是利用了浏览器的异步任务队列来实现的，首选微任务队列，宏任务队列次之。

当响应式数据更新后，会调用 dep.notify 方法，通知 dep 中收集的 watcher 去执行 update 方法，watcher.update 将 watcher 自己放入一个 watcher 队列（全局的 queue 数组）。

然后通过 nextTick 方法将一个刷新 watcher 队列的方法（flushSchedulerQueue）放入一个全局的 callbacks 数组中。
如果此时浏览器的异步任务队列中没有一个叫 flushCallbacks 的函数，则执行 timerFunc 函数，将 flushCallbacks 函数放入异步任务队列。如果异步任务队列中已经存在 flushCallbacks 函数，等待其执行完成以后再放入下一个 flushCallbacks 函数。

flushCallbacks 函数负责执行 callbacks 数组中的所有 flushSchedulerQueue 函数。

flushSchedulerQueue 函数负责刷新 watcher 队列，即执行 queue 数组中每一个 watcher 的 run 方法，从而进入更新阶段，比如执行组件更新函数或者执行用户 watch 的回调函数。

完整的执行过程其实就是今天源码阅读的过程。
*/

```
### Vue 的 nextTick API 是如何实现的？
```js
// 将传递的回调函数用 try catch 包裹然后放入 callbacks 数组
// 执行 timerFunc 函数，在浏览器的异步任务队列放入一个刷新 callbacks 数组的函数
```
### Vue中的api
```js
/*
  Vue.use
  Vue.mixin
  Vue.component
  Vue.filter
  Vue.directive
  VUe.extend
  Vue.set
  Vue.delete
  Vue.nextTick
*/
```
### Vue中的实例方法的实现原理
```js
/*
  vm.$set
  vm.$delete
  vm.$watch
  vm.$on
  vm.$emit
  vm.$off
  vm.$once
  vm._update
  vm.$forceUpdate
  vm.$destroy
  vm.$nextTick
  vm._render
*/

```
### Vue中的生命周期钩子 Hook Event 
+ 什么是 Hook Event ？
```js
//Hook Event 是 Vue 的自定义事件结合生命周期钩子实现的一种从组件外部为组件注入额外生命周期方法的功能。

// 比如：我们知道，Vue 的生命周期函数是通过一个叫 callHook 的方法来执行的
```


