const router = require('express').Router()
const { catchError } = require('../utils/middleware')
const passport = require('passport')
const users = require('../controllers/users')

//Routes

router.route('/register')
    .get(users.getRegisterForm)
    .post(catchError(users.registerUser))

router.route('/login')
    .get(users.getLoginForm)
    //Using the passport middleware to authenticate
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: 'back' }), users.login)

router.route('/logout')
    .get(users.logout)

module.exports = router