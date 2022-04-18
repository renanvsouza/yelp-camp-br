const User = require('../models/user')

//Render the register form

module.exports.getRegisterForm = (req, res, next) => {
    if (req.user) {
        req.flash('error', 'Você já entrou. Para registrar uma conta diferente, por favor saia primeiro.')
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
        req.session.returnTo = req.originalUrl;
        res.redirect('/login')
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('back')
    }
}

//Render the login form

module.exports.getLoginForm = (req, res, next) => {
    req.session.returnTo = req.query.origin
    if (req.user) {
        req.flash('error', 'Você já entrou. Para usar uma conta diferente, por favor saia primeiro.')
        return res.redirect('back')
    }
    res.render('users/login')
}

//Login and logout

module.exports.login = (req, res, next) => {
    const redirectUrl = req.session.returnTo || '/campgrounds';
    req.session.returnTo = null
    req.flash('success', 'Seja bem-vindo de volta!')
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logOut()
    req.flash('success', 'Até logo!')
    res.redirect('/campgrounds')
}