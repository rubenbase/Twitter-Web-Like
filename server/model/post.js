var mongoose = require('mongoose')

var PostSchema = mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Users'
  },
  created: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String,
    required: [true, '貼文不能空白']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comments'
  }]
})

PostSchema.methods.toggleLike = async function (userId) {
  let post = this
  let index = post.likes.findIndex(item => item.toString() === userId.toString())

  if (index === -1) {
    post.likes.push(userId)
  } else {
    post.likes.splice(index, 1)
  }

  await post.save()
  return post
}

// populate relatived information to the post
PostSchema.methods.getDetailAllInfo = async function () {
  let post = this
  let opts = [{
    path: 'author',
    select: '_id name account profileImg'
  }, {
    path: 'likes',
    select: '_id name account profileImg'
  }, {
    path: 'comments',
    select: 'user created content',
    sort: {
      created: -1
    },
    populate: {
      path: 'user',
      select: '_id name account profileImg'
    }
  }]

  let populatedPost = await post.populate(opts).execPopulate()

  return populatedPost
}

// populate relatived information to the post
PostSchema.methods.getDetailCommentInfo = async function () {
  let post = this
  let opts = [{
    path: 'comments',
    select: 'user created content',
    sort: {
      created: -1
    },
    populate: {
      path: 'user',
      select: '_id name account profileImg'
    }
  }]

  let populatedPost = await post.populate(opts).execPopulate()

  return populatedPost
}

module.exports = mongoose.model('Posts', PostSchema)
