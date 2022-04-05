const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Reviews = require('./reviews')

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
    image: {
        type: String
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
})

const Campground = mongoose.model('Campground', campgroundSchema)

module.exports = Campground