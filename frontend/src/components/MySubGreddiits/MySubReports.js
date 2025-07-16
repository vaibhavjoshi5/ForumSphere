import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import ReportOffOutlinedIcon from '@mui/icons-material/ReportOffOutlined'
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'

import { getMySubHubPageReports } from '../../services/subgreddiits'
import { handleReport } from '../../services/posts'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'

const Report = ({ report, reportData, userToken }) => {
  const [ignoreReport, setIgnoreReport] = useState(false)
  const [blockUser, setBlockUser] = useState(false)
  const [deletePost, setDeletePost] = useState(false)
  const [ignoreDisable, setIgnoreDisable] = useState(false)
  const [deleteDisable, setDeleteDisable] = useState(false)
  const [blockDisable, setBlockDisable] = useState(false)
  const [onCancel, setOnCancel] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [cancelText, setCancelText] = useState('Block User')

  const onAction = useCallback(async (action) => {
    if (report.action === '') {
      const reportAction = { ...report, postId: report.postId.id, reportedBy: report.reportedBy.id, reportedUser: report.reportedUser.id }
      reportAction.action = action
      setButtons()

      const subData = { ...reportData }
      subData.reports = subData.reports.map(report => report.id !== reportAction.id ? report : reportAction)
      await handleReport(userToken, reportData.id, reportAction)

      if (action === 'Ignore') setIgnore()
      else if (action === 'Block User') setBlock()
      else if (action === 'Delete Post') setDelete()
    }
  }, [report, reportData, userToken])

  useEffect(() => {
    if (timeLeft) {
      if (timeLeft === 3) setCancelText('Cancel in 3 seconds')

      const cancelId = setTimeout(() => {
        if (timeLeft === 3) setCancelText(`Cancel in ${timeLeft - 1} seconds`)
        else if (timeLeft === 2) setCancelText(`Cancel in ${timeLeft - 1} second`)
        else {
          setCancelText('Block User')
          setOnCancel(false)
          onAction('Block User')
        }
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(cancelId)
    }
  }, [timeLeft, onAction])

  const handleBlock = () => {
    const cancelVal = onCancel
    setOnCancel(!onCancel)
    if (cancelVal) {
      setTimeLeft(0)
      setCancelText('Block User')
    }
    else setTimeLeft(3)
  }

  const setButtons = () => {
    setIgnoreReport(false)
    setBlockUser(false)
    setDeletePost(false)
    setIgnoreDisable(true)
    setDeleteDisable(true)
    setBlockDisable(true)
  }

  const setIgnore = () => {
    setIgnoreReport(true)
    setIgnoreDisable(false)
  }

  const setDelete = () => {
    setDeletePost(true)
    setDeleteDisable(false)
  }

  const setBlock = () => {
    setBlockUser(true)
    setBlockDisable(false)
  }

  return (
    <Grid item xs={2} sm={4} md={4}>
      <Card variant='outlined' sx={{ mb: 1, border: 1 }} maxwidth='xs'>
        <CardActionArea>
          <CardContent>
            <Typography variant='h6' color='red'>Post: "{report.postId.text}"</Typography>
            <Typography variant='h6' color='orange'>Concern: "{report.concern}"</Typography>
            <Typography variant='body2' color='blue'>Reported By: "{report.reportedBy.userName}"</Typography>
            <Typography variant='body2' color='blue'>Reported User: "{report.reportedUser.userName}"</Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Button variant={ignoreReport || report.action === 'Ignore' ? 'contained' : 'outlined'} color='success' onClick={() => onAction('Ignore')}
            disabled={ignoreDisable || report.action === 'Block User' || report.action === 'Delete Post'}><ReportOffOutlinedIcon sx={{ mr: 1 }} />Ignore</Button>
          <Button variant={deletePost || report.action === 'Delete Post' ? 'contained' : 'outlined'} color='warning' onClick={() => onAction('Delete Post')}
            disabled={deleteDisable || report.action === 'Ignore' || report.action === 'Block User'}><BookmarkRemoveIcon sx={{ mr: 1 }} />Delete Post</Button>
          <Button variant={blockUser || report.action === 'Block User' ? 'contained' : 'outlined'} color='error' onClick={handleBlock}
            disabled={blockDisable || report.action === 'Ignore' || report.action === 'Delete Post'}><PersonRemoveIcon sx={{ mr: 1 }} />{cancelText}</Button>
        </CardActions>
      </Card>
    </Grid>
  )
}

const MySubReports = () => {
  const [reportData, setReportData] = useState(null)

  const user = JSON.parse(window.localStorage.getItem('loggedUser'))
  const params = useParams()

  useEffect(
    () => {
      const getReportData = async () => {
        const reportDetails = await getMySubHubPageReports(user.token, params.id)
        setReportData(reportDetails)
      }

      getReportData()
    }, [user.token, params.id]
  )

  const ignoreSort = (reportA, reportB) => {
    if (reportA.action === '' && reportB.action !== '') return -1
    else if (reportA.action !== '' && reportB.action === '') return 1
    else return 0
  }

  return (
    <>
      {
        reportData ?
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {
              reportData.reports.sort(ignoreSort).map(report =>
                <Report key={report.id} report={report} reportData={reportData} userToken={user.token} />
              )
            }
          </Grid>
          : null
      }
    </>
  )
}

export { MySubReports }