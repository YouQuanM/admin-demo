// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import iView from 'iview'
import config from '@/api/api.config.js'
import importDirective from '@/directive'
// import installPlugin from '@/plugin'
import './index.less'
import 'iview/dist/styles/iview.css'
import '@/assets/icons/iconfont.css'
import TreeTable from 'tree-table-vue'
import Axios from 'axios';
// 实际打包时应该不引入mock
/* eslint-disable */
// if (process.env.NODE_ENV !== 'production') require('@/mock')

// Vue.use(iView, {
//   i18n: (key, value) => i18n.t(key, value)
// })
Vue.use(iView)
Vue.use(TreeTable)
/**
 * @description 注册admin内置插件
 */
// installPlugin(Vue)
/**
 * @description 生产环境关掉提示
 */
Vue.config.productionTip = false
/**
 * @description 全局注册应用配置
 */
Vue.prototype.$config = config
/**
 * 注册指令
 */
importDirective(Vue)
// 让axios携带cooike
Axios.defaults.withCredentials = true

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  // i18n,
  store,
  render: h => h(App)
})
