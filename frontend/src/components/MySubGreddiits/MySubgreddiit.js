import { useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import AddIcon from '@mui/icons-material/Add'
import Container from '@mui/material/Container'
import List from '@mui/material/List'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { InputAdornment } from '@mui/material'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import PhotoCamera from '@mui/icons-material/PhotoCamera'

import { createMySubHub, getAllMySubHubs, savedImageUrl } from '../../services/subgreddiits'
import { MySubElem } from './MySubElem'

const theme = createTheme()

const MySubGreddiit = () => {

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tag, setTag] = useState('')
  const [tags, setTags] = useState([])
  const [ban, setBan] = useState('')
  const [banned, setBanned] = useState([])
  const [imageUrl, setImageUrl] = useState()

  const [nameError, setNameError] = useState(false)
  const [descriptionError, setDescriptionError] = useState(false)
  const [tagsError, setTagsError] = useState(false)
  const [bannedError, setBannedError] = useState(false)
  const [tagHelperText, setTagHelperText] = useState('')
  const [banHelperText, setBanHelperText] = useState('')
  const [invalidBanError, setInvalidBanError] = useState(false)
  const [invalidTagError, setInvalidTagError] = useState(false)

  const [createDisable, setCreateDisable] = useState(false)
  const [newDisable, setNewDisable] = useState(false)

  const [mySubs, setMySubs] = useState([])

  const user = JSON.parse(window.localStorage.getItem('loggedUser'))

  const useEffectFn = () => {
    const getAllMySub = async () => {
      const mySubsList = await getAllMySubHubs(user.token)
      setMySubs(mySubsList)
    }

    getAllMySub()
  }

  useEffect(useEffectFn, [user.token, newDisable])

  const createSubgreddiit = async event => {
    event.preventDefault()

    const newMySubgreddiit = {
      name: name,
      description: description,
      tags: tags,
      bannedKeywords: banned,
      imageUrl: imageUrl
    }

    try {
      setCreateDisable(true)
      await createMySubHub(user.token.toString(), newMySubgreddiit)
      setCreateDisable(false)
    } catch (exception) {
      setCreateDisable(false)
    }

    setName('')
    setDescription('')
    setTag('')
    setTags([])
    setBan('')
    setBanned([])
    setImageUrl('')

    setNameError(false)
    setDescriptionError(false)
    setTagsError(false)
    setBannedError(false)
    setTagHelperText('')
    setBanHelperText('')
    setInvalidTagError(false)
    setInvalidBanError(false)

    setNewDisable(!newDisable)
  }

  const addTag = (event, tagName) => {
    event.preventDefault()

    if (tagName.trim().indexOf(' ') !== -1 || tagName !== tagName.toLowerCase()) {
      setTagsError(false)
      setInvalidTagError(true)
      setTagHelperText('Tags must contain a single lower case word')
    } else {
      if (tagName && !tags.find(tag => tag === tagName))
        setTags(tags.concat(tagName))
      setTag('')
      setTagsError(false)
      setTagHelperText('')
      setInvalidTagError(false)
    }
  }

  const removeTag = (event, tagName) => {
    event.preventDefault()
    setTags(tags.filter(tag => tag !== tagName))
  }

  const addBan = (event, banName) => {
    event.preventDefault()

    if (banName.trim().indexOf(' ') !== -1) {
      setBannedError(false)
      setInvalidBanError(true)
      setBanHelperText('Banned words must be a single word')
    } else {
      if (banName && !banned.find(ban => ban === banName))
        setBanned(banned.concat(banName))
      setBan('')
      setBannedError(false)
      setBanHelperText('')
      setInvalidBanError(false)
    }
  }

  const removeBan = (event, banName) => {
    event.preventDefault()
    setBanned(banned.filter(ban => ban !== banName))
  }

  const onCancel = event => {
    event.preventDefault()

    setName('')
    setDescription('')
    setTag('')
    setTags([])
    setBan('')
    setBanned([])
    setImageUrl('')

    setNameError(false)
    setDescriptionError(false)
    setTagsError(false)
    setBannedError(false)
    setInvalidTagError(false)
    setInvalidBanError(false)

    setNewDisable(!newDisable)
  }

  const nameChange = event => setName(event.target.value)
  const nameBlur = event => !event.target.value ? setNameError(true) : setNameError(false)
  const descriptionChange = event => setDescription(event.target.value)
  const descriptionBlur = event => !event.target.value ? setDescriptionError(true) : setDescriptionError(false)
  const tagChange = event => setTag(event.target.value)
  const tagsBlur = () => !tags.length && !invalidTagError ? setTagsError(true) : setTagsError(false)
  const banChange = event => setBan(event.target.value)
  const bannedBlur = () => !banned.length && !invalidBanError ? setBannedError(true) : setBannedError(false)

  const uploadImage = async event => {
    const image = event.target.files[0]

    if (image) {
      const formData = new FormData()
      formData.append('file', image)
      formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_PRESET_NAME)

      setCreateDisable(true)
      const savedUrl = await savedImageUrl(formData)
      setImageUrl(savedUrl)
      setCreateDisable(false)
    } else setImageUrl()
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'transparent',
      padding: '15px'
    }}>
      <ThemeProvider theme={theme}>
        <Container component='main' maxWidth='lg'>
          <CssBaseline />
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mb: 3
          }}>
            <Box sx={{
              textAlign: 'center',
              mb: 3,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)',
              borderRadius: '15px',
              padding: '15px 20px',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 6px 25px rgba(0,0,0,0.15)'
            }}>
              <h1 style={{ 
                color: '#ffffff',
                fontSize: '2rem',
                fontWeight: 'bold',
                textShadow: '2px 2px 6px rgba(0,0,0,0.8)',
                marginBottom: '8px',
                fontFamily: 'Arial, sans-serif'
              }}>
                🏠 My Communities 🏠
              </h1>
              <p style={{
                color: '#ffffff',
                fontSize: '1rem',
                margin: '0',
                fontWeight: '500',
                textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                fontFamily: 'Arial, sans-serif'
              }}>
                Create and manage your own communities
              </p>
            </Box>
            <Button 
              type='button' 
              variant='contained' 
              sx={{ 
                mt: 1, 
                mb: 2,
                borderRadius: '25px',
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                fontSize: '1rem',
                fontWeight: 'bold',
                padding: '10px 30px',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a67d8 30%, #6b5b95 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.5)',
                },
                '&:disabled': {
                  background: 'rgba(0, 0, 0, 0.12)',
                  color: 'rgba(0, 0, 0, 0.26)',
                  transform: 'none',
                  boxShadow: 'none'
                }
              }} 
              disabled={newDisable} 
              onClick={() => setNewDisable(!newDisable)} 
              endIcon={<AddIcon />}
            >
              ✨ Create New Community
            </Button>
            {
              newDisable ?                  <Box 
                    component='form' 
                    onSubmit={createSubgreddiit} 
                    noValidate 
                    sx={{ 
                      mt: 2,
                      p: 3,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                      borderRadius: '20px',
                      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      maxWidth: '600px',
                      width: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        zIndex: 1
                      }
                    }}
                  >
                  <Box sx={{
                    textAlign: 'center',
                    mb: 2,
                    position: 'relative',
                    zIndex: 2
                  }}>
                    <h2 style={{ 
                      color: '#333',
                      marginBottom: '5px',
                      fontWeight: 'bold',
                      fontSize: '1.5rem'
                    }}>
                      🚀 Create Your Community
                    </h2>
                    <p style={{
                      color: '#666',
                      fontSize: '0.9rem',
                      margin: '0'
                    }}>
                      Build something amazing together
                    </p>
                  </Box>
                  <TextField 
                    margin='normal' 
                    required 
                    fullWidth 
                    name='name' 
                    label='🏷️ Community Name' 
                    id='name' 
                    value={name} 
                    onChange={nameChange}
                    helperText={nameError ? 'Name is a required field' : ''} 
                    error={nameError} 
                    onBlur={nameBlur}
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
                  <TextField 
                    margin='normal' 
                    required 
                    fullWidth 
                    name='description' 
                    label='📝 Description' 
                    id='description' 
                    value={description} 
                    onChange={descriptionChange}
                    helperText={descriptionError ? 'Description is a required field' : ''} 
                    error={descriptionError} 
                    onBlur={descriptionBlur}
                    multiline
                    rows={3}
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
                  <List component='div' sx={{ mt: 2, mb: 1 }}>
                    <Stack direction='row' sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {
                        tags.map(
                          tag => (
                            <Chip 
                              key={tag} 
                              label={tag} 
                              onDelete={event => removeTag(event, tag)}
                              sx={{ 
                                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                                color: 'white',
                                fontWeight: 'bold',
                                '& .MuiChip-deleteIcon': {
                                  color: 'white',
                                }
                              }}
                            />
                          ))
                      }
                    </Stack>
                  </List>
                  <TextField 
                    margin='normal' 
                    required 
                    fullWidth 
                    name='tags' 
                    label='🏷️ Tags' 
                    id='tag' 
                    value={tag} 
                    onChange={tagChange}
                    helperText={tagsError ? 'Atleast one tag is required' : (invalidTagError ? tagHelperText : '')} 
                    error={tagsError || invalidTagError} 
                    onBlur={tagsBlur}
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
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <Button 
                            variant='contained' 
                            endIcon={<AddIcon />} 
                            onClick={event => addTag(event, tag)}
                            sx={{ 
                              borderRadius: '20px',
                              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                              minWidth: '80px',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #5a67d8 30%, #6b5b95 90%)',
                              }
                            }}
                          />
                        </InputAdornment>
                      )
                    }} />
                  <List component='div' sx={{ mt: 2, mb: 1 }}>
                    <Stack direction='row' sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {
                        banned.map(
                          ban => (
                            <Chip 
                              key={ban} 
                              label={ban} 
                              onDelete={event => removeBan(event, ban)}
                              sx={{ 
                                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                                color: 'white',
                                fontWeight: 'bold',
                                '& .MuiChip-deleteIcon': {
                                  color: 'white',
                                }
                              }}
                            />
                          ))
                      }
                    </Stack>
                  </List>
                  <TextField 
                    margin='normal' 
                    required 
                    fullWidth 
                    name='ban' 
                    label='🚫 Banned Keywords' 
                    id='ban' 
                    value={ban} 
                    onChange={banChange}
                    helperText={bannedError ? 'Atleast one banned keyword is required' : (invalidBanError ? banHelperText : '')} 
                    error={bannedError || invalidBanError} 
                    onBlur={bannedBlur}
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
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <Button 
                            variant='contained' 
                            endIcon={<AddIcon />} 
                            onClick={event => addBan(event, ban)}
                            sx={{ 
                              borderRadius: '20px',
                              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                              minWidth: '80px',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #e55a7a 30%, #e67e4a 90%)',
                              }
                            }}
                          />
                        </InputAdornment>
                      )
                    }} />
                  <Button 
                    fullWidth 
                    variant='outlined' 
                    sx={{ 
                      mt: 2, 
                      mb: 2,
                      borderRadius: '15px',
                      border: '2px dashed #667eea',
                      color: '#667eea',
                      fontWeight: 'bold',
                      padding: '12px',
                      '&:hover': {
                        border: '2px dashed #5a67d8',
                        background: 'rgba(102, 126, 234, 0.1)',
                      }
                    }} 
                    component='label' 
                    disabled={createDisable}
                  >
                    📷 Upload Community Image <PhotoCamera sx={{ ml: 1 }} />
                    <input hidden accept='image/*' type='file' onChange={event => uploadImage(event)} />
                  </Button>
                  {
                    imageUrl && (
                      <Box sx={{ 
                        mt: 2, 
                        mb: 2, 
                        textAlign: 'center',
                        border: '2px solid #667eea',
                        borderRadius: '15px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                      }}>
                        <img src={imageUrl} alt='Community Preview' style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
                      </Box>
                    )
                  }
                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button 
                      type='submit' 
                      variant='contained' 
                      sx={{ 
                        flex: 1,
                        borderRadius: '25px',
                        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        padding: '12px',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5a67d8 30%, #6b5b95 90%)',
                          transform: 'translateY(-2px)',
                        }
                      }} 
                      disabled={!name || !description || !tags.length || !banned.length || createDisable}
                    >
                      🚀 Create Community
                    </Button>
                    <Button 
                      variant='outlined' 
                      sx={{ 
                        flex: 1,
                        borderRadius: '25px',
                        border: '2px solid #ff6b6b',
                        color: '#ff6b6b',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        padding: '12px',
                        '&:hover': {
                          border: '2px solid #ff5252',
                          background: 'rgba(255, 107, 107, 0.1)',
                        }
                      }} 
                      disabled={createDisable} 
                      onClick={onCancel}
                    >
                      ❌ Cancel
                    </Button>
                  </Box>
                </Box>
                : null
            }
          </Box>
        </Container>
        <Container maxWidth='lg' sx={{ mt: 2 }}>
          <Box sx={{
            textAlign: 'center',
            mb: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)',
            borderRadius: '15px',
            padding: '15px 20px',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 6px 25px rgba(0,0,0,0.15)'
          }}>
            <h2 style={{ 
              color: '#ffffff',
              fontSize: '1.8rem',
              fontWeight: 'bold',
              textShadow: '2px 2px 6px rgba(0,0,0,0.8)',
              marginBottom: '5px',
              fontFamily: 'Arial, sans-serif'
            }}>
              🌟 Your Communities 🌟
            </h2>
            <p style={{
              color: '#ffffff',
              fontSize: '0.9rem',
              margin: '0',
              textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
              fontWeight: '500',
              fontFamily: 'Arial, sans-serif'
            }}>
              Manage and explore your created communities
            </p>
          </Box>
          <Grid container spacing={3}>
            {mySubs.length > 0 ? (
              mySubs.map(mySub => (
                <Grid item xs={12} sm={6} md={4} key={mySub.id}>
                  <MySubElem mySub={mySub} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  borderRadius: '15px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <h3 style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '1.2rem',
                    marginBottom: '10px'
                  }}>
                    🎯 No Communities Yet
                  </h3>
                  <p style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '1rem',
                    margin: '0'
                  }}>
                    Create your first community to get started!
                  </p>
                </Box>
              </Grid>
            )}
          </Grid>
        </Container>
      </ThemeProvider>
    </div >
  )
}

export { MySubGreddiit }