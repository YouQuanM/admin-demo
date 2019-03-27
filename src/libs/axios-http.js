import axios from 'axios'
import config from '@/config'
import { Message } from 'iview'
const baseUrl = process.env.NODE_ENV === 'development' ? config.baseUrl.dev : config.baseUrl.pro

let instance = axios.create({
  baseURL: baseUrl,
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
  if (response.data.code !== 1) {
    console.log('响应成功，返回错误码')
    Message.warning(response.data.msg)
  }
  return response
}, err => {
  // 响应失败错误码
  if (err.response && err.response.code === 403) {
    Message.warning('登录失败，请重新登录')
    sessionStorage.clear()
    Cookie.setItem('username', '', -1)
    window.location.href = 'https://vms.dankegongyu.com/#/login'
  } else {
    Message.warning('服务器异常')
  }
  return Promise.reject(err)
})

export default instance
