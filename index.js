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
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const MongoStore = require('connect-mongo');

//Database connection

mongoose.connect(process.env.DB_CONNECTION)

const db = mongoose.connection
db.on('error', console.error.bind(console, 'Connection error:'))
db.once('open', () => console.log('Connected to DB'))


//Session

const store = MongoStore.create({
    mongoUrl: process.env.DB_CONNECTION,
    touchAfter: 24 * 3600 //Time period in seconds
})

const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
        name: 'session',
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,  //Miliseconds, seconds, minutes, hours, days - So it expires 7 days from now
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

//Express middleware

app.use(session(sessionConfig))
app.use(expressLayouts)
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride('_method'))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
app.use(mongoSanitize({ allowDots: true }))

//Helmet configuration with content security policy

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
]

const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
]

const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
]

const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/rvstestcloud/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
        crossOriginEmbedderPolicy: false
    })
)

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

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)

app.get('/', (req, res) => {
    res.render('home', { layout: false })
})

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