const mongoose = require('mongoose');
const User = require('./models/user');

mongoose.connect('mongodb://localhost:27017/socialhub', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function cleanupDuplicates() {
  try {
    const users = await User.find({});
    
    for (const user of users) {
      // Remove duplicate followers
      const uniqueFollowers = [...new Set(user.followers.map(f => f.toString()))];
      
      // Remove duplicate following
      const uniqueFollowing = [...new Set(user.following.map(f => f.toString()))];
      
      if (uniqueFollowers.length !== user.followers.length || uniqueFollowing.length !== user.following.length) {
        console.log(`Cleaning up user: ${user.userName}`);
        console.log(`Followers: ${user.followers.length} -> ${uniqueFollowers.length}`);
        console.log(`Following: ${user.following.length} -> ${uniqueFollowing.length}`);
        
        await User.findByIdAndUpdate(user._id, {
          followers: uniqueFollowers,
          following: uniqueFollowing
        });
      }
    }
    
    console.log('Cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupDuplicates();
