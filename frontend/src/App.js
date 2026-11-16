import { useState } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { LoginForms } from './components/Login'
import { Profile } from './components/User/Profile'
import { Navbar, WorkspaceNavigation } from './components/Navbar'
import { MySubGreddiit } from './components/MySubGreddiits/MySubgreddiit'
import { MySubUsers } from './components/MySubGreddiits/MySubUsers'
import { MySubRequests } from './components/MySubGreddiits/MySubRequests'
import { MySubStats } from './components/MySubGreddiits/MySubStats'
import { MySubReports } from './components/MySubGreddiits/MySubReports'
import { AllSubGreddiits } from './components/AllSubGreddiits/AllSubGreddiits'
import { AllSubGreddiitPage } from './components/AllSubGreddiits/AllSubGreddiitPage'
import { SavedPosts } from './components/User/SavedPosts'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

const theme = createTheme({
  palette: {
    primary: { main: '#205b47' },
    background: { default: '#f5f7f4', paper: '#ffffff' },
    text: { primary: '#172923', secondary: '#4e6259' },
    divider: '#dce5de'
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    button: { fontWeight: 700, textTransform: 'none' }
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCard: { defaultProps: { variant: 'outlined' } }
  }
})

const CommunityRoute = ({ user, children }) => {
  const { id } = useParams()

  if (!user)
    return <Navigate replace to='/signin' />

  if (!/^(?:[a-f\d]{24}|[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12})$/i.test(id || ''))
    return <Navigate replace to='/mysubgreddiits' />

  return children
}

const App = () => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('loggedUser'))
    } catch {
      window.localStorage.removeItem('loggedUser')
      return null
    }
  })
  const handleLogout = () => setUser(null)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar user={user} onLogout={handleLogout} />
      <Container maxWidth={user ? 'xl' : 'lg'} disableGutters={!user} sx={user ? {
        py: { xs: 2.5, md: 4 }, display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '218px minmax(0, 1fr)' },
        gap: { md: 3, lg: 4 }
      } : undefined}>
      {user && <WorkspaceNavigation />}
      <Box component='main' sx={{ minWidth: 0 }}>
      <Routes>
        <Route exact path='/profile' element={user ? <Profile /> : <Navigate replace to='/signin' />} />
        <Route exact path='/signin' element={user ? <Navigate replace to='/home' /> : <LoginForms onLogin={setUser} />} />
        <Route exact path='/mysubgreddiits' element={user ? <MySubGreddiit /> : <Navigate replace to='/signin' />} />
        <Route exact path='/mysubgreddiits/:id' element={<CommunityRoute user={user}><Navigate replace to='users' /></CommunityRoute>} />
        <Route exact path='/mysubgreddiits/:id/users' element={<CommunityRoute user={user}><MySubUsers /></CommunityRoute>} />
        <Route exact path='/mysubgreddiits/:id/requests' element={<CommunityRoute user={user}><MySubRequests /></CommunityRoute>} />
        <Route exact path='/mysubgreddiits/:id/stats' element={<CommunityRoute user={user}><MySubStats /></CommunityRoute>} />
        <Route exact path='/mysubgreddiits/:id/reports' element={<CommunityRoute user={user}><MySubReports /></CommunityRoute>} />
        <Route exact path='/allsubgreddiits' element={user ? <AllSubGreddiits /> : <Navigate replace to='/signin' />} />
        <Route exact path='/home' element={user ? <AllSubGreddiits /> : <Navigate replace to='/signin' />} />
        <Route exact path='/allsubgreddiits/:id' element={user ? <AllSubGreddiitPage /> : <Navigate replace to='/signin' />} />
        <Route exact path='/savedposts' element={user ? <SavedPosts /> : <Navigate replace to='/signin' />} />
        <Route path='*' element={user ? <Navigate replace to='/home' /> : <Navigate replace to='/signin' />} />
      </Routes>
      </Box>
      </Container>
    </ThemeProvider>
  )
}

export default App
