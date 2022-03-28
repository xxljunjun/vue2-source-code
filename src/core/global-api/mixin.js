/* @flow */
/**
 * 定义 Vue.mixin，负责全局混入选项，影响之后所有创建的 Vue 实例，这些实例会合并全局混入的选项
 * @param {*} mixin Vue 配置对象
 * @returns 返回 Vue 实例
 */
import { mergeOptions } from '../util/index'

export function initMixin (Vue: GlobalAPI) {
  // 在 Vue 的默认配置项上合并 mixin 对象
  Vue.mixin = function (mixin: Object) {
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
