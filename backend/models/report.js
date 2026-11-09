const defineModel = require('./record')

module.exports = defineModel('Report', 'reports', [
  'reportedBy', 'reportedUser', 'concern', 'postId', 'action', 'reportedDate'
], {
  references: { reportedBy: 'User', reportedUser: 'User', postId: 'Post' },
  required: ['reportedBy', 'reportedUser', 'concern', 'postId']
})
