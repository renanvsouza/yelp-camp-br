const Campground = require('../models/campground')
const cloudinary = require('cloudinary')

//Render the index page

module.exports.getCampIndex = async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.locals.searchParams = ""
    res.render('campgrounds/index', { campgrounds })
}

//Search a campground

module.exports.searchCamp = async (req, res) => {
    const { search } = req.query

    const campgrounds = await Campground.find({
        $or:
            [
                { title: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ]
    })
    res.locals.searchParams = search
    res.render('campgrounds/index', { campgrounds })
}

//Post new campground

module.exports.postNewCamp = async (req, res, next) => {
    const { title, price, description, location } = req.body
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    const author = req.user._id
    const newCampground = new Campground({
        title,
        price,
        description,
        location,
        author,
        images
    })
    await newCampground.save()
    req.flash('success', 'Campground created!')
    res.redirect(`/campgrounds/${newCampground.id}`)
}

//Render the form page for new campground

module.exports.getNewCampForm = (req, res) => {
    res.render('campgrounds/new')
}

//Render the campground details page

module.exports.getCampDetails = async (req, res, next) => {
    const { id } = req.params
    const foundCampground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author',
            model: 'User'
        }
    }).populate('author')
    if (!foundCampground) {
        req.flash('error', 'Campground not found.')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground: foundCampground })
}

//Update campground

module.exports.updateCamp = async (req, res, next) => {
    const { id } = req.params
    const { title, price, description, location, deleteImages } = req.body
    const campground = await Campground.findByIdAndUpdate(id, {
        title,
        description,
        price,
        location
    })

    //Delete images
    if (deleteImages && deleteImages.length) {
        //Delete images from database
        await campground.updateOne({ $pull: { images: { filename: { $in: deleteImages } } } })
        //Delete images from cloudinary
        for (let filename of deleteImages) {
            cloudinary.uploader.destroy(filename)
        }
    }

    //Add new images to database
    const imagesToAdd = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...imagesToAdd)

    //Save and redirect
    await campground.save()
    req.flash('success', 'Campground updated!')
    res.redirect(`/campgrounds/${id}`)
}

//Delete campground

module.exports.deleteCamp = async (req, res, next) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Campground deleted!')
    res.redirect('/campgrounds')
}

//Render edit form page

module.exports.getEditCampForm = async (req, res, next) => {
    const { id } = req.params
    const foundCampground = await Campground.findById(id)
    res.render('campgrounds/edit', { campground: foundCampground })
}