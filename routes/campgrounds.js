const router = require('express').Router()
const campgrounds = require('../controllers/campgrounds')
const reviews = require('../controllers/reviews')

//Utils

const { validateData,
    validateReview,
    isLoggedIn,
    isAuthor,
    isReviewAuthor,
    catchError
} = require('../utils/middleware')

//Routes

router.route('/')
    .get(catchError(campgrounds.getCampIndex))
    .post(validateData, isLoggedIn, catchError(campgrounds.postNewCamp))

router.route('/new')
    .get(isLoggedIn, campgrounds.getNewCampForm)

router.route('/:id')
    .get(catchError(campgrounds.getCampDetails))
    .put(isLoggedIn, isAuthor, validateData, catchError(campgrounds.updateCamp))
    .delete(isLoggedIn, isAuthor, catchError(campgrounds.deleteCamp))

router.route('/:id/edit')
    .get(isLoggedIn, isAuthor, catchError(campgrounds.getEditCampForm))

router.route('/:id/reviews')
    .post(isLoggedIn, validateReview, catchError(reviews.postNewReview))

router.route('/:id/reviews/:reviewId')
    .delete(isLoggedIn, isReviewAuthor, catchError(reviews.deleteReview))

module.exports = router