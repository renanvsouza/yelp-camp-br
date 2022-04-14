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

const passwordValidator = function (password, cb) {
    var regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!regex.test(password)) {
        throw new Error('Password must contain at least 8 characters, one letter and one number.')
    }
    return cb();
}


//The passport plugin provides a unique username field and password field
userSchema.plugin(passportLocalMongoose, { passwordValidator })

//Deletes all reviews and campgrounds associated with the user
// userSchema.post('findOneAndDelete', async function (user) {
//     await Campground.deleteMany({author: user})
//     await Review.deleteMany({author: user})
// })

const User = mongoose.model('User', userSchema)

module.exports = User