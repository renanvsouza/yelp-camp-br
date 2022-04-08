const mongoose = require('mongoose')
const { Schema } = mongoose
const passportLocalMongoose = require('passport-local-mongoose')
const Campground = require('./campground')
const Review = require('./reviews')

//The unique option doesn't make sure the email is unique, it only makes the mongodb field unique
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

//The passport plugin provides a unique username field and password field
userSchema.plugin(passportLocalMongoose)

//Deletes all reviews and campgrounds associated with the user
// userSchema.post('findOneAndDelete', async function (user) {
//     await Campground.deleteMany({author: user})
//     await Review.deleteMany({author: user})
// })

const User = mongoose.model('User', userSchema)

module.exports = User