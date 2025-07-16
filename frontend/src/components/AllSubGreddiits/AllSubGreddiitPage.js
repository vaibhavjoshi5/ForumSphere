import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMySubHubPage } from '../../services/subgreddiits'
import { Post } from '../Post'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import { NewPost } from './NewPost'

const AllSubGreddiitPage = () => {
  const [subPage, setSubPage] = useState({})
  const params = useParams()
  const navigate = useNavigate()
  const user = JSON.parse(window.localStorage.getItem('loggedUser'))

  useEffect(
    () => {
      const getSubPageData = async () => {
        let subData = null
        try {
          subData = await getMySubHubPage(user.token, params.id)
          setSubPage(subData)
        } catch (exception) {
          if (exception.response.data.error) navigate('/allsubgreddiits')
        }
      }
      getSubPageData()
    }, [user.token, params.id, navigate])

  return (
    <div>
      {
        subPage.id ?
          <>
            <Card sx={{ display: 'flex' }}>
              <CardMedia
                component='img'
                sx={{ width: 250 }}
                image={subPage.imageUrl === '' ? require('../../static/images/reddit.png') : subPage.imageUrl}
                alt='Random reddit image'
              />
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                  <Typography component='div' variant='h5'>
                    {subPage.name}
                  </Typography>
                  <Typography variant='subtitle1' color='text.secondary' component='div'>
                    {subPage.description}
                  </Typography>
                </CardContent>
              </Box>
            </Card>
            <Grid container spacing={2}>
              {
                subPage.posts
                  .map(post => <Grid key={post.id} item xs={11}><Post post={post} /></Grid>)
              }
            </Grid>
            <NewPost subPage={subPage} userToken={user.token} setSubPage={setSubPage} />
          </>
          : null
      }
    </div >
  )
}

export { AllSubGreddiitPage }