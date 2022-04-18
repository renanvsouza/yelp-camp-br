const baseJoi = require('joi')
const sanitizeHtml = require('sanitize-html')

//Prevent HTML tags in text fields

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': 'Tags HTML não são permitidas.'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {}
                })
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean
            }
        }
    }
})

const Joi = baseJoi.extend(extension)

exports.campgroundSchema = Joi.object({
    title: Joi.string().required().escapeHTML(),
    price: Joi.string().min(0).required(),
    description: Joi.string().max(1000).required().escapeHTML(),
    location: Joi.string().required().escapeHTML(),
    geometry: Joi.object(),
    images: Joi.array(),
    deleteImages: Joi.array()
})

exports.reviewSchema = Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    body: Joi.string().trim().required().escapeHTML()
})