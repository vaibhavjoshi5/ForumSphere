import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import axios from 'axios'
import App from './App'

axios.defaults.baseURL = process.env.REACT_APP_API_URL || ''
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && window.localStorage.getItem('loggedUser')) {
      window.localStorage.removeItem('loggedUser')
      window.location.assign('/signin')
    }
    return Promise.reject(error)
  }
)

ReactDOM.createRoot(document.getElementById('root')).render(<Router><App /></Router>)
