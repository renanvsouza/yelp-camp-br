const router = require('express').Router()
const catchError = require('../utils/catchError')
const { validateData, validateReview } = require('../utils/validations')
const Campground = require('../models/campground')
const Review = require('../models/reviews')

router.route('/')
    .get(catchError(async (req, res, next) => {
        const campgrounds = await Campground.find({})
        res.render('campgrounds/index', { campgrounds })
    }))
    .post(validateData, catchError(async (req, res, next) => {
        const { title, price, description, location, image } = req.body
        const newCampground = new Campground({
            title,
            price,
            description,
            location,
            image
        })
        await newCampground.save()
        res.redirect(`/campgrounds/${newCampground.id}`)
    }))

router.route('/new')
    .get((req, res) => {
        res.render('campgrounds/new')
    })

router.route('/:id')
    .get(catchError(async (req, res, next) => {
        const { id } = req.params
        const foundCampground = await Campground.findById(id).populate('reviews')
        res.render('campgrounds/show', { campground: foundCampground })
    }))
    .put(validateData, catchError(async (req, res, next) => {
        const { id } = req.params
        const { title, price, description, location, image } = req.body
        await Campground.findByIdAndUpdate(id, {
            title,
            description,
            price,
            image,
            location
        })
        res.redirect(`/campgrounds/${id}`)
    }))
    .delete(catchError(async (req, res, next) => {
        const { id } = req.params
        await Campground.findByIdAndDelete(id)
        res.redirect('/campgrounds')
    }))

router.route('/:id/edit')
    .get(catchError(async (req, res, next) => {
        const { id } = req.params
        const foundCampground = await Campground.findById(id)
        res.render('campgrounds/edit', { campground: foundCampground })
    }))

router.route('/:id/reviews')
    .post(validateReview, catchError(async (req, res, next) => {
        const { id } = req.params
        const { body, rating } = req.body
        const campground = await Campground.findById(id)
        const newReview = new Review({
            body,
            rating
        })
        await newReview.save()
        campground.reviews.push(newReview)
        await campground.save()
        res.redirect('back')
    }))

router.route('/:id/reviews/:reviewId')
    .delete(catchError(async (req, res, next) => {
        const { id, reviewId } = req.params

        await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
        await Review.findByIdAndDelete(reviewId)

        res.redirect('back')
    }))

module.exports = router