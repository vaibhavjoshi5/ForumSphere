import { useState } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import AddRounded from '@mui/icons-material/AddRounded'
import { createNewPost } from '../../services/posts'

const maxLength = 5000

const NewPost = ({ communityId, token, onPublished }) => {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const close = () => {
    setOpen(false)
    setError('')
  }

  const submit = async event => {
    event.preventDefault()
    if (busy || !text.trim() || text.length > maxLength) return

    setBusy(true)
    setError('')
    try {
      await createNewPost(token, { subId: communityId, text: text.trim() })
      setText('')
      close()
      onPublished()
    } catch (failure) {
      setError(failure.response?.data?.error || 'Could not publish your post. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Button variant='contained' startIcon={<AddRounded />} onClick={() => setOpen(true)}>New post</Button>
      <Dialog open={open} onClose={busy ? undefined : close} fullWidth maxWidth='sm' aria-labelledby='new-post-title'>
        <form onSubmit={submit}>
          <DialogTitle id='new-post-title'>Start a discussion</DialogTitle>
          <DialogContent>
            {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}
            <TextField autoFocus fullWidth multiline minRows={5} label='Your post' value={text} disabled={busy}
              inputProps={{ maxLength }} helperText={text.length + ' / ' + maxLength}
              onChange={event => setText(event.target.value)} sx={{ mt: 1 }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={close} disabled={busy}>Cancel</Button>
            <Button type='submit' variant='contained' disabled={busy || !text.trim()}>{busy ? 'Publishing...' : 'Publish post'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}

export { NewPost }
