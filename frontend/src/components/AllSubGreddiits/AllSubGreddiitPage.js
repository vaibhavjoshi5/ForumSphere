import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Button, Card, CardContent, Skeleton, Stack, Typography } from '@mui/material'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import { getCommunityFeed } from '../../services/subgreddiits'
import { usePostProfile } from '../usePostProfile'
import { PostFilters, usePostFilters } from '../PostFilters'
import { Post } from '../Post'
import { NewPost } from './NewPost'

const AllSubGreddiitPage = () => {
  const { id } = useParams()
  const { profile, error: profileError, retry, onSaveChange, onFollowChange } = usePostProfile()
  const { token } = JSON.parse(localStorage.getItem('loggedUser'))
  const [result, setResult] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    getCommunityFeed(token, id).then(community => {
      if (active) setResult({ id, community })
    }).catch(error => {
      if (active) setResult({ id, error: error.response?.data?.error || 'Could not load this community.' })
    })
    return () => { active = false }
  }, [token, id, attempt])

  const refresh = () => {
    setResult(null)
    setAttempt(current => current + 1)
  }

  const current = result?.id === id ? result : null
  const posts = current?.community?.posts.slice().reverse() || []
  const { filtered, controls } = usePostFilters(posts)
  return (
    <Stack spacing={2} sx={{ maxWidth: 780, mx: 'auto' }}>
      <Button component={Link} to='/allsubgreddiits' startIcon={<ArrowBackRounded />} sx={{ alignSelf: 'flex-start' }}>Discover communities</Button>
      {!current ? <Skeleton variant='rounded' height={180} /> : current.error ?
        <Alert severity='error' action={<Button color='inherit' onClick={refresh}>Retry</Button>}>{current.error}</Alert> :
        <>
          <Card sx={{ bgcolor: '#152e29', color: '#fff' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant='overline' sx={{ color: '#a7e6cc' }}>Community</Typography>
              <Typography component='h1' variant='h4' fontWeight={800} sx={{ overflowWrap: 'anywhere' }}>{current.community.name}</Typography>
              <Typography sx={{ mt: 1, color: '#c8ddd5', overflowWrap: 'anywhere' }}>{current.community.description}</Typography>
            </CardContent>
          </Card>
          <Stack direction='row' alignItems='center' justifyContent='space-between' gap={2}>
            <Typography component='h2' variant='h6' fontWeight={800}>Discussions</Typography>
            <NewPost key={id} communityId={id} token={token} onPublished={refresh} />
          </Stack>
          {profileError && <Alert severity='warning' action={<Button color='inherit' onClick={retry}>Retry</Button>}>Could not load your bookmarks or follows.</Alert>}
          {posts.length > 0 && <PostFilters {...controls} />}
          {filtered.map(post => <Post key={post.id} post={post} profile={profile} onSaveChange={onSaveChange} onFollowChange={onFollowChange} />)}
          {!filtered.length && <Alert severity='info'>{posts.length ? 'No discussions match your search.' : 'No discussions yet. Start with a question or something worth sharing.'}</Alert>}
        </>}
    </Stack>
  )
}

export { AllSubGreddiitPage }
