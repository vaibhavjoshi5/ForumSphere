import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Alert, Box, Button, Chip, Grid, InputAdornment, MenuItem, Paper, Skeleton, Stack, TextField, Typography } from '@mui/material'
import SearchRounded from '@mui/icons-material/SearchRounded'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import HubOutlined from '@mui/icons-material/HubOutlined'
import Fuse from 'fuse.js'
import { getAllSubHubs } from '../../services/subgreddiits'
import { AllSubElem } from './AllSubElem'

const sorts = {
  popular: (a, b) => b.members - a.members,
  newest: (a, b) => new Date(b.creationDate) - new Date(a.creationDate),
  oldest: (a, b) => new Date(a.creationDate) - new Date(b.creationDate),
  name: (a, b) => a.name.localeCompare(b.name),
  reverse: (a, b) => b.name.localeCompare(a.name)
}

const AllSubGreddiits = () => {
  const { token } = JSON.parse(localStorage.getItem('loggedUser'))
  const [communities, setCommunities] = useState(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [params, setParams] = useSearchParams()
  const search = params.get('q') || ''
  const scope = params.get('membership') || 'all'
  const sort = Object.hasOwn(sorts, params.get('sort')) ? params.get('sort') : 'popular'
  const selectedTags = params.getAll('tag')

  const updateFilters = (key, values) => {
    const next = new URLSearchParams(params)
    next.delete(key)
    values.filter(Boolean).forEach(value => next.append(key, value))
    setParams(next, { replace: true })
  }

  useEffect(() => {
    let active = true
    getAllSubHubs(token).then(data => {
      if (active) setCommunities(data)
    }).catch(() => {
      if (active) setError(true)
    })
    return () => { active = false }
  }, [token, attempt])

  const all = communities || []
  const tags = [...new Set(all.flatMap(community => community.tags || []))].sort()
  const filtered = all.filter(community =>
    (scope === 'joined' ? community.creator || community.isMember :
      scope === 'pending' ? community.requested && !community.creator && !community.isMember : true) &&
    (!selectedTags.length || community.tags?.some(tag => selectedTags.includes(tag)))
  )
  const toggleTag = tag => updateFilters('tag', selectedTags.includes(tag)
    ? selectedTags.filter(label => label !== tag)
    : [...selectedTags, tag])
  const query = search.trim()
  const matches = query
    ? new Fuse(filtered, { keys: ['name', 'description', 'tags'], threshold: 0.35 }).search(query).map(({ item }) => item)
    : filtered
  const results = [...matches].sort(sorts[sort])

  const updateCommunity = (id, changes) => setCommunities(current => current.map(community =>
    community.id === id ? { ...community, ...changes } : community
  ))

  return (
    <Stack spacing={3}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, bgcolor: '#152e29', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <HubOutlined aria-hidden='true' sx={{ position: 'absolute', right: { xs: -32, md: 40 }, top: 0, fontSize: 280, opacity: 0.1 }} />
        <Stack spacing={2} alignItems='flex-start' sx={{ position: 'relative' }}>
          <Typography variant='overline' sx={{ color: '#a7e6cc', letterSpacing: '0.2em' }}>ForumSphere / Discover</Typography>
          <Typography component='h1' variant='h2' sx={{ fontSize: { xs: '2.35rem', md: '3.75rem' }, letterSpacing: '-0.055em' }}>Find your people.</Typography>
          <Typography sx={{ maxWidth: 460, color: '#c8ddd5' }}>Explore communities built around the things you care about, or start one of your own.</Typography>
          <Button component={Link} to='/mysubgreddiits' variant='contained' endIcon={<ArrowForwardRounded />} sx={{ bgcolor: '#c5f4a2', color: '#152e29', '&:hover': { bgcolor: '#afe78a' } }}>Manage communities</Button>
        </Stack>
      </Paper>
      <Paper variant='outlined' sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField fullWidth size='small' label='Search communities' value={search} onChange={event => updateFilters('q', [event.target.value])}
            InputProps={{ startAdornment: <InputAdornment position='start'><SearchRounded /></InputAdornment> }} />
          <TextField select size='small' label='Membership' value={['joined', 'pending'].includes(scope) ? scope : 'all'} onChange={event => updateFilters('membership', [event.target.value === 'all' ? '' : event.target.value])} sx={{ minWidth: 160 }}>
            <MenuItem value='all'>All communities</MenuItem>
            <MenuItem value='joined'>Joined or owned</MenuItem>
            <MenuItem value='pending'>Pending requests</MenuItem>
          </TextField>
          <TextField select size='small' label='Sort by' value={sort} onChange={event => updateFilters('sort', [event.target.value])} sx={{ minWidth: 155 }}>
            <MenuItem value='popular'>Most members</MenuItem>
            <MenuItem value='newest'>Newest</MenuItem>
            <MenuItem value='oldest'>Oldest</MenuItem>
            <MenuItem value='name'>Name A–Z</MenuItem>
            <MenuItem value='reverse'>Name Z–A</MenuItem>
          </TextField>
        </Stack>
        {tags.length > 0 && <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          {tags.map(label => <Chip key={label} label={label} onClick={() => toggleTag(label)} aria-pressed={selectedTags.includes(label)} color={selectedTags.includes(label) ? 'primary' : 'default'} variant={selectedTags.includes(label) ? 'filled' : 'outlined'} />)}
        </Box>}
      </Paper>
      <Stack direction='row' alignItems='baseline' justifyContent='space-between' gap={2}>
        <Typography component='h2' variant='h5' fontWeight={800}>Community directory</Typography>
        {communities && <Typography role='status' color='text.secondary'>{results.length} found</Typography>}
      </Stack>
      {error ? <Alert severity='error' action={<Button color='inherit' onClick={() => { setError(false); setAttempt(attempt + 1) }}>Retry</Button>}>Could not load communities.</Alert> :
        !communities ? <Skeleton variant='rounded' height={180} aria-label='Loading communities' /> :
          results.length ? <Grid container spacing={2}>
            {results.map(community => <Grid key={community.id} item xs={12} sm={6} md={4}><AllSubElem community={community} token={token} onUpdate={updateCommunity} /></Grid>)}
          </Grid> : <Paper variant='outlined' sx={{ p: 4, textAlign: 'center' }}>
            <Typography fontWeight={700}>{all.length ? 'No communities match your filters' : 'No communities yet'}</Typography>
            {all.length > 0 && <Button onClick={() => setParams({}, { replace: true })}>Clear filters</Button>}
          </Paper>}
    </Stack>
  )
}

export { AllSubGreddiits }
