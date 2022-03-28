import { initMixin } from "./init"; //向vue原型链上添加$data、$props、$set、$delete、$watch
import { stateMixin } from "./state";  //定义 事件相关的方法$on、$once、$off、$emit
import { renderMixin } from "./render";  //渲染$nextTick、_render
import { eventsMixin } from "./events";  //事件_update
import { lifecycleMixin } from "./lifecycle";  //生命周期
import { warn } from "../util/index";  //控制台抛出红色警告
//Vue 实例的入口文件，包括 Vue 构造函数的定义、各个实例方法的初始化
//vue构造函数
function Vue(options) {
  //每一个vue文件抛出一个vue的实例对象
  console.log("入口文件初始化实例", options);
  //非生产环境且不是vue实例就会警告
  if (process.env.NODE_ENV !== "production" && !(this instanceof Vue)) {
    warn("Vue is a constructor and should be called with the `new` keyword");
  }
  // 定义 Vue.prototype._init 方法
  this._init(options);
}

// 定义 Vue.prototype._init 
initMixin(Vue);
/**
 * 定义：
 *   Vue.prototype.$data
 *   Vue.prototype.$props
 *   Vue.prototype.$set
 *   Vue.prototype.$delete
 *   Vue.prototype.$watch
 */
stateMixin(Vue);
/**
 * 定义 事件相关的方法：
 *   Vue.prototype.$on
 *   Vue.prototype.$once
 *   Vue.prototype.$off
 *   Vue.prototype.$emit
 */
eventsMixin(Vue);
/**
 * 定义：
 *   Vue.prototype._update
 *   Vue.prototype.$forceUpdate
 *   Vue.prototype.$destroy
 */
lifecycleMixin(Vue);
/**
 * 执行 installRenderHelpers，在 Vue.prototype 对象上安装运行时便利程序
 * 
 * 定义：
 *   Vue.prototype.$nextTick
 *   Vue.prototype._render
 */
renderMixin(Vue);

export default Vue;
