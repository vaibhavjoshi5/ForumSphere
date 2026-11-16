import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Avatar, Box, Button, Container, IconButton, Menu, MenuItem, Paper, Stack, Typography } from '@mui/material'
import HubOutlined from '@mui/icons-material/HubOutlined'
import MenuRounded from '@mui/icons-material/MenuRounded'

import ExploreOutlined from '@mui/icons-material/ExploreOutlined'
import GroupsOutlined from '@mui/icons-material/GroupsOutlined'
import BookmarkBorderRounded from '@mui/icons-material/BookmarkBorderRounded'
import PersonOutlineRounded from '@mui/icons-material/PersonOutlineRounded'

const links = [
  ['/allsubgreddiits', 'Discover', ExploreOutlined],
  ['/mysubgreddiits', 'My communities', GroupsOutlined],
  ['/savedposts', 'Saved posts', BookmarkBorderRounded],
  ['/profile', 'Profile', PersonOutlineRounded]
]

const isActive = (pathname, path) => pathname === path || pathname.startsWith(path + '/') ||
  (pathname === '/home' && path === '/allsubgreddiits')

const WorkspaceNavigation = () => {
  const { pathname } = useLocation()
  return (
    <Paper component='nav' variant='outlined' aria-label='Main navigation'
      sx={{ display: { xs: 'none', md: 'block' }, alignSelf: 'start', position: 'sticky', top: 96, p: 1.5 }}>
      <Typography variant='overline' color='text.secondary' sx={{ px: 1.5, letterSpacing: '0.13em' }}>Workspace</Typography>
      <Stack spacing={0.5}>
        {links.map(([path, label, Icon]) => {
          const active = isActive(pathname, path)
          return <Button key={path} component={Link} to={path} startIcon={<Icon />}
            aria-current={active ? 'page' : undefined}
            sx={{ justifyContent: 'flex-start', px: 1.5, py: 1, color: active ? 'primary.main' : 'text.secondary', bgcolor: active ? 'action.selected' : undefined }}>
            {label}
          </Button>
        })}
      </Stack>
    </Paper>
  )
}

const Navbar = ({ user, onLogout }) => {
  const [menu, setMenu] = useState(null)
  const { pathname } = useLocation()
  const moderator = pathname.match(/^\/mysubgreddiits\/((?:[a-f\d]{24}|[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}))(?:\/|$)/i)
  const logout = () => {
    setMenu(null)
    localStorage.removeItem('loggedUser')
    onLogout()
  }

  return (
    <Box component='header' sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', position: moderator ? 'relative' : 'sticky', top: 0, zIndex: 10 }}>
      <Container maxWidth='xl'>
        <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ minHeight: 68 }}>
          <Button component={Link} to='/home' startIcon={<HubOutlined />} sx={{ fontSize: '1.2rem', fontWeight: 800 }}>ForumSphere</Button>
          {user && <>
            <Button component={Link} to='/profile' startIcon={<Avatar sx={{ width: 26, height: 26, fontSize: 12, bgcolor: 'primary.main' }}>{(user.userName || '?').slice(0, 1).toUpperCase()}</Avatar>}
              sx={{ ml: 'auto', mr: 1, display: { xs: 'none', md: 'inline-flex' }, maxWidth: 220 }}>
              <Typography noWrap variant='body2' fontWeight={700}>{user.userName || 'Profile'}</Typography>
            </Button>
            <Button onClick={logout} sx={{ display: { xs: 'none', md: 'inline-flex' } }}>Sign out</Button>
            <IconButton aria-label='Navigation menu' aria-expanded={Boolean(menu)} aria-haspopup='true' onClick={event => setMenu(event.currentTarget)} sx={{ display: { md: 'none' } }}><MenuRounded /></IconButton>
            <Menu anchorEl={menu} open={Boolean(menu)} onClose={() => setMenu(null)}>
              {links.map(([path, label]) => <MenuItem key={path} component={Link} to={path} selected={isActive(pathname, path)} onClick={() => setMenu(null)}>{label}</MenuItem>)}
              <MenuItem onClick={logout}>Sign out</MenuItem>
            </Menu>
          </>}
        </Stack>
        {user && moderator && <Stack component='nav' aria-label='Moderation' direction='row' flexWrap='wrap' sx={{ pb: 1, gap: 1 }}>
          {[['users', 'Users'], ['requests', 'Requests'], ['stats', 'Stats'], ['reports', 'Reports']].map(([path, label]) =>
            <Button key={path} component={NavLink} to={'/mysubgreddiits/' + moderator[1] + '/' + path} sx={{ '&.active': { bgcolor: 'action.selected' } }}>{label}</Button>
          )}
        </Stack>}
      </Container>
    </Box>
  )
}

export { Navbar, WorkspaceNavigation }
