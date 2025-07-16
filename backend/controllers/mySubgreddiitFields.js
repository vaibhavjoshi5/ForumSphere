const mySubgreddiitRouter = require('express').Router()
const Report = require('../models/report')
const mySubgreddiit = require('../models/subGreddiit')
const User = require('../models/user')
const Post = require('../models/post')
const config = require('../utils/config')
const mailer = require('../utils/mailer')

mySubgreddiitRouter.get('/', async (request, response) => {
  const mySubGreddiits = await mySubgreddiit.find({ creator: request.user.id })
  response.status(200).json(mySubGreddiits)
})

mySubgreddiitRouter.get('/:id', async (request, response) => {
  const mySubGreddiitPage = await mySubgreddiit.findById(request.params.id).populate('requests').populate('reports')

  if (request.user.id === mySubGreddiitPage.creator.toString() || mySubGreddiitPage.members.find(member => member.toString() === request.user.id) !== undefined) {
    const presentDate = new Date()
    mySubGreddiitPage.requests = mySubGreddiitPage.requests.filter(request => presentDate.getTime() - request.requestDate.getTime() <= config.REQUEST_EXPIRATION_DAYS || !request.rejected)
    mySubGreddiitPage.reports = mySubGreddiitPage.reports.filter(report => presentDate.getTime() - report.reportedDate.getTime() <= config.REPORT_EXPIRATION_DAYS)
    const updatedMySubGreddiitPage = await mySubgreddiit.findByIdAndUpdate(request.params.id, mySubGreddiitPage, { new: true })
      .populate('creator').populate('members').populate('blocked').populate('reports')
      .populate({
        path: 'requests',
        populate: {
          path: 'userDetails',
          model: 'User'
        }
      }).populate({
        path: 'posts',
        populate: {
          path: 'postedBy',
          model: 'User'
        }
      })
    updatedMySubGreddiitPage.requests = updatedMySubGreddiitPage.requests.filter(request => !request.rejected)

    updatedMySubGreddiitPage.posts = updatedMySubGreddiitPage.posts.map(post => {
      if (updatedMySubGreddiitPage.blocked.find(block => block.id.toString() === post.postedBy.id.toString()) !== undefined)
        post.postedBy.userName = 'Blocked User'
      return post
    })

    response.status(200).json(updatedMySubGreddiitPage)
  } else
    response.status(404).json({ error: 'Invalid user' }).end()
})

mySubgreddiitRouter.get('/:id/reports', async (request, response) => {
  const mySubGreddiitPage = await mySubgreddiit.findById(request.params.id).populate('requests').populate('reports')

  if (request.user.id === mySubGreddiitPage.creator.toString() || mySubGreddiitPage.members.find(member => member.toString() === request.user.id) !== undefined) {
    const presentDate = new Date()
    mySubGreddiitPage.requests = mySubGreddiitPage.requests.filter(request => presentDate.getTime() - request.requestDate.getTime() <= config.REQUEST_EXPIRATION_DAYS || !request.rejected)
    mySubGreddiitPage.reports = mySubGreddiitPage.reports.filter(report => presentDate.getTime() - report.reportedDate.getTime() <= config.REPORT_EXPIRATION_DAYS)
    const updatedMySubGreddiitPage = await mySubgreddiit.findByIdAndUpdate(request.params.id, mySubGreddiitPage, { new: true })
      .populate('creator').populate('members').populate('blocked').populate('reports')
      .populate({
        path: 'requests',
        populate: {
          path: 'postedBy',
          model: 'User'
        }
      }).populate({
        path: 'posts',
        populate: {
          path: 'postedBy',
          model: 'User'
        }
      }).populate({
        path: 'reports',
        populate: [
          {
            path: 'reportedBy',
            model: 'User',
          },
          {
            path: 'reportedUser',
            model: 'User'
          },
          {
            path: 'postId',
            model: 'Post'
          }
        ]
      })
    updatedMySubGreddiitPage.requests = updatedMySubGreddiitPage.requests.filter(request => !request.rejected)

    if (request.user.id !== updatedMySubGreddiitPage.creator.id.toString())
      updatedMySubGreddiitPage.posts = updatedMySubGreddiitPage.posts.map(post => {
        const retPost = { ...post }
        if (updatedMySubGreddiitPage.blocked.find(block => block.id.toString() === post.postedBy.id.toString()) !== undefined)
          retPost.postedBy.userName = 'Blocked User'
        return retPost
      })

    response.status(200).json(updatedMySubGreddiitPage)
  } else
    response.status(404).json({ error: 'Invalid user' }).end()
})

