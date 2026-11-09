const mySubgreddiitRouter = require('express').Router()
const db = require('../utils/db')
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
  if (!mySubGreddiitPage)
    return response.status(404).json({ error: 'Community not found' })

  if (request.user.id === mySubGreddiitPage.creator.toString()) {
    const presentDate = new Date()
    const requestExpiryMs = (Number(config.REQUEST_EXPIRATION_DAYS) || 7) * 24 * 60 * 60 * 1000
    const reportExpiryMs = (Number(config.REPORT_EXPIRATION_DAYS) || 7) * 24 * 60 * 60 * 1000
    mySubGreddiitPage.requests = mySubGreddiitPage.requests.filter(joinRequest => !joinRequest.rejected || presentDate - joinRequest.requestDate <= requestExpiryMs)
    mySubGreddiitPage.reports = mySubGreddiitPage.reports.filter(report => presentDate - report.reportedDate <= reportExpiryMs)
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
    mySubGreddiitPage.requests = mySubGreddiitPage.requests.filter(request => presentDate.getTime() - request.requestDate.getTime() <= (Number(config.REQUEST_EXPIRATION_DAYS) || 7) * 86400000 || !request.rejected)
    mySubGreddiitPage.reports = mySubGreddiitPage.reports.filter(report => presentDate.getTime() - report.reportedDate.getTime() <= (Number(config.REPORT_EXPIRATION_DAYS) || 7) * 86400000)
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

  const createdMySubgreddiit = await db.inTransaction(async () => {
    await newMySubGreddiit.save()
    user.owner = user.owner.concat(newMySubGreddiit.id)
    await user.save()
    return newMySubGreddiit
  })

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
    await db.inTransaction(async () => {
      const users = await User.find({})
      for (const account of users) {
        account.saved = account.saved.filter(postId => !deleteSub.posts.includes(postId))
        account.left = account.left.filter(communityId => communityId !== deleteSub.id)
        account.owner = account.owner.filter(communityId => communityId !== deleteSub.id)
        await account.save()
      }
      await mySubgreddiit.findByIdAndDelete(deleteSub.id)
    })

    response.sendStatus(200)
  } else
    response.status(403).json({ error: 'Invalid user! Not enough permissions' }).end()
})

mySubgreddiitRouter.post('/:id/requests', async (request, response) => {
  const user = request.user
  const subId = request.params.id

  const requestSub = await mySubgreddiit.findById(subId)
  if (!requestSub)
    return response.status(404).json({ error: 'Community not found' })

  if (requestSub.creator.toString() !== user.id.toString() && requestSub.members.find(member => member.toString() === user.id.toString()) === undefined) {
    const newRequest = {
      userDetails: user.id,
      requestDate: new Date(),
      rejected: false
    }

    const existingRequest = requestSub.requests.find(joinRequest => joinRequest.userDetails.toString() === user.id.toString())

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
      response.status(409).json({ error: 'Join request already submitted' })
  } else
    response.status(400).json({ error: 'You are already a member of the subgreddiit!' }).end()
})

mySubgreddiitRouter.put('/:id/requests', async (request, response) => {
  const user = request.user
  const subId = request.params.id

  const requestSub = await mySubgreddiit.findById(subId)
  if (!requestSub)
    return response.status(404).json({ error: 'Community not found' })

  if (requestSub.creator.toString() === user.id) {
    const reqId = request.body.requestId
    const accept = request.body.accept

    if (accept) {
      requestSub.requests = requestSub.requests.filter(request => request.userDetails.toString() !== reqId)
      if (!requestSub.members.find(person => person.toString() === reqId))
        requestSub.members = requestSub.members.concat(reqId)
    } else {
      const req = requestSub.requests.find(request => request.userDetails.toString() === reqId)
      if (!req)
        return response.status(404).json({ error: 'Join request not found' })
      req.rejected = true
    }
    await requestSub.save()
    const returnedSub = await mySubgreddiit.findById(subId)
      .populate('creator').populate('members').populate('blocked').populate({
        path: 'requests',
        populate: { path: 'userDetails', model: 'User' }
      })
    returnedSub.requests = returnedSub.requests.filter(joinRequest => !joinRequest.rejected)
    response.status(200).json(returnedSub)
  } else
    response.status(403).json({ error: 'Cannot take action on requests without being the moderator of the subgreddiit!' }).end()
})

mySubgreddiitRouter.put('/:id/reports', async (request, response) => {
  const { id, action } = request.body
  const community = await mySubgreddiit.findById(request.params.id).populate('reports')
  if (!community)
    return response.status(404).json({ error: 'Community not found' })
  if (community.creator !== request.user.id)
    return response.status(403).json({ error: 'Invalid user' })
  const report = community.reports.find(item => item.id === id)
  if (!report)
    return response.status(404).json({ error: 'Missing report' })
  if (!['Ignore', 'Block User', 'Delete Post'].includes(action))
    return response.status(400).json({ error: 'Invalid report action' })

  const post = await Post.findById(report.postId)
  const reportedUser = await User.findById(report.reportedUser)
  const reporter = await User.findById(report.reportedBy)

  const updated = await db.inTransaction(async () => {
    if (action === 'Block User') {
      if (!community.blocked.includes(reportedUser.id)) community.blocked.push(reportedUser.id)
      community.members = community.members.filter(member => member !== reportedUser.id)
      if (!reportedUser.left.includes(community.id)) reportedUser.left.push(community.id)
      reportedUser.saved = reportedUser.saved.filter(postId => !community.posts.includes(postId))
      await reportedUser.save()
      await community.save()
    }
    if (action === 'Delete Post') {
      for (const user of await User.find({})) {
        user.saved = user.saved.filter(postId => postId !== post.id)
        await user.save()
      }
      community.posts = community.posts.filter(postId => postId !== post.id)
      community.reports = community.reports.filter(item => item.postId !== post.id)
      await community.save()
      await Post.findByIdAndDelete(post.id)
    } else {
      report.action = action
      await report.save()
    }
    return mySubgreddiit.findById(community.id).populate({
      path: 'reports',
      populate: [{ path: 'reportedBy' }, { path: 'reportedUser' }, { path: 'postId' }]
    })
  })

  response.status(201).json(updated)
  const message = action + ': ' + post.text
  mailer.mailFn(reporter.email, action, message)
  if (action !== 'Ignore') mailer.mailFn(reportedUser.email, action, message)
})

module.exports = mySubgreddiitRouter
