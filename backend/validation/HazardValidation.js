import Joi from 'joi';

const schema= Joi.object({
    geometry: Joi.object({
        type: Joi.string().valid('Point').required(),
        coordinates: Joi.array().items(Joi.number()).length(2).required()
    }).required(),
    status: Joi.string().valid('documented', 'reported', 'ended', 'pending'),
    verificationSummary: Joi.object({
        reportCount: Joi.number().default(0),
        documentCount: Joi.number().default(0),
        endRequestCount: Joi.number().default(0)
    }),
    dangerType: Joi.string()
      .required()
      .valid("airstrike", "artillery", "naval_shelling", "other"),
    colorCode: Joi.string().required(),
    relatedReports: Joi.array().items(Joi.string().hex().length(24)),
    updatedAt: Joi.date()
});

export default (hazard) => schema.validate(hazard);