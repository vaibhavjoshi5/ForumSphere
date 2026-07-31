import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllSubHubPage, addJoinRequest, leaveSubHub } from '../../services/subgreddiits'
import { getUserFields } from '../../services/userFields'

const AllSubElem = ({ allSubId }) => {
  const user = JSON.parse(window.localStorage.getItem('loggedUser'))
  const navigate = useNavigate()
  const [subPageData, setSubPageData] = useState(null)
  const [userData, setUserData] = useState({})
  const [open, setOpen] = useState(false)
  const [allDisable, setAllDisable] = useState(false)
  const [requestError, setRequestError] = useState('')

  useEffect(
    () => {
      const getSubPageData = async () => {
        const subData = await getAllSubHubPage(user.token, allSubId)
        setSubPageData(subData)
      }
      getSubPageData()

      const getUserDetails = async () => {
        const userDetails = await getUserFields()
        setUserData(userDetails)
      }
      getUserDetails()
    }, [user.token, allSubId])

  const onCardClick = async event => {
    event.preventDefault()
    if (subPageData && (subPageData.isMember || subPageData.creator))
      navigate(`/allsubgreddiits/${allSubId}`)
  }

  const onClose = () => setOpen(false)

  const onRequestJoin = async () => {
    if (userData.left.includes(allSubId)) setOpen(true)
    else {
      try {
        setAllDisable(true)
        setRequestError('')
        const requestedSub = await addJoinRequest(user.token, allSubId)
        setSubPageData(requestedSub)
      } catch (error) {
        setRequestError(error.response?.data?.error || 'Unable to send join request')
      } finally {
        setAllDisable(false)
      }
    }
  }

  const onLeave = async () => {
    setAllDisable(true)
    await leaveSubHub(user.token, allSubId)
    setAllDisable(false)
  }

  return (
    <>
      {
        subPageData ?
          <Card variant='outlined' sx={{ mb: 1, border: 1 }} maxwidth='xs'>
            <Dialog open={open} onClose={onClose}>
              <DialogContent>
                <DialogContentText>
                    You already left/have been removed from "{subPageData.name}"! You cannot rejoin the community!
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={onClose}>Ok</Button>
              </DialogActions>
            </Dialog>
            <CardActionArea onClick={onCardClick}>
              <CardContent>
                <Typography variant='h5' component='div' color='green'>{subPageData.name}</Typography>
                <Typography sx={{ mb: 1.5 }} color='orange'>{subPageData.description}</Typography>
                <Typography variant='body2'>Number of user(s) in community: {subPageData.members + 1}</Typography>
                <Typography variant='body2'>Number of post(s) in community: {subPageData.posts}</Typography>
                <Typography variant='body2'>Banned keywords:</Typography>
                <Typography variant='body2' color='red'>{subPageData.bannedKeywords.join(', ')}</Typography>
              </CardContent>
            </CardActionArea>
            <CardActions>
              {userData.id ?
                (
                  subPageData.creator ?
                    <Button size='small' variant='outlined' color='error' disabled>Leave</Button> :
                    (
                      subPageData.isMember ?
                        <Button size='small' variant='outlined' color='error' disabled={allDisable} onClick={onLeave}>Leave</Button> :
                        <Button size='small' variant='outlined' color='primary' disabled={subPageData.requested || allDisable} onClick={onRequestJoin}>Request Join</Button>
                    )
                ) :
                null}
            </CardActions>
            {requestError && <Typography color='error' sx={{ px: 2, pb: 2 }}>{requestError}</Typography>}
          </Card>
          : null
      }

    </>
  )
}

export { AllSubElem }
