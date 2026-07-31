import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginForms } from './components/Login'
import { Profile } from './components/User/Profile'
import { Navbar } from './components/Navbar'
import { MySubGreddiit } from './components/MySubGreddiits/MySubgreddiit'
import { MySubUsers } from './components/MySubGreddiits/MySubUsers'
import { MySubRequests } from './components/MySubGreddiits/MySubRequests'
import { MySubStats } from './components/MySubGreddiits/MySubStats'
import { MySubReports } from './components/MySubGreddiits/MySubReports'
import { AllSubGreddiits } from './components/AllSubGreddiits/AllSubGreddiits'
import { AllSubGreddiitPage } from './components/AllSubGreddiits/AllSubGreddiitPage'
import { SavedPosts } from './components/User/SavedPosts'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    background: {
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paper: 'rgba(255, 255, 255, 0.95)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
  },
})

const App = () => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('loggedUser'))
    } catch {
      window.localStorage.removeItem('loggedUser')
      return null
    }
  })
  const [load, setLoad] = useState(true)

  useEffect(() => {
    setLoad(true)
    setLoad(false)
  }, [])

  const handleLogout = () => setUser(null)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundAttachment: 'fixed',
      }}>
        {
          load ?
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '100vh',
              flexDirection: 'column'
            }}>
              <CircularProgress size={60} thickness={4} />
              <Box sx={{ mt: 2, color: 'white', fontSize: '1.2rem' }}>Loading SocialHub...</Box>
            </Box> :
            <div>
              <Navbar user={user} onLogout={handleLogout} />
              <Routes>
                <Route exact path='/profile' element={user ? <Profile /> : <Navigate replace to='/signin' />} />
                <Route exact path='/signin' element={user ? <Navigate replace to='/home' /> : <LoginForms onLogin={setUser} />} />
                <Route exact path='/mysubgreddiits' element={user ? <MySubGreddiit /> : <Navigate replace to='/signin' />} />
                <Route exact path='/mysubgreddiits/:id' element={user ? <Navigate replace to='users' /> : <Navigate replace to='/signin' />} />
                <Route exact path='/mysubgreddiits/:id/users' element={user ? <MySubUsers /> : <Navigate replace to='/signin' />} />
                <Route exact path='/mysubgreddiits/:id/requests' element={user ? <MySubRequests /> : <Navigate replace to='/signin' />} />
                <Route exact path='/mysubgreddiits/:id/stats' element={user ? <MySubStats /> : <Navigate replace to='/signin' />} />
                <Route exact path='/mysubgreddiits/:id/reports' element={user ? <MySubReports /> : <Navigate replace to='/signin' />} />
                <Route exact path='/allsubgreddiits' element={user ? <AllSubGreddiits /> : <Navigate replace to='/signin' />} />
                <Route exact path='/home' element={user ? <AllSubGreddiits /> : <Navigate replace to='/signin' />} />
                <Route exact path='/allsubgreddiits/:id' element={user ? <AllSubGreddiitPage /> : <Navigate replace to='/signin' />} />
                <Route exact path='/savedposts' element={user ? <SavedPosts /> : <Navigate replace to='/signin' />} />
                <Route path='*' element={user ? <Navigate replace to='/home' /> : <Navigate replace to='/signin' />} />
              </Routes>
            </div>
        }
      </Box>
    </ThemeProvider>
  )
}

export default App
