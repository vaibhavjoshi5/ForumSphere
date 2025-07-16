import axios from 'axios'
import { user } from '../components/Login'
const profileUrl = '/api/profile'

const getUserFields = async () => {
  const user = JSON.parse(window.localStorage.getItem('loggedUser'))
  const token = `bearer ${user.token}`
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.get(profileUrl, config)
  return response.data
}

const updateUser = async (userToken, updatedUser) => {
  const token = `bearer ${userToken}`
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.put(profileUrl, updatedUser, config)
  return response.data
}

const updateFollowerByID = async (userToken, id) => {
  const token = `bearer ${userToken}`
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.put(`${profileUrl}/followers/${id}`, id, config)
  return response.data
}

const updateFollowingByID = async (userToken, id) => {
  const token = `bearer ${userToken}`
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.put(`${profileUrl}/following/${id}`, id, config)
  return response.data
}

const addFollower = async (userToken, postedBy) => {
  const token = `bearer ${userToken}`
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.post(`${profileUrl}/following/${postedBy}`, null, config)
  return response.data
}

const removeFollower = async (userToken, postedBy) => {
  const token = `bearer ${userToken}`
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.put(`${profileUrl}/following/${postedBy}`, {}, config)
  return response.data
}

export { getUserFields, updateUser, updateFollowerByID, updateFollowingByID, addFollower, removeFollower }