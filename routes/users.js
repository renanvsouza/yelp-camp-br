const router = require('express').Router()
const { catchError } = require('../utils/middleware')
const User = require('../models/user')
const passport = require('passport')

router.route('/register')
    .get((req, res, next) => {
        res.render('users/register')
    })
    .post(catchError(async (req, res, next) => {
        const { username, email, password } = req.body
        const user = new User({
            email,
            username
        })
        //Try catch just to flash the error message in the same page
        try {
            //Saves to the DB, so no need to use save()
            await User.register(user, password)
            req.flash('success', 'User registered. Welcome!')
            res.redirect('/campgrounds')
        } catch (e) {
            req.flash('error', e.message)
            res.redirect('back')
        }
    }))

router.route('/login')
    .get((req, res, next) => {
        res.render('users/login')
    })
    //Using the passport middleware to authenticate
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: 'back' }), (req, res, next) => {
        req.flash('success', 'Logged in.')
        res.redirect('/campgrounds')
    })

router.route('/logout')
    .get((req, res, next) => {
        req.logOut()
        req.flash('success', 'Goodbye!')
        res.redirect('/campgrounds')
    })

module.exports = router