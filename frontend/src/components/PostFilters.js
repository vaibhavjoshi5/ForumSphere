import { useSearchParams } from 'react-router-dom'
import { Button, InputAdornment, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material'
import SearchRounded from '@mui/icons-material/SearchRounded'

const usePostFilters = posts => {
  const [params, setParams] = useSearchParams()
  const search = params.get('q') || ''
  const sort = params.get('sort') === 'discussed' ? 'discussed' : 'recent'
  const update = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }
  const query = search.trim().toLowerCase()
  const filtered = posts.filter(post => !query ||
    [post.text, post.postedBy?.userName].some(value => value?.toLowerCase().includes(query))
  )
  if (sort === 'discussed') filtered.sort((a, b) => (b.replies?.length || 0) - (a.replies?.length || 0))

  return {
    filtered,
    controls: {
      search, sort, count: filtered.length,
      onSearch: value => update('q', value),
      onSort: value => update('sort', value === 'recent' ? '' : value)
    }
  }
}

const PostFilters = ({ search, sort, count, onSearch, onSort }) => (
  <Paper variant='outlined' sx={{ p: 1.75 }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
      <TextField fullWidth size='small' label='Search posts' value={search} onChange={event => onSearch(event.target.value)}
        InputProps={{
          startAdornment: <InputAdornment position='start'><SearchRounded fontSize='small' /></InputAdornment>,
          endAdornment: search && <InputAdornment position='end'><Button size='small' onClick={() => onSearch('')}>Clear</Button></InputAdornment>
        }} />
      <TextField select size='small' label='Sort posts' value={sort} onChange={event => onSort(event.target.value)} sx={{ minWidth: 168 }}>
        <MenuItem value='recent'>Most recent</MenuItem>
        <MenuItem value='discussed'>Most discussed</MenuItem>
      </TextField>
    </Stack>
    <Typography role='status' variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
      {count} {count === 1 ? 'post' : 'posts'}
    </Typography>
  </Paper>
)

export { PostFilters, usePostFilters }
