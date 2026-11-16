import { useEffect, useState } from 'react'
import { getUserFields } from '../services/userFields'

export const usePostProfile = () => {
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    getUserFields().then(data => {
      if (active) setProfile(data)
    }).catch(() => {
      if (active) setError(true)
    })
    return () => { active = false }
  }, [attempt])

  const retry = () => {
    setError(false)
    setAttempt(current => current + 1)
  }

  const onSaveChange = (post, saved) => setProfile(current => ({
    ...current,
    saved: saved ? [...current.saved.filter(item => (item.id || item) !== post.id), post] : current.saved.filter(item => (item.id || item) !== post.id)
  }))
  const onFollowChange = (id, following) => setProfile(current => ({
    ...current,
    following: following ? [...current.following.filter(item => (item.id || item) !== id), id] : current.following.filter(item => (item.id || item) !== id)
  }))

  return { profile, error, retry, onSaveChange, onFollowChange }
}
