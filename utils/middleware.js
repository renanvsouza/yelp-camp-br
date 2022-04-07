const { campgroundSchema, reviewSchema } = require("./joiSchemas")
const ExpressError = require('./ExpressError')

//Data validation for posting and updating campgrounds

exports.validateData = function validateData(req, res, next) {
    const { error } = campgroundSchema.validate(req.body)

    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    next()
}

//Data validation for posting reviews

exports.validateReview = function validateReview(req, res, next) {
    const { error } = reviewSchema.validate(req.body)

    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    next()
}

//Verify if the user is logged in

exports.verifyAuthenticated = function verifyAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in.')
        return res.redirect('back')
    }
    next()
}

//Error wrapper for async functions

exports.catchError = function catchError(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
}
