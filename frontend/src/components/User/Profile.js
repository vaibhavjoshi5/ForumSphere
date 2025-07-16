import { useEffect, useState } from 'react'
import { getUserFields, updateUser } from '../../services/userFields'
import { Followers, Following } from './Follower'

import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { createTheme, ThemeProvider } from '@mui/material/styles'

const theme = createTheme()

const Profile = () => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [password, setPassword] = useState('')
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [initialUser, setInitialUser] = useState({})

  const [firstNameError, setFirstNameError] = useState(false)
  const [lastNameError, setLastNameError] = useState(false)
  const [userNameError, setUserNameError] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [ageError, setAgeError] = useState(false)
  const [contactNumberError, setContactNumberError] = useState(false)

  const [saveDisable, setSaveDisable] = useState(false)
  const [buttonType, setButtonType] = useState(true)

  const user = JSON.parse(window.localStorage.getItem('loggedUser'))

  const firstNameChange = event => setFirstName(event.target.value)
  const lastNameChange = event => setLastName(event.target.value)
  const userNameChange = event => setUserName(event.target.value)
  const emailChange = event => setEmail(event.target.value)
  const ageChange = event => setAge(event.target.value)
  const contactNumberChange = event => setContactNumber(event.target.value)
  const passwordChange = event => setPassword(event.target.value)

  const firstNameBlur = event => !event.target.value ? setFirstNameError(true) : setFirstNameError(false)
  const lastNameBlur = event => !event.target.value ? setLastNameError(true) : setLastNameError(false)
  const userNameBlur = event => !event.target.value ? setUserNameError(true) : setUserNameError(false)
  const emailBlur = event => !event.target.value ? setEmailError(true) : setEmailError(false)
  const ageBlur = event => !event.target.value ? setAgeError(true) : setAgeError(false)
  const contactNumberBlur = event => !event.target.value ? setContactNumberError(true) : setContactNumberError(false)

  const useEffectHook = () => {
    const getUserDetails = async () => {
      setSaveDisable(true)
      const userDetails = await getUserFields()
      setSaveDisable(false)
      setFirstName(userDetails.firstName)
      setLastName(userDetails.lastName)
      setUserName(userDetails.userName)
      setEmail(userDetails.email)
      setAge(userDetails.age)
      setContactNumber(userDetails.contactNumber)
      setFollowers(userDetails.followers)
      setFollowing(userDetails.following)
      setInitialUser(userDetails)
    }

    getUserDetails()
  }

  useEffect(useEffectHook, [])

  // Function to refresh user data - useful when followers/following changes
  const refreshUserData = async () => {
    try {
      console.log('=== REFRESHING USER DATA ===')
      const userDetails = await getUserFields()
      console.log('Fresh user data from API:', userDetails)
      console.log('Fresh following:', userDetails.following)
      console.log('Fresh followers:', userDetails.followers)
      
      setFollowers(userDetails.followers)
      setFollowing(userDetails.following)
      setInitialUser(userDetails)
      
      console.log('Profile state updated with fresh data')
      console.log('=== END REFRESH ===')
    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
  }

  const onEdit = async event => {
    event.preventDefault()

    if (!buttonType) {
      const updatedUser = {
        firstName: firstName,
        lastName: lastName,
        userName: userName,
        email: email,
        age: age,
        contactNumber: contactNumber,
        password: password,
        followers: followers,
        following: following
      }

      try {
        setSaveDisable(true)
        await updateUser(user.token, updatedUser)
        setSaveDisable(false)
        setPassword('')
      } catch (exception) {
        setSaveDisable(false)
      }
    }

    setButtonType(!buttonType)
  }

  const onCancel = event => {
    event.preventDefault()
    setButtonType(true)

    setFirstName(initialUser.firstName)
    setLastName(initialUser.lastName)
    setUserName(initialUser.userName)
    setEmail(initialUser.email)
    setAge(initialUser.age)
    setContactNumber(initialUser.contactNumber)
    setFollowers(initialUser.followers)
    setFollowing(initialUser.following)
    setPassword('')

    setFirstNameError(false)
    setLastNameError(false)
    setUserNameError(false)
    setEmailError(false)
    setAgeError(false)
    setContactNumberError(false)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'transparent',
      padding: '20px'
    }}>
      {
        initialUser.userName ?
          <ThemeProvider theme={theme}>
            <Container component='main' maxWidth='md'>
              <CssBaseline />
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                mb: 4
              }}>
                <h1 style={{ 
                  textAlign: 'center', 
                  color: 'white', 
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  marginBottom: '30px'
                }}>
                  👤 User Profile 👤
                </h1>
                <Box 
                  component='form' 
                  noValidate 
                  onSubmit={onEdit} 
                  sx={{ 
                    mt: 2,
                    p: 4,
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    width: '100%',
                    maxWidth: '800px'
                  }}
                >
                  <h2 style={{ 
                    textAlign: 'center', 
                    color: '#333',
                    marginBottom: '24px',
                    fontWeight: 'bold'
                  }}>
                    ✏️ Personal Information
                  </h2>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        required 
                        fullWidth 
                        id='firstName' 
                        label='👤 First Name' 
                        name='firstName' 
                        autoComplete='given-name' 
                        InputProps={{ readOnly: buttonType }}
                        value={firstName} 
                        onChange={firstNameChange} 
                        helperText={firstNameError ? 'First Name is a required field' : ''} 
                        error={firstNameError} 
                        onBlur={firstNameBlur}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: '12px',
                            backgroundColor: buttonType ? 'rgba(0, 0, 0, 0.05)' : 'white',
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        required 
                        fullWidth 
                        id='lastName' 
                        label='👤 Last Name' 
                        name='lastName' 
                        autoComplete='family-name' 
                        InputProps={{ readOnly: buttonType }}
                        value={lastName} 
                        onChange={lastNameChange} 
                        helperText={lastNameError ? 'Last Name is a required field' : ''} 
                        error={lastNameError} 
                        onBlur={lastNameBlur}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: '12px',
                            backgroundColor: buttonType ? 'rgba(0, 0, 0, 0.05)' : 'white',
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField 
                        required 
                        fullWidth 
                        id='age' 
                        label='🎂 Age' 
                        name='age' 
                        autoComplete='age' 
                        InputProps={{ readOnly: buttonType }}
                        value={age} 
                        onChange={ageChange} 
                        helperText={ageError ? 'Age is a required field' : ''} 
                        error={ageError} 
                        onBlur={ageBlur}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: '12px',
                            backgroundColor: buttonType ? 'rgba(0, 0, 0, 0.05)' : 'white',
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <TextField 
                        required 
                        fullWidth 
                        id='contactNumber' 
                        label='📞 Contact Number' 
                        name='contactNumber' 
                        autoComplete='tel-national' 
                        InputProps={{ readOnly: buttonType }}
                        value={contactNumber} 
                        onChange={contactNumberChange} 
                        helperText={contactNumberError ? 'Contact Number is a required field' : ''} 
                        error={contactNumberError} 
                        onBlur={contactNumberBlur}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: '12px',
                            backgroundColor: buttonType ? 'rgba(0, 0, 0, 0.05)' : 'white',
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        required 
                        fullWidth 
                        id='userName' 
                        label='🏷️ Username' 
                        name='username' 
                        autoComplete='username' 
                        InputProps={{ readOnly: true }}
                        value={userName} 
                        onChange={userNameChange} 
                        helperText={userNameError ? 'Username is a required field' : 'Username cannot be changed'} 
                        error={userNameError} 
                        onBlur={userNameBlur}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: '12px',
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        required 
                        fullWidth 
                        id='email' 
                        label='📧 Email Address' 
                        name='email' 
                        autoComplete='email' 
                        InputProps={{ readOnly: buttonType }}
                        value={email} 
                        onChange={emailChange} 
                        helperText={emailError ? 'Email is a required field' : ''} 
                        error={emailError} 
                        onBlur={emailBlur}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: '12px',
                            backgroundColor: buttonType ? 'rgba(0, 0, 0, 0.05)' : 'white',
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        required 
                        fullWidth 
                        name='password' 
                        label='🔒 Password' 
                        type='password' 
                        id='password' 
                        autoComplete='new-password' 
                        InputProps={{ readOnly: buttonType }}
                        value={password} 
                        onChange={passwordChange}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: '12px',
                            backgroundColor: buttonType ? 'rgba(0, 0, 0, 0.05)' : 'white',
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mt: 4 }}>
                    <Button 
                      fullWidth 
                      type='submit' 
                      variant='contained' 
                      disabled={(!firstName || !lastName || !userName || !email || (age.toString() === '') || !contactNumber || saveDisable) && !buttonType}
                      sx={{ 
                        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                        borderRadius: '25px',
                        padding: '12px 32px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: 'white',
                        textTransform: 'none',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                          boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                          transform: 'translateY(-2px)',
                        },
                        '&:disabled': {
                          background: 'rgba(0, 0, 0, 0.12)',
                          color: 'rgba(0, 0, 0, 0.26)',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      {buttonType ? '✏️ Edit Profile' : '💾 Save Profile'}
                    </Button>
                    {!buttonType ? (
                      <Button 
                        fullWidth 
                        type='button' 
                        variant='outlined' 
                        onClick={onCancel}
                        sx={{ 
                          borderRadius: '25px',
                          padding: '12px 32px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          textTransform: 'none',
                          borderColor: '#667eea',
                          color: '#667eea',
                          '&:hover': {
                            borderColor: '#5a67d8',
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            transform: 'translateY(-1px)',
                          }
                        }}
                      >
                        ❌ Cancel
                      </Button>
                    ) : null}
                  </Box>
                </Box>
              </Box>
              <Followers initialUser={initialUser} setInitialUser={setInitialUser} refreshUserData={refreshUserData} />
              <Following initialUser={initialUser} setInitialUser={setInitialUser} refreshUserData={refreshUserData} />
            </Container>
          </ThemeProvider> : null
      }
    </div>
  )
}

export { Profile }