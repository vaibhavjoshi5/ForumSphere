import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getMySubHubPage } from '../../services/subgreddiits'

import Avatar from '@mui/material/Avatar'
import Fab from '@mui/material/Fab'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import PersonIcon from '@mui/icons-material/Person'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import DoneIcon from '@mui/icons-material/Done'
import CloseIcon from '@mui/icons-material/Close'

import { handleJoinRequest } from '../../services/subgreddiits'

const MySubRequests = () => {
  const [mySubPage, setMySubPage] = useState({})
  const [actionDisable, setActionDisable] = useState(false)
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

  const onClick = async (accept, userId) => {
    const action = {
      requestId: userId,
      accept: accept
    }

    setActionDisable(true)
    const updatedSub = await handleJoinRequest(user.token, mySubPage.id, action)
    setMySubPage(updatedSub)
    setActionDisable(false)
  }

  return (
    <>
      {
        mySubPage.id &&
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Card variant='outlined'>
              <CardContent>
                <Typography variant='h5' component='div'>Requests</Typography>
                <List component='div' disablePadding>
                  {
                    mySubPage.requests.map(
                      request => (
                        <ListItem sx={{ pl: 4 }} key={request.userDetails.id}>
                          <ListItemAvatar>
                            <Avatar><PersonIcon /></Avatar>
                          </ListItemAvatar>
                          <ListItemText primary={request.userDetails.userName} />
                          <Fab size='small' disabled={actionDisable} onClick={() => onClick(true, request.userDetails.id)} color='success' sx={{ margin: 1 }}><DoneIcon /></Fab>
                          <Fab size='small' disabled={actionDisable} onClick={() => onClick(false, request.userDetails.id)} color='error' sx={{ margin: 1 }}><CloseIcon /></Fab>
                        </ListItem>
                      )
                    )
                  }
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid >
      }
    </>
  )
}

export { MySubRequests }