const Joi = require('joi')
const ExpressError = require('./ExpressError')

//Schemas

const campgroundSchema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().min(0).required(),
    description: Joi.string().trim().required(),
    location: Joi.string().required(),
    image: Joi.string().required()
})

const reviewSchema = Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    body: Joi.string().trim().required()
})

//Functions

exports.validateData = function validateData(req, res, next) {
    const { error } = campgroundSchema.validate(req.body)

    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    next()
}

exports.validateReview = function validateReview(req, res, next) {
    const { error } = reviewSchema.validate(req.body)

    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    next()
}