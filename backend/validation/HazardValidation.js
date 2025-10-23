import Joi from "joi";

const schema = Joi.object({
  geometry: Joi.object({
    type: Joi.string().valid("Point").required(),
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
  }).required(),

  status: Joi.object({
    documented: Joi.boolean().default(false),
    reported: Joi.boolean().default(false),
    ended: Joi.boolean().default(false),
    documentedAt: Joi.date().optional(),
    reportedAt: Joi.date().optional(),
    endedAt: Joi.date().optional(),
    displayStatus: Joi.string().default("pending"),
  }),

  verificationSummary: Joi.object({
    reportCount: Joi.number().integer().min(0).default(0),
    documentCount: Joi.number().integer().min(0).default(0),
    endRequestCount: Joi.number().integer().min(0).default(0),
  }),

  dangerType: Joi.string()
    .required()
    .valid("airstrike", "artillery", "naval_shelling", "other"),

  colorCode: Joi.string().required(),
  updatedAt: Joi.date(),
});

export default (hazard) => schema.validate(hazard);
