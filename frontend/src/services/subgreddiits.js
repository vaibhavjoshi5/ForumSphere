import axios from 'axios'
const mysubhubsUrl = '/api/mysubhubs'
const allsubhubsUrl = '/api/allsubhubs'

const createMySubHub = async (userToken, mysubhub) => {
  const token = `bearer ${userToken}`
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.post(mysubhubsUrl, mysubhub, config)
  return response.data
}

const getAllMySubHubs = async userToken => {
  const token = `bearer ${userToken}`
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.get(mysubhubsUrl, config)
  return response.data
}

const getMySubHubPage = async (userToken, subId) => {
  const token = `bearer ${userToken}`
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.get(`${mysubhubsUrl}/${subId}`, config)
  return response.data
}

const getMySubHubPageReports = async (userToken, subId) => {
  const token = `bearer ${userToken}`
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.get(`${mysubhubsUrl}/${subId}/reports`, config)
  return response.data
}

const getAllSubHubs = async userToken => {
  const token = `bearer ${userToken}`
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.get(allsubhubsUrl, config)
  return response.data
}

const getAllSubHubPage = async (userToken, id) => {
  const token = `bearer ${userToken}`
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.get(`${allsubhubsUrl}/${id}`, config)
  if (response.status === 200 && response.data)
    return response.data
  else
    return response.error
}

const addJoinRequest = async (userToken, id) => {
  const token = `bearer ${userToken}`
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.post(`${mysubhubsUrl}/${id}/requests`, null, config)
  return response.data
}

const handleJoinRequest = async (userToken, subId, action) => {
  const token = `bearer ${userToken}`
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.put(`${mysubhubsUrl}/${subId}/requests`, action, config)
  return response.data
}

const leaveSubHub = async (userToken, subId) => {
  const token = `bearer ${userToken}`
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.put(`${mysubhubsUrl}/${subId}`, null, config)
  return response.data
}

const deleteMySubHub = async (userToken, subId) => {
  const token = `bearer ${userToken}`
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.delete(`${mysubhubsUrl}/${subId}`, config)
  return response.data
}

const savedImageUrl = async formData => {
  const config = {
    headers: { 'content-type': 'multipart/form-data' }
  }
  const response = await axios.post(`${process.env.REACT_APP_CLOUDINARY_URL}/image/upload`, formData, config)
  return response.data.url
}

export { createMySubHub, getAllMySubHubs, getMySubHubPage, getAllSubHubs, getAllSubHubPage, addJoinRequest, handleJoinRequest, getMySubHubPageReports, leaveSubHub, deleteMySubHub, savedImageUrl }