import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Avatar, Box, Button, Card, CardActions, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, Typography } from '@mui/material'
import GroupOutlined from '@mui/icons-material/GroupOutlined'
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded'
import { addJoinRequest, leaveSubHub } from '../../services/subgreddiits'

const AllSubElem = ({ community, token, onUpdate }) => {
  const [busy, setBusy] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [error, setError] = useState('')
  const { id, name, description, members, posts, tags, creator, isMember, requested, cannotRejoin } = community

  const changeMembership = async () => {
    setBusy(true)
    setError('')
    try {
      if (isMember) {
        const updated = await leaveSubHub(token, id)
        onUpdate(id, { isMember: false, cannotRejoin: true, members: updated.members.length })
        setConfirmLeave(false)
      } else {
        await addJoinRequest(token, id)
        onUpdate(id, { requested: true })
      }
    } catch (failure) {
      setError(failure.response?.data?.error || 'Could not update membership. Try again.')
      setConfirmLeave(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card variant='outlined' component='article' sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, overflowWrap: 'anywhere' }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={1} sx={{ mb: 2 }}>
          <Avatar sx={{ bgcolor: '#e4f2e9', color: 'primary.main', fontWeight: 800 }}>{name.slice(0, 2).toUpperCase()}</Avatar>
          {(creator || isMember || requested) && <Chip size='small' label={creator ? 'Owner' : isMember ? 'Member' : 'Request pending'} />}
        </Stack>
        <Typography component='h3' variant='h6' fontWeight={800}>{name}</Typography>
        <Typography color='text.secondary' sx={{ mt: 0.5, mb: 2 }}>{description || 'No description yet.'}</Typography>
        <Stack direction='row' flexWrap='wrap' gap={2} color='text.secondary' sx={{ fontSize: '0.875rem' }}>
          <Stack direction='row' alignItems='center' spacing={0.5}><GroupOutlined fontSize='small' /><span>{members + 1} members</span></Stack>
          {typeof posts === 'number' && <Stack direction='row' alignItems='center' spacing={0.5}><ChatBubbleOutlineRounded fontSize='small' /><span>{posts} posts</span></Stack>}
        </Stack>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 2 }}>
          {tags?.map(tag => <Chip key={tag} size='small' label={tag} variant='outlined' />)}
        </Box>
        {error && <Alert severity='error' sx={{ mt: 2 }}>{error}</Alert>}
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        {(creator || isMember) && <Button component={Link} to={'/allsubgreddiits/' + id} variant='contained' size='small'>Open community</Button>}
        {isMember && !creator && <Button size='small' disabled={busy} onClick={() => setConfirmLeave(true)}>Leave</Button>}
        {!creator && !isMember && <Button variant='outlined' size='small' disabled={busy || requested || cannotRejoin} onClick={changeMembership}>
          {requested ? 'Request sent' : cannotRejoin ? 'Rejoining unavailable' : busy ? 'Sending…' : 'Request to join'}
        </Button>}
      </CardActions>
      <Dialog open={confirmLeave} onClose={busy ? undefined : () => setConfirmLeave(false)} aria-labelledby={'leave-' + id}>
        <DialogTitle id={'leave-' + id}>Leave {name}?</DialogTitle>
        <DialogContent><DialogContentText>Once you leave, you cannot rejoin this community.</DialogContentText></DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setConfirmLeave(false)}>Cancel</Button>
          <Button color='error' disabled={busy} onClick={changeMembership}>{busy ? 'Leaving…' : 'Leave community'}</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export { AllSubElem }
