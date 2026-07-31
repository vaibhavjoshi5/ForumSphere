import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import { getMySubHubPage } from '../../services/subgreddiits'

const StatCard = ({ label, value }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography color='text.secondary'>{label}</Typography>
      <Typography variant='h3' sx={{ fontWeight: 700, color: '#667eea' }}>{value}</Typography>
    </CardContent>
  </Card>
)

const MySubStats = () => {
  const [community, setCommunity] = useState(null)
  const [error, setError] = useState('')
  const params = useParams()
  const user = JSON.parse(window.localStorage.getItem('loggedUser'))

  useEffect(() => {
    getMySubHubPage(user.token, params.id)
      .then(setCommunity)
      .catch(exception => setError(exception.response?.data?.error || 'Unable to load community statistics'))
  }, [params.id, user.token])

  if (error)
    return <Alert severity='error' sx={{ m: 3 }}>{error}</Alert>

  if (!community)
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>

  const stats = [
    { label: 'Total members', value: community.members.length + 1 },
    { label: 'Published posts', value: community.posts.length },
    { label: 'Pending requests', value: community.requests.length },
    { label: 'Blocked users', value: community.blocked.length },
    { label: 'Open reports', value: community.reports.length }
  ]

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' sx={{ color: 'white', mb: 3, fontWeight: 700 }}>
        {community.name} statistics
      </Typography>
      <Grid container spacing={3}>
        {stats.map(stat => (
          <Grid item xs={12} sm={6} md={4} key={stat.label}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export { MySubStats }
