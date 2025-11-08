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

      // Log 401 errors for debugging auth issues
      if (error.response.status === 401) {
        console.debug('401 Unauthorized response:', {
          endpoint: error.config?.url,
          requestData: error.config?.data,
          responseData: error.response.data,
          message: error.response.data?.error || error.response.data?.message,
        })
      }

      return Promise.reject(new Error(message))
    } else if (error.request) {
      return Promise.reject(new Error('No response from server'))
    } else {
      return Promise.reject(error)
    }
  }
)

export default api
