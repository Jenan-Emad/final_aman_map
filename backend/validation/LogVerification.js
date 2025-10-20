import Joi from 'joi';

const schema= Joi.object({
    reportId: Joi.string().hex().length(24).required(),
    verifyingDevice: Joi.string().hex().length(24).required(),
    verificationType: Joi.string().valid("document", "report", "end").required(),
    createdAt: Joi.date(),
    // ipAddress: Joi.string().ip({ version: ['ipv4', 'ipv6'] }).required()
});

export default (log) => schema.validate(log);