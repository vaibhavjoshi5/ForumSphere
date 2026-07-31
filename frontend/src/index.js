import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import axios from 'axios'
import App from './App'

axios.defaults.baseURL = process.env.REACT_APP_API_URL || ''

ReactDOM.createRoot(document.getElementById('root')).render(<Router><App /></Router>)
