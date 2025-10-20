const Device = require("../models/Device");
const {validateDevice} = require("../validation");

const addDevice = (async (req, res, next) => {
    try {
        const {error} = validateDevice(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        if(!Device.validateUserLocation(req.body.ipAddress) || !Device.validateVisitorId(req.body.visitorId) || !Device.validateIpAddress(req.body.ipAddress)){
            return res.status(400).send(error.details[0].message);
        }
        await Device.create(req.body);
        res.status(201).send({message: "Device created successfully"});
    } catch (error) {
        next(error);
    }
});

const getDeviceById = (async (req, res, next) => {
    try {
        const device = await Device.findById(req.params.id);
        if (!device) return res.status(404).send({message: "Device not found"});
        res.status(200).send(device);
    } catch (error) {
        next(error);
    }
});

const getAllDevices = (async (req, res, next) => {
    try {
        const devices = await Device.find();
        res.status(200).send(devices);
    } catch (error) {
        next(error);
    }
});


module.exports = {
    addDevice,
    getDeviceById,
    getAllDevices
};