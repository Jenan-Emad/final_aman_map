import Device from "../models/Device.js";
import Log from "../models/Log.js";
import { deviceValidator } from "../validation/index.js";

export const addDevice = async (data) => {
  // validate input data
  const { error } = deviceValidator(data);
  if (error) {
    return {
      success: false,
      status: 400,
      message: error.details[0].message,
    };
  }

  // validate device fields
  const isUserLocationValid = await Device.validateUserLocation(data.ipAddress);
  const isVisitorIdValid = await Device.validateVisitorId(data.visitorId);
  const isIpAddressValid = await Device.validateIpAddress(data.ipAddress);
  
  if (!isUserLocationValid || !isVisitorIdValid || !isIpAddressValid) {
    return {
      success: false,
      status: 400,
      message: "Something is wrong with your device",
    };
  }

  try {
    console.log("device data", data);
    const device = await Device.create(data); // create device in DB
    console.log("created device", device);

    return {
      success: true,
      status: 201,
      message: "The device has been created successfully",
      device,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: err.message || "Internal Server Error",
    };
  }
};


// const getDeviceById = (async (req, res, next) => {
//     try {
//         const device = await Device.findById(req.params.id);
//         if (!device) return res.status(404).send({message: "Device not found"});
//         res.status(200).send(device);
//     } catch (error) {
//         next(error);
//     }
// });

// const getAllDevices = (async (req, res, next) => {
//     try {
//         const devices = await Device.find();
//         res.status(200).send(devices);
//     } catch (error) {
//         next(error);
//     }
// });

// export {
//   addDevice,
//   // getDeviceById,
//   // getAllDevices
// };
