const defineModel = require('./record')

module.exports = defineModel('Post', 'posts', [
  'text', 'postedBy', 'postedIn', 'upvotes', 'downvotes', 'replies', 'upvotedBy', 'downvotedBy'
], {
  arrays: ['replies', 'upvotedBy', 'downvotedBy'],
  references: { postedBy: 'User', postedIn: 'Community', upvotedBy: 'User', downvotedBy: 'User' },
  required: ['text', 'postedBy', 'postedIn']
})
