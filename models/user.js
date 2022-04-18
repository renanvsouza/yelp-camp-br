const mongoose = require('mongoose')
const { Schema } = mongoose
const passportLocalMongoose = require('passport-local-mongoose')

//Makes the mongodb e-mail field unique

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

//Display a custom error message for duplicate e-mail

userSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        next(new Error('E-mail já está cadastrado.'));
    } else {
        next();
    }
})

//Validate the password format

const passwordValidator = function (password, cb) {
    var regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!regex.test(password)) {
        throw new Error('A senha deve conter pelo menos 8 caracteres, uma letra e um número.')
    }
    return cb();
}


//The passport plugin provides a unique username field and password field

userSchema.plugin(passportLocalMongoose, { passwordValidator })

//Deletes all reviews and campgrounds associated with the user

// const Campground = require('./campground')
// const Review = require('./reviews')
// userSchema.post('findOneAndDelete', async function (user) {
//     await Campground.deleteMany({author: user})
//     await Review.deleteMany({author: user})
// })

const User = mongoose.model('User', userSchema)

module.exports = User