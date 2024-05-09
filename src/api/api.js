// api.js

import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL, // 设置基础URL
  timeout: 10000, // 设置请求超时时间
});
console.log(instance);
// 请求拦截器
instance.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么，比如添加 token
    // config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    // 对响应数据做些什么
    return response.data;
  },
  error => {
    // 对响应错误做些什么
    return Promise.reject(error);
  }
);

export default instance;