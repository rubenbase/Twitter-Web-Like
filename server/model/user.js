var mongoose = require('mongoose')
var jwt = require('jsonwebtoken')
var bcryptjs = require('bcryptjs')

var UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  account:{
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: [8, '密碼長度須大於8位元']
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
})

// 用帳密取得用戶
UserSchema.statics.findByCredentials = async function (account, password) {
  let UserModel = this

  try{
    let user = await UserModel.findOne({account})
    let result = bcryptjs.compareSync(password, user.password)

    if (!result) {
      return Promise.reject()
    }

    return user
  } catch (e) {
    return Promise.reject(e)
  }
}

// 用 token 取得用戶
UserSchema.statics.findByToken = async function (token) {
  let UserModel = this;

  try {
    let decoded = jwt.verify(token, 'Secret')
    let user = await UserModel.findById(decoded.id)

    return user;
  } catch (e) {
    return Promise.reject()
  }
}

// 設置用戶 auth token
UserSchema.methods.setAuthToken = function () {
  let user = this
  let access = 'auth'
  let token = jwt.sign({
    id: user._id,
    access,
    exp:  Math.floor(Date.now() / 1000) + (60 * 60)
  }, 'Secret')

  user.tokens.push({
    access,
    token
  })
  user.save();
  return token
}

// 存入資料庫前把密碼 Hash 起來
UserSchema.pre('save', function (next) {
  let user = this;

  if (user.isModified('password')) {
    let hash = bcryptjs.hashSync(user.password, 10)
    user.password = hash
  }

  next()
})

module.exports = mongoose.model('Users', UserSchema);