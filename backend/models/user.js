const defineModel = require('./record')

module.exports = defineModel('User', 'users', [
  'firstName', 'lastName', 'userName', 'email', 'age', 'contactNumber',
  'passwordHash', 'followers', 'following', 'owner', 'saved', 'left'
], {
  arrays: ['followers', 'following', 'owner', 'saved', 'left'],
  references: { followers: 'User', following: 'User', owner: 'Community', saved: 'Post', left: 'Community' },
  required: ['firstName', 'lastName', 'userName', 'email', 'age', 'contactNumber']
})
