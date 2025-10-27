const Joi = require("joi");
const review = require("./Models/review");

module.exports.listingSchema = Joi.object({
    listing : Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().min(0).required(),
        image: Joi.string().allow("",null),
        tags: Joi.string().allow("",null),
        coordinates: Joi.object({
            lat: Joi.number(),
            lng: Joi.number()
        }).allow(null)
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review : Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().required()
    }).required()
}); 