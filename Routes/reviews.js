const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middlewares.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const reviewController = require("../controllers/reviews.js");

// Reviews 
// Post Review Route 
router.post("/", isLoggedIn, upload.array('review[images]', 5), validateReview , wrapAsync(reviewController.createReview));

// Delete Review Route 
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync (reviewController.destroyReview));
 
module.exports = router;