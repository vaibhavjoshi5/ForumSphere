const subgreddiitRouter = require('express').Router()
const Subgreddiit = require('../models/subGreddiit')
const db = require('../utils/db')
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
          description: sub.description,
          posts: sub.posts.length,
          cannotRejoin: request.user.left.includes(sub.id),
          requested: sub.requests.some(joinRequest => joinRequest.userDetails === request.user.id &&
            (!joinRequest.rejected || Date.now() - new Date(joinRequest.requestDate) <= (Number(config.REQUEST_EXPIRATION_DAYS) || 7) * 86400000)),
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

const canAccess = (community, userId) => community.creator === userId || community.members.includes(userId)

subgreddiitRouter.get('/:id/posts', async (request, response) => {
  const community = await Subgreddiit.findById(request.params.id)
    .populate({ path: 'posts', populate: { path: 'postedBy', model: 'User', select: 'userName' } })
    .populate('reports')
  if (!community)
    return response.status(404).json({ error: 'Community not found' })
  if (!canAccess(community, request.user.id))
    return response.status(403).json({ error: 'Join this community to read its discussions' })

  const posts = community.posts.filter(post => post.postedBy).map(post => ({
    ...post.toJSON(),
    postedBy: {
      id: post.postedBy.id,
      userName: community.blocked.includes(post.postedBy.id) && community.creator !== request.user.id
        ? 'Blocked User' : post.postedBy.userName
    },
    reported: community.reports.some(report => report.postId === post.id && report.reportedBy === request.user.id)
  }))
  response.json({ name: community.name, description: community.description, posts })
})

subgreddiitRouter.patch('/:id/posts/:postId', async (request, response) => {
  const { vote, reply } = request.body
  const validVote = [0, 1, -1].includes(vote)
  const text = typeof reply === 'string' ? reply.trim() : ''
  if (vote === undefined ? !text || text.length > 2000 : !validVote || reply !== undefined)
    return response.status(400).json({ error: 'Send one vote or a reply between 1 and 2,000 characters' })

  const community = await Subgreddiit.findById(request.params.id)
  if (!community)
    return response.status(404).json({ error: 'Community not found' })
  if (!canAccess(community, request.user.id))
    return response.status(403).json({ error: 'Join this community to interact' })

  const result = await db.inTransaction(async () => {
    const rows = await db.execute('SELECT id FROM posts WHERE id = ? AND postedIn = ? FOR UPDATE', [request.params.postId, community.id])
    if (!rows.length) return null
    const post = await Post.findById(request.params.postId)
    if (validVote) {
      const voter = request.user.id
      post.upvotedBy = post.upvotedBy.filter(id => id !== voter)
      post.downvotedBy = post.downvotedBy.filter(id => id !== voter)
      if (vote === 1) post.upvotedBy.push(voter)
      if (vote === -1) post.downvotedBy.push(voter)
      post.upvotes = post.upvotedBy.length
      post.downvotes = post.downvotedBy.length
    } else post.replies.push(text)
    await post.save()
    const { upvotes, downvotes, upvotedBy, downvotedBy, replies } = post
    return { upvotes, downvotes, upvotedBy, downvotedBy, replies }
  })
  if (!result)
    return response.status(404).json({ error: 'Post not found' })
  response.json(result)
})

subgreddiitRouter.get('/:id', async (request, response) => {
  const subGreddiitPage = await Subgreddiit.findById(request.params.id).populate('requests')

  const presentDate = new Date()
  subGreddiitPage.requests = subGreddiitPage.requests.filter(request => presentDate.getTime() - request.requestDate.getTime() <= (Number(config.REQUEST_EXPIRATION_DAYS) || 7) * 86400000 || !request.rejected)
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
  const userId = request.user.id
  const { postId, concern } = request.body
  const community = await Subgreddiit.findById(request.params.id).populate('reports')
  if (!community)
    return response.status(404).json({ error: 'Community not found' })
  if (community.creator !== userId && !community.members.includes(userId))
    return response.status(403).json({ error: 'Join the community to report a post' })

  const post = await Post.findById(postId)
  if (!post || post.postedIn !== community.id)
    return response.status(404).json({ error: 'Post not found' })
  if (post.postedBy === community.creator || post.postedBy === userId)
    return response.status(403).json({ error: 'Cannot report owner or yourself' })
  if (community.reports.some(report => report.reportedBy === userId && report.postId === post.id))
    return response.status(403).json({ error: 'Already reported' })

  const report = new Report({
    reportedBy: userId, reportedUser: post.postedBy, postId: post.id,
    concern, action: '', reportedDate: new Date()
  })
  const updated = await db.inTransaction(async () => {
    await report.save()
    community.reports.push(report.id)
    await community.save()
    return Subgreddiit.findById(community.id)
  })
  response.status(201).json(updated)
})

module.exports = subgreddiitRouter
