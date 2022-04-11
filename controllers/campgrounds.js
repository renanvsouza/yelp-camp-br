const Campground = require('../models/campground')

//Render the index page

module.exports.getCampIndex = async (req, res, next) => {
    const campgrounds = await Campground.find({})
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
    const { title, price, description, location, image } = req.body
    await Campground.findByIdAndUpdate(id, {
        title,
        description,
        price,
        image,
        location
    })
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