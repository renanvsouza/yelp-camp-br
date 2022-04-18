const { campgroundSchema, reviewSchema } = require("./joiSchemas")
const ExpressError = require('./ExpressError')
const Campground = require('../models/campground')
const Review = require("../models/reviews")

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

exports.isLoggedIn = function isLoggedIn(req, res, next) {
    //Store the url the user is requesting from
    if (!req.isAuthenticated()) {
        req.flash('error', 'Você precisa entrar primeiro.')
        return res.redirect('/login')
    }
    next()
}

//Check if the logged user is the campground author

exports.isAuthor = async function isAuthor(req, res, next) {
    const { id } = req.params
    const campground = await Campground.findById(id).populate('author')
    if (req.user.id !== campground.author.id) {
        next(new ExpressError('Você precisa ser um administrador.', 403))
    }
    next()
}

//Check if the logged user is the review author

exports.isReviewAuthor = async function isReviewAuthor(req, res, next) {
    const { reviewId } = req.params
    const review = await Review.findById(reviewId).populate('author')
    if (req.user.id !== review.author.id) {
        next(new ExpressError('Você precisa ser um administrador.', 403))
    }
    next()
}

//Error wrapper for async functions

exports.catchError = function catchError(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
}
