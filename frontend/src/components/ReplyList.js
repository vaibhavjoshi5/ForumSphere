import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Collapse from '@mui/material/Collapse'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import CommentIcon from '@mui/icons-material/Comment'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

import { useState } from 'react'
import { getAllNestedReplies } from '../services/posts'

const ReplyList = ({ reply, postedIn, replyDisable }) => {
  const [open, setOpen] = useState(false)
  const [newReply, setNewReply] = useState(reply)
  const [replyText, setReplyText] = useState('')
  const [replyError, setReplyError] = useState(false)
  const [showReplyField, setShowReplyField] = useState('none')

  const user = JSON.parse(window.localStorage.getItem('loggedUser'))

  const handleClick = async () => {
    if (reply.replies.length && !reply.replies[0].replyText)
      reply = await getAllNestedReplies(user.token, postedIn, reply.id)

    setOpen(!open)
  }

  const handleReplyChange = event => {
    setReplyText(event.target.value)
    if (event.target.value) setReplyError(false)
  }

  const handleNestedReply = async () => {
    if (showReplyField === 'none') setShowReplyField('')
    else if (replyText) {
      const replyDetails = {
        parentId: reply.id,
        replyText: replyText,
        id: 1
      }

      const changeReply = { ...newReply }
      changeReply.replies = changeReply.replies.concat(replyDetails)
      setNewReply(changeReply)

      setReplyText('')
      setReplyError(false)
      setShowReplyField('none')
    }
  }

  return (
    <>
      <ListItemText primary={reply.replyText} /><br />
      <TextField
        label='Type your reply' type='text' fullWidth variant='outlined' multiline sx={{ mt: 1, display: `${showReplyField}` }}
        onChange={handleReplyChange} onBlur={() => !replyText ? setReplyError(true) : setReplyError(false)} error={replyError}
        helperText={replyError ? 'Reply cannot be empty' : ''} value={replyText} />
      <Button onClick={event => handleNestedReply(event)} disabled={replyDisable || replyError}>Reply</Button>
      {
        reply.replies.length ?
          <List component='div' disablePadding sx={{ border: 1, borderRadius: 1, ml: 0.1 }}>
            <ListItemButton onClick={handleClick}>
              <ListItemIcon>
                <CommentIcon />
              </ListItemIcon>
              <ListItemText primary={reply.replies.length > 1 ? `View all ${reply.replies.length} replies` : 'View reply'} />
              {open ? <ExpandLess /> : <ExpandMore />}
              <Collapse in={open} timeout='auto' unmountOnExit>
                <List component='div' disablePadding sx={{ border: 1, borderRadius: 1, ml: 0.1 }}>
                  {
                    reply.replies.map(
                      reply => (
                        <ReplyList key={reply.id} reply={reply} postedIn={postedIn} replyDisable={replyDisable} />
                      )
                    )
                  }
                </List>
              </Collapse>
            </ListItemButton>
          </List>
          : null
      }
    </>
  )
}

export { ReplyList }