import { useState } from 'react'
import { Alert, Avatar, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material'
import ArrowUpwardRounded from '@mui/icons-material/ArrowUpwardRounded'
import ArrowDownwardRounded from '@mui/icons-material/ArrowDownwardRounded'
import BookmarkBorderRounded from '@mui/icons-material/BookmarkBorderRounded'
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded'
import { interactWithPost, savePost, removeSavedPost, reportPost } from '../services/posts'
import { addFollower, removeFollower } from '../services/userFields'

const Post = ({ post, profile, onSaveChange, onFollowChange }) => {
  const user = JSON.parse(localStorage.getItem('loggedUser'))
  const [changes, setChanges] = useState({})
  const [showReplies, setShowReplies] = useState(false)
  const [reply, setReply] = useState('')
  const [reportOpen, setReportOpen] = useState(false)
  const [concern, setConcern] = useState('')
  const [reported, setReported] = useState(Boolean(post.reported))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const current = { ...post, ...changes }
  const author = post.postedBy?.userName || 'Unknown member'
  const authorId = post.postedBy?.id
  const ownPost = user.id === authorId
  const saved = profile?.saved?.some(item => (item.id || item) === post.id)
  const following = profile?.following?.some(item => (item.id || item) === authorId)
  const upvoted = current.upvotedBy?.includes(user.id)
  const downvoted = current.downvotedBy?.includes(user.id)
  const replies = current.replies || []

  const run = async action => {
    setBusy(true)
    setError('')
    try {
      await action()
    } catch (failure) {
      setError(failure.response?.data?.error || 'Could not complete that action. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const vote = value => run(async () => {
    setChanges(await interactWithPost(user.token, post, { vote: value }))
  })

  const submitReply = event => {
    event.preventDefault()
    if (busy || !reply.trim()) return
    run(async () => {
      setChanges(await interactWithPost(user.token, post, { reply: reply.trim() }))
      setReply('')
    })
  }

  const toggleSave = () => run(async () => {
    await (saved ? removeSavedPost : savePost)(user.token, post.id)
    onSaveChange(post, !saved)
  })

  const toggleFollow = () => run(async () => {
    await (following ? removeFollower : addFollower)(user.token, authorId)
    onFollowChange(authorId, !following)
  })

  const sendReport = () => run(async () => {
    await reportPost(user.token, post.postedIn, { reportedUser: authorId, concern: concern.trim(), postId: post.id })
    setReported(true)
    setReportOpen(false)
    setConcern('')
  })

  return (
    <Card component='article' sx={{ overflowWrap: 'anywhere' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <Stack direction='row' alignItems='center' spacing={1.25}>
            <Avatar sx={{ bgcolor: '#e4f2e9', color: 'primary.main', width: 36, height: 36 }}>{author.slice(0, 2).toUpperCase()}</Avatar>
            <Typography fontWeight={800}>{author}</Typography>
          </Stack>
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{post.text}</Typography>
          <Stack direction='row' flexWrap='wrap' gap={0.75}>
            <Button size='small' startIcon={<ArrowUpwardRounded />} aria-label={'Upvote, ' + (current.upvotes || 0)} aria-pressed={Boolean(upvoted)} variant={upvoted ? 'contained' : 'outlined'} disabled={busy} onClick={() => vote(upvoted ? 0 : 1)}>{current.upvotes || 0}</Button>
            <Button size='small' startIcon={<ArrowDownwardRounded />} aria-label={'Downvote, ' + (current.downvotes || 0)} aria-pressed={Boolean(downvoted)} variant={downvoted ? 'contained' : 'outlined'} disabled={busy} onClick={() => vote(downvoted ? 0 : -1)}>{current.downvotes || 0}</Button>
            <Button size='small' startIcon={<ChatBubbleOutlineRounded />} aria-expanded={showReplies} onClick={() => setShowReplies(!showReplies)}>Replies ({replies.length})</Button>
            <Button size='small' startIcon={<BookmarkBorderRounded />} aria-pressed={Boolean(saved)} disabled={busy || !profile} onClick={toggleSave}>{saved ? 'Unsave' : 'Save'}</Button>
            {authorId && !ownPost && <Button size='small' disabled={busy || !profile} onClick={toggleFollow}>{following ? 'Unfollow' : 'Follow'}</Button>}
            {authorId && !ownPost && <Button size='small' color='inherit' disabled={busy || reported} onClick={() => { setError(''); setReportOpen(true) }}>{reported ? 'Reported' : 'Report'}</Button>}
          </Stack>
          {error && !reportOpen && <Alert severity='error'>{error}</Alert>}
          {showReplies && <Stack spacing={1.5}>
            {replies.map((text, index) => <Typography key={index} sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.default', whiteSpace: 'pre-wrap' }}>{text}</Typography>)}
            <Stack component='form' onSubmit={submitReply} spacing={1}>
              <TextField size='small' multiline label='Write a reply' value={reply} onChange={event => setReply(event.target.value)} inputProps={{ maxLength: 2000 }} disabled={busy} />
              <Button type='submit' variant='contained' disabled={busy || !reply.trim()} sx={{ alignSelf: 'flex-end' }}>Send reply</Button>
            </Stack>
          </Stack>}
        </Stack>
      </CardContent>
      <Dialog open={reportOpen} onClose={busy ? undefined : () => setReportOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Report this post</DialogTitle>
        <DialogContent>
          {error && <Alert severity='error' sx={{ mb: 1 }}>{error}</Alert>}
          <TextField autoFocus label='Reason for reporting' value={concern} onChange={event => setConcern(event.target.value)} disabled={busy} inputProps={{ maxLength: 2000 }} fullWidth multiline minRows={3} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setReportOpen(false)}>Cancel</Button>
          <Button color='error' variant='contained' disabled={busy || !concern.trim()} onClick={sendReport}>Send report</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export { Post }
