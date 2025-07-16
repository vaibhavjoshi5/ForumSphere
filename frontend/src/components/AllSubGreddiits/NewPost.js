import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

import { useState } from 'react'
import { createNewPost } from '../../services/posts'
import { getMySubHubPage } from '../../services/subgreddiits'

const NewPost = ({subPage, userToken, setSubPage}) => {
  const [open, setOpen] = useState(false)
  const [postText, setPostText] = useState('')
  const [textError, setTextError] = useState(false)
  const [createDisable, setCreateDisable] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertSeverity, setAlertSeverity] = useState('info')

  // Debug logging
  console.log('NewPost component props:', { subPage, userToken })

  const addPost = async () => {
    if (!postText.trim()) {
      setTextError(true)
      return
    }

    const post = {
      text: postText,
      subId: subPage.id,
      upvotes: 0,
      downvotes: 0
    }

    let alertFlag = false

    subPage.bannedKeywords.forEach(word => {
      const bannedRegex = new RegExp(`\\b${word}\\b`, 'gi')
      alertFlag |= bannedRegex.test(post.text)
    })

    if (alertFlag) {
      setAlertMessage('Your post contains words that are banned in this community')
      setAlertSeverity('error')
      return
    }

    try {
      setCreateDisable(true)
      setAlertMessage('')
      
      console.log('Creating post with data:', post)
      console.log('User token:', userToken)
      
      const result = await createNewPost(userToken, post)
      console.log('Post created successfully:', result)
      
      setPostText('')
      setTextError(false)
      
      const newSubPage = await getMySubHubPage(userToken, subPage.id)
      setSubPage(newSubPage)
      
      setAlertMessage('Post created successfully!')
      setAlertSeverity('success')
      
      // Close dialog after a short delay
      setTimeout(() => {
        setOpen(false)
        setAlertMessage('')
      }, 1500)
      
    } catch (error) {
      console.error('Error creating post:', error)
      console.error('Error details:', error.response?.data)
      console.error('Error status:', error.response?.status)
      setAlertMessage(error.response?.data?.error || 'Failed to create post. Please try again.')
      setAlertSeverity('error')
    } finally {
      setCreateDisable(false)
    }
  }

  const onCancel = () => {
    setTextError(false)
    setPostText('')
    setAlertMessage('')
    setOpen(false)
  }

  const handleTextChange = event => {
    setPostText(event.target.value)
    if (event.target.value) {
      setTextError(false)
      setAlertMessage('')
    }
  }

  return (
    <>
      <Fab 
        variant='extended' 
        size='medium' 
        aria-label='New Post' 
        sx={{ 
          position: 'sticky', 
          bottom: 16, 
          right: 16,
          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
          color: 'white',
          fontWeight: 'bold',
          boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
          '&:hover': {
            background: 'linear-gradient(45deg, #5a67d8 30%, #6b5b95 90%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.5)',
          }
        }}
        onClick={() => setOpen(true)}
      >
        <AddIcon sx={{ mr: 1 }} />
        ✨ New Post
      </Fab>
      <Dialog 
        open={open} 
        onClose={onCancel} 
        fullWidth 
        maxWidth='md'
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          pb: 1
        }}>
          📝 Create New Post
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText sx={{ 
            textAlign: 'center', 
            color: '#666',
            fontSize: '1.1rem',
            mb: 2
          }}>
            Share your thoughts with the community
          </DialogContentText>
          
          {alertMessage && (
            <Alert 
              severity={alertSeverity} 
              sx={{ 
                mb: 2,
                borderRadius: '12px',
                fontWeight: 'bold'
              }}
            >
              {alertMessage}
            </Alert>
          )}
          
          <TextField
            id='textPost'
            label='💭 What are you thinking?'
            type='text'
            fullWidth
            variant='outlined'
            multiline
            rows={4}
            sx={{ 
              mt: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                }
              }
            }}
            onChange={handleTextChange}
            onBlur={() => !postText.trim() ? setTextError(true) : setTextError(false)}
            error={textError}
            helperText={textError ? 'Post text cannot be empty' : ''}
            value={postText}
            placeholder='Write something interesting...'
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={onCancel}
            variant='outlined'
            sx={{
              borderRadius: '20px',
              border: '2px solid #ff6b6b',
              color: '#ff6b6b',
              fontWeight: 'bold',
              padding: '8px 24px',
              '&:hover': {
                border: '2px solid #ff5252',
                background: 'rgba(255, 107, 107, 0.1)',
              }
            }}
          >
            ❌ Cancel
          </Button>
          <Button 
            onClick={addPost} 
            disabled={!postText.trim() || createDisable}
            variant='contained'
            sx={{
              borderRadius: '20px',
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              fontWeight: 'bold',
              padding: '8px 24px',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a67d8 30%, #6b5b95 90%)',
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)',
              }
            }}
          >
            {createDisable ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} color='inherit' />
                Creating...
              </Box>
            ) : (
              '🚀 Create Post'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export { NewPost }