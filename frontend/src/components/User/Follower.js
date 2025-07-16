import { useState, useEffect } from 'react'
import Avatar from '@mui/material/Avatar'
import PersonIcon from '@mui/icons-material/Person'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import Button from '@mui/material/Button'
import ListSubheader from '@mui/material/ListSubheader'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Collapse from '@mui/material/Collapse'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import RecentActorsOutlinedIcon from '@mui/icons-material/RecentActorsOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'

import { updateUser, updateFollowerByID, updateFollowingByID, removeFollower as removeFollowerAPI, getUserFields } from '../../services/userFields'

const Followers = ({ initialUser, setInitialUser, refreshUserData }) => {
  const [open, setOpen] = useState(false)
  const user = JSON.parse(window.localStorage.getItem('loggedUser'))

  const handleClick = () => {
    setOpen(!open)
  }

  const removeFollower = async deleteFollower => {
    try {
      const finalUser = { ...initialUser }
      finalUser.followers = initialUser.followers.filter(follower => (follower._id || follower.id).toString() !== (deleteFollower._id || deleteFollower.id).toString())
      await updateUser(user.token, finalUser)
      setInitialUser(finalUser)
      await updateFollowerByID(user.token, deleteFollower._id || deleteFollower.id)
      // Also refresh user data to ensure UI is updated
      if (refreshUserData) {
        await refreshUserData()
      }
    } catch (error) {
      console.error('Error removing follower:', error)
      // Optionally show error message to user
    }
  }

  const followerCount = () => `Followers: ${initialUser.followers.length}`

  return (
    <div>
      <List
        sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
        component='nav'
        aria-labelledby='nested-list-subheader'
        subheader={
          <ListSubheader component='div' id='nested-list-subheader'>
            List of Followers
          </ListSubheader>
        }
      >
        <ListItemButton onClick={handleClick}>
          <ListItemIcon>
            <RecentActorsOutlinedIcon /><ArrowForwardOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={followerCount()} />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={open} timeout='auto' unmountOnExit>
          <List component='div' disablePadding>
            {
              initialUser.followers.map(
                follower => (
                  <List key={follower._id || follower.id}>
                    <ListItem sx={{ pl: 4 }}>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={follower.userName} />
                    </ListItem>
                    <ListItem sx={{ pl: 4 }}>
                      <Button variant='filled' endIcon={<DeleteIcon />} onClick={() => removeFollower(follower)}>Remove</Button>
                    </ListItem>
                  </List>
                )
              )
            }
          </List>
        </Collapse>
      </List>
    </div>
  )
}