mySubgreddiitRouter.post('/', async (request, response) => {
  const body = request.body
  const user = request.user

  const newMySubGreddiit = new mySubgreddiit({
    name: body.name,
    description: body.description,
    tags: body.tags || [],
    bannedKeywords: body.bannedKeywords || [],
    creator: user.id || '',
    members: body.members || [],
    blocked: body.blocked || [],
    requests: body.requests || [],
    posts: body.posts || [],
    reports: body.reports || [],
    creationDate: new Date(),
    imageUrl: body.imageUrl || ''
  })

  const createdMySubgreddiit = await newMySubGreddiit.save()
  user.owner = user.owner.concat(createdMySubgreddiit.id)
  await user.save()

  response.status(201).json(createdMySubgreddiit)
})

mySubgreddiitRouter.put('/:id', async (request, response) => {
  const user = request.user
  const subId = request.params.id

  const leaveSub = await mySubgreddiit.findById(subId)

  if (leaveSub.creator.toString() !== user.id.toString() && leaveSub.members.find(member => member.toString() === user.id.toString()) !== undefined) {
    user.left = user.left.concat(subId)
    user.saved = user.saved.filter(savedPost => !leaveSub.posts.includes(savedPost.id))
    await user.save()

    leaveSub.members = leaveSub.members.filter(member => member.toString() !== request.user.id.toString())
    const leftSub = await mySubgreddiit.findByIdAndUpdate(leaveSub.id, leaveSub, { new: true })
    response.status(200).json(leftSub)
  } else
    response.status(403).json({ error: 'User not permitted/eligible to leave subgreddiit' }).end()
})

mySubgreddiitRouter.delete('/:id', async (request, response) => {
  const user = request.user
  const subId = request.params.id

  const deleteSub = await mySubgreddiit.findById(subId)

  if (deleteSub.creator.toString() === user.id.toString()) {
    const users = await User.find({})
    users.forEach(async user => {
      user.saved = user.saved.filter(savedPost => !deleteSub.posts.includes(savedPost))
      user.left = user.left.filter(leftSub => leftSub.toString() !== deleteSub.id.toString())
      await user.save()
    })

    user.owner = user.owner.filter(ownedSub => ownedSub.toString() !== deleteSub.id)

    deleteSub.posts.forEach(async post => await Post.findByIdAndDelete(post))
    deleteSub.reports.forEach(async report => await Report.findByIdAndDelete(report))

    await mySubgreddiit.findByIdAndDelete(deleteSub.id)

    response.status(200)
  } else
    response.status(403).json({ error: 'Invalid user! Not enough permissions' }).end()
})

mySubgreddiitRouter.post('/:id/requests', async (request, response) => {
  const user = request.user
  const subId = request.params.id

  const requestSub = await mySubgreddiit.findById(subId)

  if (requestSub.creator.toString() !== user.id.toString() && requestSub.members.find(member => member.toString() === user.id.toString()) === undefined) {
    const newRequest = {
      userDetails: user.id,
      requestDate: new Date(),
      rejected: false
    }

    const existingRequest = requestSub.requests.find(id => id.userId === newRequest.userId)

    if (!existingRequest) {
      requestSub.requests = requestSub.requests.concat(newRequest)
      const returnedSub = await requestSub.save()
      const responseObj = {
        name: returnedSub.name,
        description: returnedSub.description,
        creator: request.user.id === returnedSub.creator.toString(),
        members: returnedSub.members.length,
        isMember: returnedSub.members.includes(request.user.id),
        posts: returnedSub.posts.length,
        bannedKeywords: returnedSub.bannedKeywords,
        requested: returnedSub.requests.find(subRequest => subRequest.userDetails.toString() === request.user.id) !== undefined
      }
      response.status(201).json(responseObj)
    } else
      response.status(200).json()
  } else
    response.status(400).json({ error: 'You are already a member of the subgreddiit!' }).end()
})

