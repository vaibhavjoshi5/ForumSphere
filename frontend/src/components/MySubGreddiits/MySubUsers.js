import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import PersonIcon from '@mui/icons-material/Person'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMySubHubPage } from '../../services/subgreddiits'

const MySubUsers = () => {
  const [mySubPage, setMySubPage] = useState({})
  const params = useParams()
  const user = JSON.parse(window.localStorage.getItem('loggedUser'))

  useEffect(
    () => {
      const getSubPage = async () => {
        const mySubDetails = await getMySubHubPage(user.token, params.id)
        setMySubPage(mySubDetails)
      }

      getSubPage()
    }, [user.token, params.id]
  )

  return (
    <>
      {
        mySubPage.id ?
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card variant='outlined'>
                <CardContent>
                  <Typography variant='h5' component='div'>Regular users</Typography>
                  <List component='div' disablePadding>
                    <ListItem sx={{ pl: 4 }}>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon color='success' />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={mySubPage.creator.userName} />
                    </ListItem>
                    {
                      mySubPage.members.map(
                        member => (
                          <ListItem sx={{ pl: 4 }} key={member.id}>
                            <ListItemAvatar>
                              <Avatar>
                                <PersonIcon color='primary' />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={member.userName} />
                          </ListItem>
                        )
                      )
                    }
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card variant='outlined'>
                <CardContent>
                  <Typography variant='h5' component='div'>Blocked users</Typography>
                  {
                    mySubPage.blocked.map(
                      blockedUser => (
                        <ListItem sx={{ pl: 4 }} key={blockedUser.id}>
                          <ListItemAvatar>
                            <Avatar>
                              <PersonIcon color='error' />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary={blockedUser.userName} />
                        </ListItem>
                      )
                    )
                  }
                </CardContent>
              </Card>
            </Grid>
          </Grid >
          : null
      }
    </>
  )
}

export { MySubUsers }