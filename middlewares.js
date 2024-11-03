const Listing = require("./Models/listing.js");
const Review = require("./Models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        //console.log(req)
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be logged in to create new listing !");
        return res.redirect("/login");
    };
    next();
}
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.saveRedirectUrl = req.session.redirectUrl; // Store it in res.locals
        delete req.session.redirectUrl; // Clear it from the session to prevent reuse
    }
    next();
};

module.exports.isOwner = async(req,res,next)=>{
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You don't have permission to update this list");
        return res.redirect(`/listings/${id}`);
    };
    next();
}

module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body); // Assuming `error` is the property that holds validation errors
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(", "); // Extracting messages
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body); // Assuming `error` is the property that holds validation errors
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(", "); // Extracting messages
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async(req,res,next)=>{
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You don't have permission to delete this review");
        return res.redirect(`/listings/${id}`);
    };
    next();
}

// module.exports.isReviewAuthor = async (req, res, next) => {
//     const { reviewId } = req.params;
//     const review = await Review.findById(reviewId);
    
//     if (!review.author.equals(req.user._id)) {
//         req.flash("error", "You do not have permission to do that");
//         return res.redirect(`/listings/${req.params.id}`);
//     }
    
//     next();
// }