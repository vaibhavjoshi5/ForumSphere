import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signin, signup } from '../services/login'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import Link from '@mui/material/Link'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { createTheme, ThemeProvider } from '@mui/material/styles'

let user = null
const theme = createTheme()
const setUser = newUser => user = newUser

const SignIn = ({ setSignInForm }) => {
  const [userName, setUserName] = useState('')
  const [userNameError, setUserNameError] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [signInDisable, setSignInDisable] = useState(false)

  const navigate = useNavigate()

  const signIn = async event => {
    event.preventDefault()

    const userData = {
      userName: userName,
      password: password,
    }

    try {
      setSignInDisable(true)
      user = await signin(userData)
      setSignInDisable(false)
      window.localStorage.setItem('loggedUser', JSON.stringify(user))
      navigate('/profile')
    } catch (exception) {
      setSignInDisable(false)
    }

    setUserName('')
    setPassword('')
  }

  const formChange = event => {
    event.preventDefault()
    setSignInForm(false)
  }

  const userNameChange = event => setUserName(event.target.value)
  const userNameBlur = event => !event.target.value ? setUserNameError(true) : setUserNameError(false)
  const passwordChange = event => setPassword(event.target.value)
  const passwordBlur = event => !event.target.value ? setPasswordError(true) : setPasswordError(false)

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <ThemeProvider theme={theme}>
        <Container component='main' maxWidth='xs'>
          <CssBaseline />
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
          }} >
            <Avatar sx={{ 
              m: 1, 
              bgcolor: 'secondary.main',
              width: 60,
              height: 60,
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)'
            }}><LockOutlinedIcon sx={{ fontSize: 30 }} /></Avatar>
            <Typography component='h1' variant='h4' sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}>Sign In to SocialHub</Typography>
            <Box component='form' onSubmit={signIn} noValidate sx={{ mt: 1 }}>
              <TextField margin='normal' required fullWidth id='userName' label='Username' name='username' autoComplete='username'
                value={userName} onChange={userNameChange} helperText={userNameError ? 'Username is a required field' : ''} error={userNameError} onBlur={userNameBlur} 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
              <TextField margin='normal' required fullWidth name='password' label='Password' type='password' id='password' autoComplete='current-password'
                value={password} onChange={passwordChange} helperText={passwordError ? 'Password is a required field' : ''} error={passwordError} onBlur={passwordBlur} 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
              <Button type='submit' fullWidth variant='contained' sx={{ 
                mt: 3, 
                mb: 2, 
                borderRadius: '25px',
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                height: '50px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a67d8 30%, #6b5b95 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
                }
              }} disabled={!userName || !password || signInDisable}>Sign In</Button>
              <Grid container justifyContent='flex-end'>
                <Grid item>
                  <Link href='/signin' onClick={formChange} variant='body2'>Don&apos;t have an account? Sign Up</Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    </div>
  )
}

