import axios from 'axios'
const allsubgreddiitsUrl = '/api/allsubhubs'
const mysubgreddiitsUrl = '/api/mysubhubs'
const savedPostsUrl = '/api/savedposts'

const createNewPost = async (userToken, postDetails) => {
  const token = `bearer ${userToken}`
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.post(`${allsubgreddiitsUrl}/${postDetails.subId}`, postDetails, config)
  return response.data
}

const interactWithPost = async (userToken, post, action) => {
  const response = await axios.patch(`${allsubgreddiitsUrl}/${post.postedIn}/posts/${post.id}`, action, {
    headers: { Authorization: `bearer ${userToken}` }
  })
  return response.data
}

const savePost = async (userToken, postId) => {
  const token = `bearer ${userToken}`
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.post(`${savedPostsUrl}/${postId}`, null, config)
  return response.data
}

const removeSavedPost = async (userToken, postId) => {
  const token = `bearer ${userToken}`
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.put(`${savedPostsUrl}/${postId}`, null, config)
  return response.data
}

const reportPost = async (userToken, subId, reportObj) => {
  const token = `bearer ${userToken}`
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.post(`${allsubgreddiitsUrl}/${subId}/reports`, reportObj, config)
  return response.data
}

const handleReport = async (userToken, subId, reportObj) => {
  const token = `bearer ${userToken}`
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.put(`${mysubgreddiitsUrl}/${subId}/reports`, reportObj, config)
  return response.data
}

export { createNewPost, interactWithPost, savePost, removeSavedPost, reportPost, handleReport }