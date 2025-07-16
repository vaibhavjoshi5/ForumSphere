import { useEffect, useState } from 'react'
import { getUserFields } from '../../services/userFields'
import { Post } from '../Post'

import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

const theme = createTheme()

const SavedPosts = () => {
  const [userDetails, setUserDetails] = useState({})

  useEffect(
    () => {
      const getUserData = async () => {
        const userData = await getUserFields()
        setUserDetails(userData)
      }
      getUserData()
    }, []
  )

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'transparent',
      padding: '15px'
    }}>
      <ThemeProvider theme={theme}>
        <Container maxWidth='lg'>
          <CssBaseline />
          <Box sx={{
            textAlign: 'center',
            mb: 4,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)',
            borderRadius: '15px',
            padding: '20px 25px',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 6px 25px rgba(0,0,0,0.15)'
          }}>
            <h1 style={{ 
              color: '#ffffff',
              fontSize: '2.2rem',
              fontWeight: 'bold',
              textShadow: '2px 2px 6px rgba(0,0,0,0.8)',
              marginBottom: '8px',
              fontFamily: 'Arial, sans-serif'
            }}>
              🔖 Saved Posts 🔖
            </h1>
            <p style={{
              color: '#ffffff',
              fontSize: '1.1rem',
              margin: '0',
              fontWeight: '500',
              textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
              fontFamily: 'Arial, sans-serif'
            }}>
              Your collection of saved posts
            </p>
          </Box>
          
          {userDetails.id ? (
            userDetails.saved && userDetails.saved.length > 0 ? (
              <Grid container spacing={3}>
                {userDetails.saved.map(savedPost => (
                  <Grid key={savedPost.id} item xs={12}>
                    <Box sx={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.1) 100%)',
                      borderRadius: '15px',
                      padding: '2px',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.15) 100%)',
                      }
                    }}>
                      <Post post={savedPost} />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                borderRadius: '15px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{
                  color: '#ffffff',
                  fontSize: '1.8rem',
                  marginBottom: '15px',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  📭 No Saved Posts Yet
                </h2>
                <p style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '1.1rem',
                  margin: '0',
                  fontWeight: '500',
                  textShadow: '1px 1px 3px rgba(0,0,0,0.6)',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  Start exploring communities and save posts you love!
                </p>
              </Box>
            )
          ) : (
            <Box sx={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{
                color: '#ffffff',
                fontSize: '1.8rem',
                marginBottom: '15px',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                fontFamily: 'Arial, sans-serif'
              }}>
                🔄 Loading...
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '1.1rem',
                margin: '0',
                fontWeight: '500',
                textShadow: '1px 1px 3px rgba(0,0,0,0.6)',
                fontFamily: 'Arial, sans-serif'
              }}>
                Please wait while we load your saved posts
              </p>
            </Box>
          )}
        </Container>
      </ThemeProvider>
    </div>
  )
}

export { SavedPosts }