import axios from 'axios'
const signInUrl = '/api/signin'
const signUpUrl = '/api/signup'

const signin = async userDetails => {
  const response = await axios.post(signInUrl, userDetails)
  return response.data
}

const signup = async userDetails => {
  const response = await axios.post(signUpUrl, userDetails)
  return response.data
}

export { signin, signup }