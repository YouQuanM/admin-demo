export default {
  /**
   * @description 配置显示在浏览器标签的title
   */
  title: 'demo',
  /**
   * @description token在Cookie中存储的天数，默认1天
   */
  cookieExpires: 1,
  /**
   * @description 默认打开的首页的路由name值，默认为home
   */
  homeName: 'home',
  /**
   * @description 需要加载的插件
   */
  plugin: {
    'error-store': {
      showInHeader: true, // 设为false后不会在顶部显示错误日志徽标
      developmentOff: true // 设为true后在开发环境不会收集错误信息，方便开发中排查错误
    }
  },
  develop: {
    baseURL: 'http://172.16.31.86:8181/'
  },
  production: {
    baseURL: ''
  },
  test: {
    baseURL: ''
  }
}
