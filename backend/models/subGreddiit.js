const defineModel = require('./record')

module.exports = defineModel('Community', 'communities', [
  'name', 'description', 'tags', 'bannedKeywords', 'creator', 'members', 'blocked',
  'requests', 'posts', 'reports', 'creationDate', 'imageUrl'
], {
  arrays: ['tags', 'bannedKeywords', 'members', 'blocked', 'requests', 'posts', 'reports'],
  references: { creator: 'User', members: 'User', blocked: 'User', posts: 'Post', reports: 'Report' },
  required: ['name', 'creator']
})
