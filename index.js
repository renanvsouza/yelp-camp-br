//Module imports

require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const path = require('path')
const methodOverride = require('method-override')
const expressLayouts = require('express-ejs-layouts')
const app = express()

const Campground = require('./models/campground')
const catchError = require('./utils/catchError')
const ExpressError = require('./utils/ExpressError')
const validateData = require('./utils/validateData')

//Database connection

mongoose.connect(process.env.DB_CONNECTION)

const db = mongoose.connection
db.on('error', console.error.bind(console, 'Connection error:'))
db.once('open', () => console.log('Connected to DB'))

//Express middleware

app.use(expressLayouts)
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride('_method'))

//Express configuration

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.set('layout', 'layouts/layout')

//Routes

app.get('/', (req, res) => {
    res.redirect('/campgrounds')
})

app.get('/campgrounds', catchError(async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.get('/campgrounds/:id/edit', catchError(async (req, res, next) => {
    const { id } = req.params
    const foundCampground = await Campground.findById(id)
    res.render('campgrounds/edit', { campground: foundCampground })
}))

app.get('/campgrounds/:id', catchError(async (req, res, next) => {
    const { id } = req.params
    const foundCampground = await Campground.findById(id)
    res.render('campgrounds/show', { campground: foundCampground })
}))

app.post('/campgrounds', validateData, catchError(async (req, res, next) => {
    const { title, price, description, location, image } = req.body
    const newCampground = new Campground({
        title,
        price,
        description,
        location,
        image
    })
    const newCamp = await newCampground.save()
    res.redirect(`/campgrounds/${newCamp.id}`)
}))

app.put('/campgrounds/:id', validateData, catchError(async (req, res, next) => {
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

app.delete('/campgrounds/:id', catchError(async (req, res, next) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

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