const Following = ({ initialUser, setInitialUser, refreshUserData }) => {
  const [open, setOpen] = useState(false)
  const [followingList, setFollowingList] = useState(initialUser?.following || [])
  const [forceUpdate, setForceUpdate] = useState(0)
  const [isUnfollowing, setIsUnfollowing] = useState(false)
  const user = JSON.parse(window.localStorage.getItem('loggedUser'))

  // Update local state when initialUser changes
  useEffect(() => {
    console.log('Following component: initialUser changed:', initialUser?.following)
    setFollowingList(initialUser?.following || [])
  }, [initialUser])

  // Force component update
  useEffect(() => {
    setFollowingList(initialUser?.following || [])
  }, [forceUpdate])

  const handleClick = () => setOpen(!open)

  const removeFollowing = async deleteFollowing => {
    console.log('=== BUTTON CLICKED ===')
    console.log('isUnfollowing state:', isUnfollowing)
    
    if (isUnfollowing) {
      console.log('Already unfollowing, returning...')
      return // Prevent multiple clicks
    }
    
    try {
      setIsUnfollowing(true)
      console.log('=== FRONTEND UNFOLLOW DEBUG ===')
      console.log('Removing following:', deleteFollowing)
      console.log('User to unfollow ID:', deleteFollowing._id || deleteFollowing.id)
      console.log('Current followingList before API call:', followingList)
      
      const updatedUser = await removeFollowerAPI(user.token, deleteFollowing._id || deleteFollowing.id)
      
      console.log('API response received:', updatedUser)
      console.log('API response following field:', updatedUser.following)
      
      // Immediately update local state
      const newFollowingList = updatedUser.following || []
      console.log('Setting new following list:', newFollowingList)
      console.log('New following list length:', newFollowingList.length)
      
      setFollowingList(newFollowingList)
      setInitialUser(updatedUser)
      
      // Force update trigger
      setForceUpdate(prev => prev + 1)
      
      // Double-check by getting fresh data from server
      console.log('=== DOUBLE CHECK: Getting fresh data from server ===')
      const freshUserData = await getUserFields()
      console.log('Fresh data from server:', freshUserData)
      console.log('Fresh following from server:', freshUserData.following)
      
      // Update with fresh data
      setFollowingList(freshUserData.following || [])
      setInitialUser(freshUserData)
      
      // Force another update trigger
      setForceUpdate(prev => prev + 1)
      
      // Force state reset after a tiny delay
      setTimeout(() => {
        setFollowingList(freshUserData.following || [])
        setForceUpdate(prev => prev + 1)
      }, 50)
      
      // Also call refresh function to ensure parent component updates
      if (refreshUserData) {
        await refreshUserData()
      }
      
      console.log('State updated, current followingList should be:', freshUserData.following)
      console.log('=== END FRONTEND DEBUG ===')
      
    } catch (error) {
      console.error('Error removing following:', error)
      console.error('Error details:', error.response?.data)
    } finally {
      setIsUnfollowing(false)
    }
  }

  const followingCount = () => {
    // Use actual length from current state
    const actualLength = followingList?.length || 0
    const count = `Following: ${actualLength}`
    console.log('Following count:', count, 'List:', followingList)
    return count
  }

  // Force re-render by creating a key based on the following list length and update counter
  const listKey = `following-${followingList.length}-${forceUpdate}-${Date.now()}`

  return (
    <div key={listKey}>
      <List
        key={`list-${followingList.length}-${forceUpdate}-${Date.now()}`}
        sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
        component='nav'
        aria-labelledby='nested-list-subheader'
        subheader={
          <ListSubheader component='div' id='nested-list-subheader'>
            List of Following users
          </ListSubheader>
        }
      >
        <ListItemButton onClick={handleClick} key={`button-${followingList.length}-${forceUpdate}`}>
          <ListItemIcon>
            <RecentActorsOutlinedIcon /><ArrowBackOutlinedIcon />
          </ListItemIcon>
          <div style={{ flex: 1 }} key={`count-${followingList.length}-${forceUpdate}-${Date.now()}`}>
            <span style={{ fontSize: '16px', color: '#333' }}>
              Following: {followingList?.length || 0}
            </span>
          </div>
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={open} timeout='auto' unmountOnExit>
          <List component='div' disablePadding>
            {
              followingList && followingList.length > 0 ? (
                followingList.map(
                  following => (
                    <List key={following._id || following.id}>
                      <ListItem sx={{ pl: 4 }}>
                        <ListItemAvatar>
                          <Avatar>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={following.userName} />
                      </ListItem>
                      <ListItem sx={{ pl: 4 }}>
                        <Button 
                          variant='filled' 
                          endIcon={<PersonRemoveIcon />} 
                          onClick={() => removeFollowing(following)}
                          disabled={isUnfollowing}
                          sx={{
                            backgroundColor: isUnfollowing ? '#ccc' : '#ff6b6b',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: isUnfollowing ? '#ccc' : '#ff5252',
                            },
                            '&:disabled': {
                              backgroundColor: '#ccc',
                              color: '#666'
                            }
                          }}
                        >
                          {isUnfollowing ? 'Unfollowing...' : 'Unfollow'}
                        </Button>
                      </ListItem>
                    </List>
                  )
                )
              ) : (
                <ListItem sx={{ pl: 4 }}>
                  <ListItemText primary="No following users" />
                </ListItem>
              )
            }
          </List>
        </Collapse>
      </List>
    </div>
  )
}

export { Followers, Following }