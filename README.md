## vue-cli3.0

## 总结iview-admin src文件

1. **api**
   - api.config.js ：浏览器标题，cookie配置，首页路由配置，加载插件配置，环境Url配置
   - data.js：主要做对日志，错误信息等数据的存储
   - user.js：主要用作用户登录（集成了sso登录就不需要了），获取用户信息，登出，消息通知等
2. **assets**
   - 静态文件
3. **components**
   - main：外层框架，包括侧边栏菜单，顶部菜单
4. **directive**
   - 注册方法（我也没看懂干啥用的。。。）
5. **libs**
   - api.request.js：基础的axios，只做了环境判断
   - axios-http.js：封装了axios响应拦截器
   - tools.js：工具方法
   - util.js：方法库，包含了通过routers生成目录菜单的方法
6. **router**
7. **store**
   - app.js：状态管理，实现面包屑导航，tab标签的开启和关闭，还有一些errorlog等方法
   - user.js：保存用户信息，登录状态，未读消息等
8. **view**

**总结一下他原有组件的功能**：

1. common-icon 侧边目录的icon
2. cropper 实现突破剪裁上传（暂时不需要）
3. info-card 卡片组件 左侧icon右侧自定义（暂时不需要）
4. count-to 计数器动画效果 （暂时不需要）
5. drag-drawer 可拖动抽屉组件 （暂时不需要）
6. drag-list 可拖动列表组件 （暂时不需要）
7. markdown md文件编辑器 （暂时不需要）
8. Icon 
9. editor 编辑器基础组件 （暂时不需要）
10. split-pane 分割面板 （暂时不需要）
11. Paste-editor 对粘贴数据进行格式化的textarea （暂时不需要）
12. Parent-view 没看懂干啥用
13. Table

## npm

npm i

npm run dev

npm run build-dev

npm run build-pro