const SignUp = ({ setSignInForm }) => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [password, setPassword] = useState('')

  const [firstNameError, setFirstNameError] = useState(false)
  const [lastNameError, setLastNameError] = useState(false)
  const [userNameError, setUserNameError] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [ageError, setAgeError] = useState(false)
  const [contactNumberError, setContactNumberError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [signUpDisable, setSignUpDisable] = useState(false)

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
  const passwordBlur = event => !event.target.value ? setPasswordError(true) : setPasswordError(false)

  const signUp = async event => {
    event.preventDefault()
    const userData = {
      firstName: firstName,
      lastName: lastName,
      userName: userName,
      email: email,
      age: age,
      contactNumber: contactNumber,
      password: password,
      followers: [],
      following: []
    }

    try {
      setSignUpDisable(true)
      await signup(userData)
      setSignUpDisable(false)
      setSignInForm(true)

      setFirstName('')
      setLastName('')
      setUserName('')
      setEmail('')
      setAge('')
      setContactNumber('')
      setPassword('')
    } catch (exception) {
      setSignUpDisable(false)
    }
  }

  const formChange = event => {
    event.preventDefault()
    setSignInForm(true)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'transparent' 
    }}>
      <ThemeProvider theme={theme}>
        <Container component='main' maxWidth='sm'>
          <CssBaseline />
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '25px',
            padding: '40px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              zIndex: 1
            }
          }}>
            <Avatar sx={{ 
              m: 1, 
              bgcolor: 'secondary.main',
              width: 70,
              height: 70,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
              position: 'relative',
              zIndex: 2
            }}>
              <LockOutlinedIcon sx={{ fontSize: 35 }} />
            </Avatar>
            <Typography component='h1' variant='h4' sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
              textAlign: 'center'
            }}>
              🔐 Join SocialHub
            </Typography>
            <Typography variant='body1' sx={{ 
              color: '#666',
              textAlign: 'center',
              mb: 3,
              fontSize: '1.1rem'
            }}>
              Create your account and start connecting
            </Typography>
            <Box component='form' noValidate onSubmit={signUp} sx={{ mt: 2, width: '100%' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    required 
                    fullWidth 
                    id='firstName' 
                    label='👤 First Name' 
                    name='firstName' 
                    autoComplete='given-name'
                    value={firstName} 
                    onChange={firstNameChange} 
                    helperText={firstNameError ? 'First Name is a required field' : ''} 
                    error={firstNameError} 
                    onBlur={firstNameBlur}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: '12px',
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
                    value={lastName} 
                    onChange={lastNameChange} 
                    helperText={lastNameError ? 'Last Name is a required field' : ''} 
                    error={lastNameError} 
                    onBlur={lastNameBlur}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: '12px',
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
                    value={age} 
                    onChange={ageChange} 
                    helperText={ageError ? 'Age is a required field' : ''} 
                    error={ageError} 
                    onBlur={ageBlur}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: '12px',
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
                    value={contactNumber} 
                    onChange={contactNumberChange} 
                    helperText={contactNumberError ? 'Contact Number is a required field' : ''} 
                    error={contactNumberError} 
                    onBlur={contactNumberBlur}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: '12px',
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
                    value={userName} 
                    onChange={userNameChange} 
                    helperText={userNameError ? 'Username is a required field' : ''} 
                    error={userNameError} 
                    onBlur={userNameBlur}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: '12px',
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
                    value={email} 
                    onChange={emailChange} 
                    helperText={emailError ? 'Email is a required field' : ''} 
                    error={emailError} 
                    onBlur={emailBlur}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: '12px',
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
                    value={password} 
                    onChange={passwordChange} 
                    helperText={passwordError ? 'Password is a required field' : ''} 
                    error={passwordError} 
                    onBlur={passwordBlur}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: '12px',
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
              <Button 
                type='submit' 
                fullWidth 
                variant='contained' 
                sx={{ 
                  mt: 4, 
                  mb: 3,
                  borderRadius: '30px',
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  height: '55px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a67d8 30%, #6b5b95 90%)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 35px rgba(102, 126, 234, 0.5)',
                  },
                  '&:disabled': {
                    background: 'rgba(0, 0, 0, 0.12)',
                    color: 'rgba(0, 0, 0, 0.26)',
                    transform: 'none',
                    boxShadow: 'none'
                  }
                }}
                disabled={!firstName || !lastName || !userName || !email || !age || !contactNumber || !password || signUpDisable}
              >
                🚀 Create Account
              </Button>
              <Grid container justifyContent='center'>
                <Grid item>
                  <Link 
                    href='/signin' 
                    variant='body2' 
                    onClick={formChange}
                    sx={{
                      color: '#667eea',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      '&:hover': {
                        color: '#5a67d8',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Already have an account? Sign in ✨
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    </div>
  )
}

const LoginForms = () => {
  const [signInForm, setSignInForm] = useState(true)

  return (
    <div>
      {signInForm ? <SignIn setSignInForm={setSignInForm} /> : <SignUp setSignInForm={setSignInForm} />}
    </div>
  )
}

export { LoginForms, user, setUser }