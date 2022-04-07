const Joi = require('joi')

exports.campgroundSchema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().min(0).required(),
    description: Joi.string().trim().required(),
    location: Joi.string().required(),
    image: Joi.string().required()
})

exports.reviewSchema = Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    body: Joi.string().trim().required()
})
