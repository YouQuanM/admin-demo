import HttpRequest from '@/libs/axios'
import config from '@/api/api.config.js'
const baseUrl = process.env.NODE_ENV === 'development' ? config.develop.baseURL : config.production.baseURL

const axios = new HttpRequest(baseUrl)
export default axios
