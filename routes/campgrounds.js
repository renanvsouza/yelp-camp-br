const router = require('express').Router()
const { validateData,
    validateReview,
    isLoggedIn,
    isAuthor,
    isReviewAuthor,
    catchError
} = require('../utils/middleware')
const Campground = require('../models/campground')
const Review = require('../models/reviews')

router.route('/')
    .get(catchError(async (req, res, next) => {
        const campgrounds = await Campground.find({})
        res.render('campgrounds/index', { campgrounds })
    }))
    .post(validateData, isLoggedIn, catchError(async (req, res, next) => {
        const { title, price, description, location, image } = req.body
        const author = req.user._id
        const newCampground = new Campground({
            title,
            price,
            description,
            location,
            image,
            author
        })
        await newCampground.save()
        req.flash('success', 'Campground created!')
        res.redirect(`/campgrounds/${newCampground.id}`)
    }))

router.route('/new')
    .get(isLoggedIn, (req, res) => {
        res.render('campgrounds/new')
    })

router.route('/:id')
    .get(catchError(async (req, res, next) => {
        const { id } = req.params
        //const foundCampground = await Campground.findById(id).populate('reviews').populate('author')
        const foundCampground = await Campground.findById(id).populate({
            path: 'reviews',
            populate: {
                path: 'author',
                model: 'User'
            }
        }).populate('author')
        if (!foundCampground) {
            req.flash('error', 'Campground not found.')
            return res.redirect('/campgrounds')
        }
        res.render('campgrounds/show', { campground: foundCampground })
    }))
    .put(isLoggedIn, isAuthor, validateData, catchError(async (req, res, next) => {
        const { id } = req.params
        const { title, price, description, location, image } = req.body
        await Campground.findByIdAndUpdate(id, {
            title,
            description,
            price,
            image,
            location
        })
        req.flash('success', 'Campground updated!')
        res.redirect(`/campgrounds/${id}`)
    }))
    .delete(isLoggedIn, isAuthor, catchError(async (req, res, next) => {
        const { id } = req.params
        await Campground.findByIdAndDelete(id)
        req.flash('success', 'Campground deleted!')
        res.redirect('/campgrounds')
    }))

router.route('/:id/edit')
    .get(isLoggedIn, isAuthor, catchError(async (req, res, next) => {
        const { id } = req.params
        const foundCampground = await Campground.findById(id)
        res.render('campgrounds/edit', { campground: foundCampground })
    }))

router.route('/:id/reviews')
    .post(isLoggedIn, validateReview, catchError(async (req, res, next) => {
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
    }))

router.route('/:id/reviews/:reviewId')
    .delete(isLoggedIn, isReviewAuthor, catchError(async (req, res, next) => {
        const { id, reviewId } = req.params

        await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
        await Review.findByIdAndDelete(reviewId)
        req.flash('success', 'Review deleted!')
        res.redirect('back')
    }))

module.exports = router