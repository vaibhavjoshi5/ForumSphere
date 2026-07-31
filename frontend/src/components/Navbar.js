import { useState, useEffect } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import MenuIcon from '@mui/icons-material/Menu'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import AdbIcon from '@mui/icons-material/Adb'
import LogoutIcon from '@mui/icons-material/Logout'
import { useNavigate, useLocation } from 'react-router-dom'

import RedditIcon from '@mui/icons-material/Reddit'
import LineWeightIcon from '@mui/icons-material/LineWeight'
import ListAltIcon from '@mui/icons-material/ListAlt'
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded'
import GroupIcon from '@mui/icons-material/Group'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import BarChartIcon from '@mui/icons-material/BarChart'
import ReportIcon from '@mui/icons-material/Report'

const Navbar = ({ user, onLogout }) => {
  const [anchorElNav, setAnchorElNav] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const moderatorPathMatch = location.pathname.match(/^\/mysubgreddiits\/([a-f\d]{24})(?:\/|$)/i)
  const subId = moderatorPathMatch?.[1] || ''
  const isModeratorPage = Boolean(subId)

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget)
  }

  useEffect(
    () => {
      const handleKeyboardShortcut = event => {
        if (event.key.toLowerCase() === 'u')
          navigate(`/mysubgreddiits/${subId}/users`)
        else if (event.key.toLowerCase() === 'j')
          navigate(`/mysubgreddiits/${subId}/requests`)
        else if (event.key.toLowerCase() === 's')
          navigate(`/mysubgreddiits/${subId}/stats`)
        else if (event.key.toLowerCase() === 'r')
          navigate(`/mysubgreddiits/${subId}/reports`)
      }

      if (isModeratorPage) {
        document.addEventListener('keypress', handleKeyboardShortcut)
      }

      return () => document.removeEventListener('keypress', handleKeyboardShortcut)
    }
    , [isModeratorPage, subId, navigate]
  )

  const mySubPages = [
    { url: `/mysubgreddiits/${subId}/users`, name: 'Users' },
    { url: `/mysubgreddiits/${subId}/requests`, name: 'Join Requests' },
    { url: `/mysubgreddiits/${subId}/stats`, name: 'Stats' },
    { url: `/mysubgreddiits/${subId}/reports`, name: 'Reports' }
  ]

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  const handleLogout = event => {
    event.preventDefault()
    window.localStorage.removeItem('loggedUser')
    navigate('/signin')
    onLogout()
  }

  const handleRedirect = (event, url) => {
    event.preventDefault()
    navigate(url)
  }

  const handleNavListRedirect = (event, url) => {
    event.preventDefault()
    handleCloseNavMenu()
    navigate(url)
  }

  return (
    <AppBar position='sticky' sx={{ 
      background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      backdropFilter: 'blur(10px)',
    }}>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          <Typography onClick={event => handleRedirect(event, '/home')}>
            <IconButton sx={{
              display: { xs: 'none', md: 'flex' },
              color: 'white',
              textDecoration: 'none',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                color: '#ffeb3b',
              }
            }}
            ><RedditIcon sx={{ mr: 1, fontSize: '2rem' }} />SocialHub</IconButton>
          </Typography>

          {
            user ?
              <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                <IconButton
                  size='large'
                  aria-label='account of current user'
                  aria-controls='menu-appbar'
                  aria-haspopup='true'
                  onClick={handleOpenNavMenu}
                  color='inherit'
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id='menu-appbar'
                  anchorEl={anchorElNav}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  open={Boolean(anchorElNav)}
                  onClose={handleCloseNavMenu}
                  sx={{
                    display: { xs: 'block', md: 'none' },
                  }}
                >
                  <MenuItem>
                    <Typography textAlign='center' onClick={event => handleNavListRedirect(event, '/mysubgreddiits')}>My Communities</Typography>
                  </MenuItem>
                  {
                    isModeratorPage ?
                      mySubPages.map(page =>
                        <MenuItem key={page.url}>
                          <Typography textAlign='center' onClick={event => handleNavListRedirect(event, page.url)}>{page.name}</Typography>
                        </MenuItem>
                      )
                      : null
                  }
                  <MenuItem>
                    <Typography textAlign='center' onClick={event => handleNavListRedirect(event, '/allsubgreddiits')}>All Communities</Typography>
                  </MenuItem>
                  <MenuItem>
                    <Typography textAlign='center' onClick={event => handleNavListRedirect(event, '/savedposts')}>Saved Posts</Typography>
                  </MenuItem>
                </Menu>
              </Box> : null
          }

          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant='h5'
            noWrap
            component='a'
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              color: 'inherit',
              textDecoration: 'none',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
            onClick={event => handleRedirect(event, '/profile')}
          >
            SocialHub
          </Typography>

          {
            user ?
              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                <Button
                  onClick={event => handleRedirect(event, '/mysubgreddiits')}
                  sx={{ 
                    my: 2, 
                    ml: 1, 
                    color: 'white',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-2px)',
                    }
                  }} 
                  startIcon={<LineWeightIcon />}
                >
                  My Communities
                </Button>
                {
                  isModeratorPage ?
                    <>
                      <Button
                        onClick={event => handleRedirect(event, `/mysubgreddiits/${subId}/users`)}
                        sx={{ my: 2, ml: 1, color: 'white' }} startIcon={<GroupIcon />}
                      >
                        Users
                      </Button>
                      <Button
                        onClick={event => handleRedirect(event, `/mysubgreddiits/${subId}/requests`)}
                        sx={{ my: 2, ml: 1, color: 'white' }} startIcon={<PendingActionsIcon />}
                      >
                        Join Requests
                      </Button>
                      <Button
                        onClick={event => handleRedirect(event, `/mysubgreddiits/${subId}/stats`)}
                        sx={{ my: 2, ml: 1, color: 'white' }} startIcon={<BarChartIcon />}
                      >
                        Stats
                      </Button>
                      <Button
                        onClick={event => handleRedirect(event, `/mysubgreddiits/${subId}/reports`)}
                        sx={{ my: 2, ml: 1, color: 'white' }} startIcon={<ReportIcon />}
                      >
                        Reports
                      </Button>
                    </>
                    : null
                }
                <Button
                  onClick={event => handleRedirect(event, '/allsubgreddiits')}
                  sx={{ 
                    my: 2, 
                    ml: 1, 
                    color: 'white',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-2px)',
                    }
                  }} 
                  startIcon={<ListAltIcon />}
                >
                  All Communities
                </Button>
                <Button
                  onClick={event => handleRedirect(event, '/savedposts')}
                  sx={{ 
                    my: 2, 
                    ml: 1, 
                    color: 'white',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-2px)',
                    }
                  }} 
                  startIcon={<BookmarkAddedIcon />}
                >
                  Saved Posts
                </Button>
              </Box> : null
          }
          {
            user ?            <Button sx={{ 
              my: 2, 
              color: 'white',
              background: 'rgba(255, 69, 0, 0.8)',
              borderRadius: '25px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'rgba(255, 69, 0, 1)',
                transform: 'scale(1.05)',
              }
            }} endIcon={<LogoutIcon />} onClick={handleLogout}>
              Logout
            </Button>:
              null
          }
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export { Navbar }
