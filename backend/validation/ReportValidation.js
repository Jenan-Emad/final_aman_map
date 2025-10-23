import Joi from "joi";

const schema = Joi.object({
  verificationType: Joi.string().required().valid("document", "report", "end"),
  hazard: Joi.string().hex().length(24).required(),
  reportedByDevice: Joi.string().hex().length(24).required(),
  confirmations: Joi.array()
    .items(
      Joi.string()
    )
    .default([]),
  createdAt: Joi.date(),
});

export default (report) => schema.validate(report);
