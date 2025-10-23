import Device from "../models/Device.js";
import { deviceValidator } from "../validation/index.js";
import Log from "../models/Log.js";

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

  try {
    // Check if device already exists
    let existingDevice = await Device.findOne({ 
      visitorId: data.visitorId 
    });

    if (existingDevice) {
      const isUserActivationValid = await Log.validateLastActivation(
        data.visitorId,
        data.verificationType
      );
      if (!isUserActivationValid) {
        console.log(
          "Device activation too recent for visitorId:",
          data.visitorId
        );
        return {
          success: false,
          status: 400,
          message:
            "الجهاز قام بتفعيل هذا النوع من السجلات مؤخراً. الرجاء الانتظار قبل المحاولة مرة أخرى.",
        };
      }
      // Device exists, return it
      console.log("Device already exists:", existingDevice);
      return {
        success: true,
        status: 200,
        message: "Device already registered",
        device: existingDevice,
      };
    }

    // Create new device
    console.log("Creating new device with data:", data);
    const device = await Device.create(data);
    console.log("Created device:", device);

    return {
      success: true,
      status: 201,
      message: "The device has been created successfully",
      device,
    };
  } catch (err) {
    console.error("Error in addDevice service:", err);
    return {
      success: false,
      status: 500,
      message: err.message || "Internal Server Error",
    };
  }
};