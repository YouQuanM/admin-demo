import axios from 'axios'

let instance = axios.create({
  baseURL: '',
  timeout: 10000
})

// 请求拦截
instance.interceptors.request.use(config => {
  config.headers.token = sessionStorage.getItem('token') ? sessionStorage.getItem('token') : ''
  return config
}, err => {
  return Promise.reject(err)
})

// 响应拦截
instance.interceptors.response.use(response => {
  // 响应成功
  if (response.data.status !== 0) {
    Message.warning(response.data.msg)
    return Promise.reject(response)
  } else {
    return response
  }
}, err => {
  // 响应失败错误码
  console.log(err)
  if (err.response && err.response.status === 403) {
    Message.warning('登录失败，请重新登录')
    sessionStorage.clear()
    Cookie.setItem('username', '', -1)
    window.location.href = 'https://vms.dankegongyu.com/#/login'
  }
  return Promise.reject(err)
})

Vue.prototype.$axios = instance
