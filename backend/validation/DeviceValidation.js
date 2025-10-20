import Joi from 'joi';

const schema= Joi.object({
    ipAddress: Joi.string().ip({ version: ['ipv4', 'ipv6'] , cidr: "optional"}).required(),
    // deviceType: Joi.string().required(),
    visitorId: Joi.string().required(),
    // lastActive: Joi.date().required(),
    // location: Joi.object({
    //     type: Joi.string().valid('Point').required(),
    //     coordinates: Joi.array().items(Joi.number()).length(2).required()
    // }).required()
});

export default (device) => schema.validate(device);