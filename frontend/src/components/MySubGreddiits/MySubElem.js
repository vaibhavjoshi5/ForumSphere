import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteMySubHub } from '../../services/subgreddiits'

const MySubElem = ({ mySub }) => {
  const [open, setOpen] = useState(false)
  const [allDisable, setAllDisable] = useState(false)
  
  const user = JSON.parse(window.localStorage.getItem('loggedUser'))  
  const navigate = useNavigate()

  const onClose = () => setOpen(false)

  const onDelete = async () => {
    setOpen(false)
    setAllDisable(true)
    await deleteMySubHub(user.token, mySub.id)
    setAllDisable(false)
  }

  return (
    <Card 
      variant='outlined' 
      sx={{ 
        height: '100%',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
        }
      }}
    >
      <Dialog 
        open={open} 
        onClose={onClose}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <DialogContent>
          <DialogContentText sx={{ fontSize: '1.1rem', color: '#333' }}>
            🗑️ Are you sure you want to delete this community?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={onClose}
            sx={{ 
              borderRadius: '20px',
              fontWeight: 'bold',
              color: '#667eea'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={onDelete}
            sx={{ 
              borderRadius: '20px',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #ff6b6b 30%, #ff5252 90%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #ff5252 30%, #f44336 90%)',
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography 
          variant='h5' 
          component='div' 
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          🏠 {mySub.name}
        </Typography>
        <Typography 
          sx={{ 
            mb: 2, 
            color: '#666',
            fontSize: '1rem',
            lineHeight: 1.6
          }}
        >
          {mySub.description}
        </Typography>
        <Typography 
          variant='body2' 
          sx={{ 
            mb: 1,
            color: '#4a90e2',
            fontWeight: 'bold'
          }}
        >
          👥 {mySub.members.length + 1} members
        </Typography>
        <Typography 
          variant='body2' 
          sx={{ 
            mb: 2,
            color: '#4a90e2',
            fontWeight: 'bold'
          }}
        >
          📝 {mySub.posts.length} posts
        </Typography>
        <div>
          <Typography 
            variant='body2' 
            sx={{ 
              color: '#ff6b6b',
              fontWeight: 'bold',
              mb: 1
            }}
          >
            🚫 Banned keywords:
          </Typography>
          <Typography 
            variant='body2' 
            sx={{ 
              color: '#666',
              fontStyle: 'italic'
            }}
          >
            {mySub.bannedKeywords.join(', ')}
          </Typography>
        </div>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button 
          size='small' 
          variant='contained' 
          onClick={() => navigate(`/mysubgreddiits/${mySub.id}`)} 
          disabled={allDisable}
          sx={{ 
            borderRadius: '20px',
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            fontWeight: 'bold',
            flex: 1,
            '&:hover': {
              background: 'linear-gradient(45deg, #5a67d8 30%, #6b5b95 90%)',
              transform: 'translateY(-2px)',
            }
          }}
        >
          🚀 Open
        </Button>
        <Button 
          size='small' 
          variant='outlined' 
          color='error' 
          disabled={allDisable} 
          onClick={() => setOpen(true)}
          sx={{ 
            borderRadius: '20px',
            fontWeight: 'bold',
            flex: 1,
            ml: 1,
            border: '2px solid #ff6b6b',
            color: '#ff6b6b',
            '&:hover': {
              border: '2px solid #ff5252',
              background: 'rgba(255, 107, 107, 0.1)',
            }
          }}
        >
          🗑️ Delete
        </Button>
      </CardActions>
    </Card>
  )
}

export { MySubElem }