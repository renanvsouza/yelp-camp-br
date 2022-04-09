const Campground = require('../models/campground')
const Review = require('../models/reviews')

//Post review

module.exports.postNewReview = async (req, res, next) => {
    const { id } = req.params
    const { body, rating } = req.body
    const author = req.user._id
    const campground = await Campground.findById(id)
    const newReview = new Review({
        author,
        body,
        rating
    })
    await newReview.save()
    campground.reviews.push(newReview)
    await campground.save()
    req.flash('success', 'Review created!')
    res.redirect('back')
}

//Delete review

module.exports.deleteReview = async (req, res, next) => {
    const { id, reviewId } = req.params

    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Review deleted!')
    res.redirect('back')
}