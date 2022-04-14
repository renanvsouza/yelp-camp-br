//Module imports

require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const app = express()
const path = require('path')
const methodOverride = require('method-override')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const ExpressError = require('./utils/ExpressError')
const campgroundRoutes = require('./routes/campgrounds')
const userRoutes = require('./routes/users')
const User = require('./models/user')
const flash = require('connect-flash')
const passport = require('passport')

//Database connection

mongoose.connect(process.env.DB_CONNECTION)

const db = mongoose.connection
db.on('error', console.error.bind(console, 'Connection error:'))
db.once('open', () => console.log('Connected to DB'))

//Express middleware

const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,  //Miliseconds, seconds, minutes, hours, days - So it expires 7 days from now
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(expressLayouts)
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride('_method'))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

//Passport configuration (new createStrategy version- see passport-local-mongoose documentation)

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Add the flash object and current user to the res.locals object

app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

//Express configuration

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.set('layout', 'layouts/layout')

//Routes

app.get('/', (req, res) => {
    res.render('home', { layout: false })
})

app.use('/campgrounds', campgroundRoutes)
app.use('/users', userRoutes)

//404 route handling

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})

//Error handling

app.use((err, req, res, next) => {
    const { status = 500 } = err
    res.status(status).render('error', { error: err })
})

//Server

app.listen(process.env.PORT, () => {
    console.log('App listening on port:', process.env.PORT)
})