import { Link } from 'react-router-dom'
import { Alert, Button, Paper, Skeleton, Stack, Typography } from '@mui/material'
import { PostFilters, usePostFilters } from '../PostFilters'
import { Post } from '../Post'
import { usePostProfile } from '../usePostProfile'

const SavedPosts = () => {
  const { profile, error, retry, onSaveChange, onFollowChange } = usePostProfile()

  const posts = profile?.saved?.slice().reverse() || []
  const { filtered, controls } = usePostFilters(posts)

  return (
    <Stack spacing={2} sx={{ maxWidth: 780, mx: 'auto' }}>
      <Typography component='h1' variant='h4' fontWeight={800}>Saved posts</Typography>
      <Typography color='text.secondary'>Revisit discussions you bookmarked.</Typography>
      {error ? <Alert severity='error' action={<Button color='inherit' onClick={retry}>Retry</Button>}>Could not load saved posts.</Alert> :
        !profile ? <Skeleton variant='rounded' height={160} /> :
          posts.length ? <>
            <PostFilters {...controls} />
            {filtered.map(post => <Post key={post.id} post={post} profile={profile} onSaveChange={onSaveChange} onFollowChange={onFollowChange} />)}
            {!filtered.length && <Alert severity='info'>No saved posts match your search.</Alert>}
          </> :
            <Paper variant='outlined' sx={{ p: 4, textAlign: 'center' }}>
              <Typography fontWeight={700}>No saved posts yet</Typography>
              <Button component={Link} to='/allsubgreddiits'>Discover communities</Button>
            </Paper>}
    </Stack>
  )
}

export { SavedPosts }