mySubgreddiitRouter.put('/:id/requests', async (request, response) => {
  const user = request.user
  const subId = request.params.id

  const requestSub = await mySubgreddiit.findById(subId)

  if (requestSub.creator.toString() === user.id) {
    const reqId = request.body.requestId
    const accept = request.body.accept

    if (accept) {
      requestSub.requests = requestSub.requests.filter(request => request.userDetails.toString() !== reqId)
      if (!requestSub.members.find(person => person.toString() === reqId))
        requestSub.members = requestSub.members.concat(reqId)
    } else {
      const req = requestSub.requests.find(request => request.userDetails.toString() === reqId)
      req.rejected = true
      requestSub.requests = requestSub.requests.map(request => request.userId !== reqId ? request : req)
    }
    const returnedSub = await requestSub.save()
    response.status(200).json(returnedSub)
  } else
    response.status(403).json({ error: 'Cannot take action on requests without being the moderator of the subgreddiit!' }).end()
})

mySubgreddiitRouter.put('/:id/reports', async (request, response) => {
  const subId = request.params.id
  const reportObj = request.body

  const reportSub = await mySubgreddiit.findById(subId).populate('reports')
  const savedReport = await Report.findByIdAndUpdate(reportObj.id, reportObj, { new: true })
  const reportedPost = await Post.findById(savedReport.postId)
  const reportedUser = await User.findById(savedReport.reportedUser)

  if (reportSub.creator.toString() === request.user.id) {
    if (savedReport.action === 'Block User') {
      if (reportSub.blocked.find(block => block.toString() === savedReport.reportedUser.toString()) === undefined)
        reportSub.blocked = reportSub.blocked.concat(savedReport.reportedUser)

      reportSub.members = reportSub.members.filter(member => member.toString() !== savedReport.reportedUser.toString())

      if (reportedUser.left.find(leftSub => leftSub.toString() === reportSub.id.toString()) === undefined)
        reportedUser.left = reportedUser.left.concat(reportSub.id)
      reportedUser.saved = reportedUser.saved.filter(savedPost => reportSub.posts.find(post => post.toString() === savedPost.toString()) === undefined)
      await reportedUser.save()
    }

    else if (savedReport.action === 'Delete Post') {
      const users = await User.find({})
      users.forEach(async user => {
        user.saved = user.saved.filter(savedPost => savedPost.toString() !== savedReport.postId.toString())
        await user.save()
      })

      reportSub.posts = reportSub.posts.filter(post => post.toString() !== savedReport.postId.toString())
      await reportSub.save()

      await Post.findByIdAndDelete(savedReport.postId)
    }

    const findReport = reportSub.reports.find(report => report.reportedBy.toString() === savedReport.reportedBy.toString() && report.postId.toString() === savedReport.postId.toString())

    if (findReport !== undefined) {
      reportSub.reports = reportSub.reports.map(report => (report.reportedBy === savedReport.reportedBy && report.postId === savedReport.postId) ? savedReport : report)

      if (savedReport.action === 'Delete Post') {
        reportSub.reports = reportSub.reports.filter(report => report.id !== savedReport.id)
        await Report.findByIdAndDelete(savedReport.id)
      }

      const updatedReportSub = await mySubgreddiit.findByIdAndUpdate(reportSub.id, reportSub, { new: true })
        .populate({
          path: 'reports',
          populate: [
            {
              path: 'reportedBy',
              model: 'User',
            },
            {
              path: 'reportedUser',
              model: 'User'
            },
            {
              path: 'postId',
              model: 'Post'
            }
          ]
        })
      response.status(201).json(updatedReportSub)

      if (reportObj.action === 'Ignore') {
        const responseText = `Your report on the post \n"${reportedPost.text}"\nhas been ignored!`
        mailer.mailFn(request.user.email, reportObj.action, responseText)
      } else if (reportObj.action === 'Block User') {
        const reporterResponseText = `The user "${reportedUser.userName}" has been blocked from the subgreddiit for posting the post \n"${reportedPost.text}"\n`
        mailer.mailFn(request.user.email, reportObj.action, reporterResponseText)

        const reportedUserResponseText = `You have been blocked from the subgreddiit for posting the post \n"${reportedPost.text}"\n`
        mailer.mailFn(reportedUser.email, reportObj.action, reportedUserResponseText)
      } else if (reportObj.action === 'Delete Post') {
        const reporterResponseText = `The post \n"${reportedPost.text}"\nhas been deleted from the subgreddiit`
        mailer.mailFn(request.user.email, reportObj.action, reporterResponseText)

        const reportedUserResponseText = `Your post \n"${reportedPost.text}"\nhas been deleted from the subgreddiit`
        mailer.mailFn(reportedUser.email, reportObj.action, reportedUserResponseText)
      }
    } else
      response.status(400).json({ error: 'Missing report' }).end()
  } else
    response.status(403).json({ error: 'Invalid user' }).end()
})

module.exports = mySubgreddiitRouter