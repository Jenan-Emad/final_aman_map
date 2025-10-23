import Joi from 'joi';

const schema= Joi.object({
    ipAddress: Joi.string().ip({ version: ['ipv4', 'ipv6'] , cidr: "optional"}).required(),
    visitorId: Joi.string().required(),
    lastActive: Joi.date(),
});

export default (device) => schema.validate(device);