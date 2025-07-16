const subgreddiitRouter = require('express').Router()
const Subgreddiit = require('../models/subGreddiit')
const Post = require('../models/post')
const Report = require('../models/report')
const config = require('../utils/config')

subgreddiitRouter.get('/', async (request, response) => {
  const mySubGreddiits = await Subgreddiit.find({})
  response.status(200).json(
    mySubGreddiits.map(sub => {
      return (
        {
          id: sub.id,
          name: sub.name,
          creator: sub.creator.toString() === request.user.id,
          members: sub.members.length,
          tags: sub.tags,
          creationDate: sub.creationDate,
          isMember: sub.members.includes(request.user.id)
        }
      )
    })
  )
})

subgreddiitRouter.get('/:id', async (request, response) => {
  const subGreddiitPage = await Subgreddiit.findById(request.params.id).populate('requests')

  const presentDate = new Date()
  subGreddiitPage.requests = subGreddiitPage.requests.filter(request => presentDate.getTime() - request.requestDate.getTime() <= config.REQUEST_EXPIRATION_DAYS || !request.rejected)
  subGreddiitPage.requests = subGreddiitPage.requests.map(request => {
    return (
      {
        userDetails: request.userDetails,
        requestDate: request.requestDate,
        rejected: request.rejected
      }
    )
  })

  const updatedSubGreddiitPage = await Subgreddiit.findByIdAndUpdate(request.params.id, subGreddiitPage, { new: true })

  const responseObj = {
    name: updatedSubGreddiitPage.name,
    description: updatedSubGreddiitPage.description,
    creator: request.user.id === updatedSubGreddiitPage.creator.toString(),
    members: updatedSubGreddiitPage.members.length,
    isMember: updatedSubGreddiitPage.members.includes(request.user.id),
    posts: updatedSubGreddiitPage.posts.length,
    bannedKeywords: updatedSubGreddiitPage.bannedKeywords,
    requested: updatedSubGreddiitPage.requests.find(subRequest => subRequest.userDetails.toString() === request.user.id) !== undefined
  }

  response.status(200).json(responseObj)
})

subgreddiitRouter.post('/:id', async (request, response) => {
  const postData = request.body
  const user = request.user

  const postSub = await Subgreddiit.findById(postData.subId)

  if (postSub.creator.toString() === user.id.toString() || postSub.members.find(member => member.toString() === user.id.toString()) !== undefined) {
    const post = new Post({
      text: postData.text,
      postedBy: user,
      postedIn: postData.subId,
      upvotes: 0,
      downvotes: 0,
      replies: [],
      upvotedBy: [],
      downvotedBy: []
    })

    postSub.bannedKeywords.forEach(word => {
      const regexExp = new RegExp(`\\b${word}\\b`, 'gi')
      let asterisk = ''
      Array.from(word).forEach(() => { asterisk += '*' })
      post.text = post.text.replace(regexExp, asterisk)
    })

    const savedPost = await post.save()

    if (!postSub.posts.includes(savedPost.id)) {
      postSub.posts = postSub.posts.concat(savedPost.id)
      await postSub.save()
    }

    response.status(201).json(savedPost)
  } else
    response.status(403).json({ error: 'Join the subgreddiit to post here' }).end()
})

subgreddiitRouter.put('/:id', async (request, response) => {
  const postDetails = request.body

  const existingPost = await Post.findById(postDetails.id)
  const postedSub = await Subgreddiit.findById(existingPost.postedIn)

  if (postedSub.creator.toString() === request.user.id.toString() || postedSub.members.find(member => member.toString() === request.user.id.toString()) !== undefined) {
    const newPost = {
      text: postDetails.text || existingPost.text,
      postedBy: postDetails.postedBy || existingPost.postedBy,
      postedIn: postDetails.postedIn || existingPost.postedIn,
      upvotes: postDetails.upvotes,
      downvotes: postDetails.downvotes,
      replies: postDetails.replies || existingPost.replies,
      upvotedBy: postDetails.upvotedBy || existingPost.upvotedBy,
      downvotedBy: postDetails.downvotedBy || existingPost.downvotedBy
    }

    postedSub.bannedKeywords.forEach(word => {
      const regexExp = new RegExp(`\\b${word}\\b`, 'gi')
      let asterisk = ''
      Array.from(word).forEach(() => { asterisk += '*' })
      existingPost.text = existingPost.text.replace(regexExp, asterisk)
    })

    const updatedPost = await Post.findByIdAndUpdate(postDetails.id, newPost, { new: true })
    response.status(200).json(updatedPost)
  } else
    response.status(403).json({ error: 'Join the subgreddiit to interact with the posts in the subgreddiit' }).end()
})

subgreddiitRouter.post('/:id/reports', async (request, response) => {
  const user = request.user
  const subId = request.params.id
  const reportObj = request.body

  const reportSub = await Subgreddiit.findById(subId)

  if (reportSub.creator.toString() === request.user.id.toString() || reportSub.members.find(member => member.toString() === request.user.id.toString()) !== undefined) {
    const newReport = new Report({
      reportedBy: user.id,
      reportedUser: reportObj.reportedUser,
      concern: reportObj.concern,
      postId: reportObj.postId,
      action: '',
      reportedDate: new Date()
    })

    const savedReport = await newReport.save()

    if (reportSub.reports.find(report => report.reportedBy === savedReport.reportedBy && report.postId === savedReport.postId) === undefined) {
      if (savedReport.reportedUser !== reportSub.creator.id && savedReport.reportedUser.toString() !== user.id) {
        reportSub.reports = reportSub.reports.concat(savedReport.id)
        const updatedReportSub = await Subgreddiit.findByIdAndUpdate(reportSub.id, reportSub, { new: true })
        response.status(201).json(updatedReportSub)
      } else
        response.status(403).json({ error: 'Cannot report owner or yourself' }).end()
    } else
      response.status(403).json({ error: 'Already reported' }).end()
  } else
    response.status(403).json({ error: 'Cannot report posts in the subgreddiit without being its member' }).end()
})

module.exports = subgreddiitRouter