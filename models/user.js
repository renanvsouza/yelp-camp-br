const mongoose = require('mongoose')
const { Schema } = mongoose
const passportLocalMongoose = require('passport-local-mongoose')

//The unique option doesn't make sure the email is unique, it only makes the field unique
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

//The passport plugin provides a unique username field and password field
userSchema.plugin(passportLocalMongoose)

const User = mongoose.model('User', userSchema)

module.exports = User