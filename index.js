//Module imports

require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const path = require('path')
const methodOverride = require('method-override')
const expressLayouts = require('express-ejs-layouts')
const app = express()

const Campground = require('./models/campground')

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

app.get('/campgrounds', async (req, res) => {
    try {
        const campgrounds = await Campground.find({})
        res.render('campgrounds/index', { campgrounds })
    } catch (error) {
        console.log(error)
    }
})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.get('/campgrounds/:id/edit', async (req, res) => {
    try {
        const { id } = req.params
        const foundCampground = await Campground.findById(id)
        res.render('campgrounds/edit', { campground: foundCampground })
    } catch (error) {
        console.log(error)
    }
})

app.get('/campgrounds/:id', async (req, res) => {
    try {
        const { id } = req.params
        const foundCampground = await Campground.findById(id)
        res.render('campgrounds/show', { campground: foundCampground })
    } catch (error) {
        console.log(error)
    }
})

app.post('/campgrounds', async (req, res) => {
    try {
        const { title, price, description, location } = req.body
        const descriptionFixed = description.trim()
        const newCampground = new Campground({
            title,
            price,
            description: descriptionFixed,
            location
        })
        await newCampground.save()
        res.redirect('/campgrounds')
    } catch (error) {
        console.log(error)
    }
})

app.put('/campgrounds/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { title, price, description, location } = req.body
        const previousData = await Campground.findById(id)
        let descriptionFixed
        if (description) {
            descriptionFixed = description.trim()
        } else {
            descriptionFixed = previousData.description
        }
        await Campground.findByIdAndUpdate(id, {
            title: title || previousData.title,
            description: descriptionFixed,
            price: price || previousData.price,
            location: location || previousData.location
        })
        res.redirect('/campgrounds')
    } catch (error) {
        console.log(error)
    }
})

app.delete('/campgrounds/:id', async (req, res) => {
    try {
        const { id } = req.params
        await Campground.findByIdAndDelete(id)
        res.redirect('/campgrounds')
    } catch (error) {
        console.log(error)
    }
})

app.use((req, res) => {
    res.status(404).send('Not Found')
})

//Server

app.listen(process.env.PORT, () => {
    console.log('App listening on port:', process.env.PORT)
})