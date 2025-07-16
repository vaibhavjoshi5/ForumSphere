import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined'
import ArrowCircleUpOutlinedIcon from '@mui/icons-material/ArrowCircleUpOutlined'
import ArrowCircleDownOutlinedIcon from '@mui/icons-material/ArrowCircleDownOutlined'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import Typography from '@mui/material/Typography'
import ListSubheader from '@mui/material/ListSubheader'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Collapse from '@mui/material/Collapse'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import CommentIcon from '@mui/icons-material/Comment'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import FlagIcon from '@mui/icons-material/Flag'
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove'

import { useState, useEffect } from 'react'
import { useMatch } from 'react-router-dom'
import { updatePostDetails, savePost, removeSavedPost, reportPost } from '../services/posts'
import { getUserFields, addFollower, removeFollower } from '../services/userFields'
import { getMySubHubPage } from '../services/subgreddiits'

const Post = ({ post }) => {
  const [open, setOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replyError, setReplyError] = useState(false)
  const [replyDisable, setReplyDisable] = useState(false)
  const [showReplyField, setShowReplyField] = useState('none')
  const [upvoteDisable, setUpvoteDisable] = useState(false)
  const [downvoteDisable, setDownvoteDisable] = useState(false)
  const [savedDisable, setSavedDisable] = useState(false)
  const [followDisable, setFollowDisable] = useState(false)
  const [reportDisable, setReportDisable] = useState(false)
  const [removeDisable, setRemoveDisable] = useState(false)
  const [userDetails, setUserDetails] = useState(null)
  const [subDetails, setSubDetails] = useState(null)

  const [upvoted, setUpvoted] = useState(false)
  const [downvoted, setDownvoted] = useState(false)
  const [saved, setSaved] = useState(false)
  const [following, setFollowing] = useState(false)
  const [reported, setReported] = useState(false)

  const [reportOpen, setReportOpen] = useState(false)
  const [concern, setConcern] = useState('')
  const [concernError, setConcernError] = useState(false)
  const [createReportDisable, setCreateReportDisable] = useState(false)

  const user = JSON.parse(window.localStorage.getItem('loggedUser'))
  const savedPostMatch = useMatch('/savedposts')

  useEffect(
    () => {
      const getUserDetails = async () => {
        const userFields = await getUserFields()
        setUserDetails(userFields)
      }
      getUserDetails()
    }, [])

  useEffect(
    () => {
      const getMySubDetails = async () => {
        const subFields = await getMySubHubPage(user.token, post.postedIn)
        setSubDetails(subFields)
      }
      getMySubDetails()
    }, [user.token, post])

  useEffect(
    () => {
      setUpvoted(post.upvotedBy.includes(user.id))
      setDownvoted(post.downvotedBy.includes(user.id))
      if (userDetails && userDetails.id) {
        setSaved(userDetails.saved.find(savedPost => savedPost.id === post.id) !== undefined)
        // Check if user is following the post author
        const isFollowing = userDetails.following.some(followingUser => {
          // Handle both populated and non-populated following arrays
          if (typeof followingUser === 'object' && followingUser.id) {
            return followingUser.id.toString() === post.postedBy.id.toString()
          } else {
            return followingUser.toString() === post.postedBy.id.toString()
          }
        })
        setFollowing(isFollowing)
        if (subDetails && subDetails.reports)
          setReported(subDetails.reports.find(report => report.reportedBy === user.id && report.postId === post.id) !== undefined)
      }
    }, [post, userDetails, user, subDetails]
  )

  const setDisableValues = val => {
    setReplyDisable(val)
    setUpvoteDisable(val)
    setDownvoteDisable(val)
    setSavedDisable(val)
    setFollowDisable(val)
    setReportDisable(val)
    setRemoveDisable(val)
    setCreateReportDisable(val)
  }

  const updatePost = async () => {
    const newPost = {
      text: post.text,
      postedBy: post.postedBy.id,
      postedIn: post.postedIn,
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      replies: post.replies,
      upvotedBy: post.upvotedBy,
      downvotedBy: post.downvotedBy,
      id: post.id || post.id
    }

    setDisableValues(true)
    await updatePostDetails(user.token, newPost)
    setDisableValues(false)
  }

  const handleClick = () => setOpen(!open)

  const handleUpvote = async () => {
    if (!post.upvotedBy.includes(user.id)) {
      if (post.downvotedBy.includes(user.id)) {
        post.downvotedBy = post.downvotedBy.filter(userId => userId !== user.id)
        post.downvotes -= 1
      }
      post.upvotedBy = post.upvotedBy.concat(user.id)
      post.upvotes += 1
    } else {
      post.upvotedBy = post.upvotedBy.filter(userId => userId !== user.id)
      post.upvotes -= 1
    }
    await updatePost()
  }

  const handleDownvote = async () => {
    if (!post.downvotedBy.includes(user.id)) {
      if (post.upvotedBy.includes(user.id)) {
        post.upvotedBy = post.upvotedBy.filter(userId => userId !== user.id)
        post.upvotes -= 1
      }
      post.downvotedBy = post.downvotedBy.concat(user.id)
      post.downvotes += 1
    } else {
      post.downvotedBy = post.downvotedBy.filter(userId => userId !== user.id)
      post.downvotes -= 1
    }
    await updatePost()
  }

  const handleReplyChange = event => {
    setReplyText(event.target.value)
    if (event.target.value) setReplyError(false)
  }

  const handleReplySubmit = async () => {
    if (showReplyField === 'none') setShowReplyField('')
    else {
      if (replyText) {
        post.replies = post.replies.concat(replyText)
        setReplyText('')
        setReplyError(false)
        await updatePost()
      }
      setShowReplyField('none')
    }
  }

  const handleSavePost = async () => {
    if (!saved) {
      setDisableValues(true)
      await savePost(user.token, post.id)
      setDisableValues(false)
    }
  }

  const followPoster = async () => {
    setDisableValues(true)
    try {
      if (!following) {
        console.log('Following user:', post.postedBy.id)
        const updatedUserData = await addFollower(user.token, post.postedBy.id)
        setFollowing(true)
        // Update userDetails with the populated response from backend
        const userFieldsResponse = await getUserFields()
        setUserDetails(userFieldsResponse)
        console.log('Successfully followed user')
      } else {
        console.log('Unfollowing user:', post.postedBy.id)
        const updatedUserData = await removeFollower(user.token, post.postedBy.id)
        setFollowing(false)
        // Update userDetails with the populated response from backend
        const userFieldsResponse = await getUserFields()
        setUserDetails(userFieldsResponse)
        console.log('Successfully unfollowed user')
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error)
      console.error('Error response:', error.response?.data)
      // Refresh user data in case of error to ensure state consistency
      try {
        const freshUserData = await getUserFields()
        setUserDetails(freshUserData)
      } catch (refreshError) {
        console.error('Error refreshing user data:', refreshError)
      }
    } finally {
      setDisableValues(false)
    }
  }

  const handleReport = async () => {
    if (!reported) {
      const reportObj = {
        reportedUser: post.postedBy.id,
        concern: concern,
        postId: post.id,
      }

      setDisableValues(true)
      await reportPost(user.token, post.postedIn, reportObj)
      setDisableValues(false)
      onCancel()
    }
  }

  const handleRemoveSavedPost = async () => {
    setDisableValues(true)
    const updatedUser = await removeSavedPost(user.token, post.id)
    setUserDetails(updatedUser)
    setDisableValues(false)
  }

  const onCancel = () => {
    setConcernError(false)
    setConcern('')
    setReportOpen(false)
  }

  const handleConcernChange = event => {
    setConcern(event.target.value)
    if (event.target.value) setConcernError(false)
  }

  return (
    <>
      {
        userDetails && userDetails.id ?
          <Grid container spacing={2} sx={{ mb: 1, ml: 1, mt: 1, border: 1, borderRadius: 1, pb: 1 }}>
            <Grid item xs={2}>
              <Stack direction='row'>
                <IconButton onClick={handleUpvote} disabled={upvoteDisable} color={upvoted ? 'success' : ''}>
                  {post.upvotes} <ArrowCircleUpOutlinedIcon />
                </IconButton>
                <IconButton onClick={handleSavePost} disabled={savedDisable} color={saved ? 'primary' : ''}>
                  <BookmarkAddOutlinedIcon />
                  <Typography>{saved ? 'Saved' : 'Save Post'}</Typography>
                </IconButton>
              </Stack>
              <Stack direction='row'>
                <IconButton onClick={handleDownvote} disabled={downvoteDisable} color={downvoted ? 'error' : ''}>
                  {post.downvotes} <ArrowCircleDownOutlinedIcon />
                </IconButton>
                <IconButton onClick={followPoster} disabled={followDisable || user.id === post.postedBy.id} color={following ? 'secondary' : ''}>
                  <PersonAddIcon />
                  <Typography>{following ? 'Unfollow' : 'Follow User'}</Typography>
                </IconButton>
              </Stack>
              <Button variant='outlined' color='error' disabled={reportDisable} onClick={() => setReportOpen(true && !reported)}><FlagIcon />{reported ? 'Reported' : 'Report'}</Button><br />
              <Dialog open={reportOpen} onClose={onCancel} fullWidth>
                <DialogContent>
                  <DialogContentText>
                    Type your concern regarding the post
                  </DialogContentText>
                  <TextField
                    label='Concern' type='text' fullWidth variant='outlined' multiline sx={{ mt: 1 }}
                    onChange={handleConcernChange} onBlur={() => !concern ? setConcernError(true) : setConcernError(false)} error={concernError}
                    helperText={concernError ? 'Concern regarding the report cannot be empty' : ''} value={concern}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={onCancel}>Cancel</Button>
                  <Button onClick={handleReport} disabled={!concern || createReportDisable}>Report Post</Button>
                </DialogActions>
              </Dialog>
              {savedPostMatch ? <Button variant='outlined' color='error' onClick={handleRemoveSavedPost} disabled={removeDisable}><BookmarkRemoveIcon />Remove</Button> : null}
            </Grid>
            <Grid item xs={10}>
              <List
                sx={{ width: 'auto', bgcolor: 'background.paper', maxWidth: 300 }}
                component='nav'
                subheader={
                  <ListSubheader component='div'>
                    {post.text}<br />
                    Posted by user "{post.postedBy.userName}"<br/>
                  </ListSubheader>
                }
              >
                <TextField
                  label='Reply to the post' type='text' fullWidth variant='outlined' multiline sx={{ mt: 1, display: `${showReplyField}` }}
                  onChange={handleReplyChange} onBlur={() => !replyText ? setReplyError(true) : setReplyError(false)} error={replyError}
                  helperText={replyError ? 'Reply cannot be empty' : ''} value={replyText} />
                <Button onClick={handleReplySubmit} disabled={replyDisable || replyError}>Reply</Button>
                {
                  post.replies.length ?
                    <>
                      <ListItemButton onClick={handleClick}>
                        <ListItemIcon>
                          <CommentIcon />
                        </ListItemIcon>
                        <ListItemText primary='Replies' />
                        {open ? <ExpandLess /> : <ExpandMore />}
                      </ListItemButton>
                      <Collapse in={open} timeout='auto' unmountOnExit>
                        <List component='div' disablePadding>
                          {
                            post.replies.map(
                              reply => (
                                <ListItem sx={{ pl: 4 }} key={reply}>
                                  <ListItemText primary={reply} />
                                </ListItem>
                              )
                            )
                          }
                        </List>
                      </Collapse>
                    </>
                    : null
                }

              </List>
            </Grid>
          </Grid>
          : null
      }
    </>
  )
}

export { Post }