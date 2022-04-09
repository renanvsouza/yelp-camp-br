const User = require('../models/user')

//Render the register form

module.exports.getRegisterForm = (req, res, next) => {
    if (req.user) {
        req.flash('error', 'You are logged in. To register a different account, please logout first.')
        return res.redirect('/campgrounds')
    }
    res.render('users/register')
}

//Register user

module.exports.registerUser = async (req, res, next) => {
    const { username, email, password } = req.body
    const user = new User({
        email,
        username
    })
    //Try catch just to flash the error message in the same page
    try {
        //Saves to the DB, so no need to use save()
        const newUser = await User.register(user, password)
        req.login(newUser, (err) => {
            if (err) return next(err)
        })
        req.flash('success', 'Welcome!')
        res.redirect('/campgrounds')
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('back')
    }
}

//Render the login form

module.exports.getLoginForm = (req, res, next) => {
    if (req.user) {
        req.flash('error', 'You are already logged in. To use a different account, please logout first.')
        return res.redirect('back')
    }
    res.render('users/login')
}

//Login and logout

module.exports.login = (req, res, next) => {
    req.flash('success', 'Welcome back!')
    res.redirect('/campgrounds')
}

module.exports.logout = (req, res, next) => {
    req.logOut()
    req.flash('success', 'Goodbye!')
    res.redirect('/campgrounds')
}