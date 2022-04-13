const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Reviews = require('./reviews')
const cloudinary = require('cloudinary')

const imageSchema = new Schema({
    url: String,
    filename: String
})

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

const campgroundSchema = new Schema({
    title: {
        type: String
    },
    price: {
        type: Number
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    images: [imageSchema],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

campgroundSchema.post('findOneAndDelete', async function (campground) {
    if (campground.reviews.length) {
        await Reviews.deleteMany({ _id: { $in: campground.reviews } })
    }
    for (let image of campground.images) {
        cloudinary.uploader.destroy(image.filename)
    }
})

const Campground = mongoose.model('Campground', campgroundSchema)

module.exports = Campground