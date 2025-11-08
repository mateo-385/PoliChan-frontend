import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    console.log(
      'Request interceptor - token present:',
      !!token,
      'token:',
      token?.substring(0, 20) + '...'
    )
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || error.message

      return Promise.reject(new Error(message))
    } else if (error.request) {
      return Promise.reject(new Error('No response from server'))
    } else {
      return Promise.reject(error)
    }
  }
)

export default api
