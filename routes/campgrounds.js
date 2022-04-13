const router = require('express').Router()
const campgrounds = require('../controllers/campgrounds')
const reviews = require('../controllers/reviews')
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

//Utils

const { validateData,
    validateReview,
    isLoggedIn,
    isAuthor,
    isReviewAuthor,
    catchError
} = require('../utils/middleware')
const Campground = require('../models/campground')

//Routes

router.route('/')
    .get(catchError(campgrounds.getCampIndex))
    .post(isLoggedIn, upload.array('images'), validateData, catchError(campgrounds.postNewCamp))

router.route('/new')
    .get(isLoggedIn, campgrounds.getNewCampForm)

router.route('/find')
    .get(catchError(campgrounds.searchCamp))

router.route('/:id')
    .get(catchError(campgrounds.getCampDetails))
    .put(isLoggedIn, isAuthor, upload.array('images'), validateData, catchError(campgrounds.updateCamp))
    .delete(isLoggedIn, isAuthor, catchError(campgrounds.deleteCamp))

router.route('/:id/edit')
    .get(isLoggedIn, isAuthor, catchError(campgrounds.getEditCampForm))

router.route('/:id/reviews')
    .post(isLoggedIn, validateReview, catchError(reviews.postNewReview))

router.route('/:id/reviews/:reviewId')
    .delete(isLoggedIn, isReviewAuthor, catchError(reviews.deleteReview))

//Route to make the json data available for mapbox 

router.route('/:id/data')
    .get(catchError(campgrounds.campgroundToJSON))

module.exports = router