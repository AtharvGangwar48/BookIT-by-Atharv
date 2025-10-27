const Listing = require("../Models/listing.js");

module.exports.index = async (req,res) => {
    let { search } = req.query;
    let allListings;
    
    if (search) {
        allListings = await Listing.find({
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
                { country: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ]
        });
    } else {
        allListings = await Listing.find({});
    }
    
    res.render("listings/index.ejs", { allListings, search });    
};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author",
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for, does not exist!");
        res.redirect("/listings");
    };
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    
    // Handle multiple images
    if (req.files && req.files.length > 0) {
        newListing.images = req.files.map(file => ({
            url: file.path,
            filename: file.filename
        }));
    }
    
    // Process tags
    if (req.body.listing.tags) {
        newListing.tags = req.body.listing.tags.split(',').map(tag => tag.trim());
    }
    
    // Geocode location for coordinates
    if (req.body.listing.location && req.body.listing.country) {
        try {
            const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(req.body.listing.location + ', ' + req.body.listing.country)}&key=YOUR_API_KEY`);
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                newListing.coordinates = {
                    lat: data.results[0].geometry.lat,
                    lng: data.results[0].geometry.lng
                };
            }
        } catch (error) {
            console.log('Geocoding failed:', error);
        }
    }
    
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for, does not exist!");
        res.redirect("/listings");
    }
    
    let originalImageUrl = null;
    if (listing.images && listing.images.length > 0) {
        originalImageUrl = listing.images[0].url.replace("/upload","/upload/w_250");
    } else if (listing.image && listing.image.url) {
        originalImageUrl = listing.image.url.replace("/upload","/upload/w_250");
    }
    
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(req.files && req.files.length > 0){
        const newImages = req.files.map(file => ({
            url: file.path,
            filename: file.filename
        }));
        listing.images = listing.images ? [...listing.images, ...newImages] : newImages;
        await listing.save();
    }
    
    // Process tags
    if (req.body.listing.tags) {
        listing.tags = req.body.listing.tags.split(',').map(tag => tag.trim());
        await listing.save();
    }

    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};