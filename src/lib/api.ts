import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies/session authentication
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add custom headers here if needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message = error.response.data?.message || error.message

      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        // Redirect to login or handle unauthorized access
        window.location.href = '/login'
      }

      return Promise.reject(new Error(message))
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject(new Error('No response from server'))
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject(error)
    }
  }
)

export default api
