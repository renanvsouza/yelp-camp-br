const Joi = require('joi')
const ExpressError = require('./ExpressError')

module.exports = function validateData(req, res, next) {
    const campgroundSchema = Joi.object({
        title: Joi.string().required(),
        price: Joi.number().min(0).required(),
        description: Joi.string().trim().required(),
        location: Joi.string().required(),
        image: Joi.string().required()
    })

    const { error } = campgroundSchema.validate(req.body)

    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    next()
}