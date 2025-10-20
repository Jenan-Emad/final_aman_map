import Log from "../models/Log.js";
import { logValidator } from "../validation/index.js";

export const addLog = async (data) => {
  try {
    const { error } = logValidator(data);
    if (error) {
      return {
        success: false,
        status: 400,
        message: error.details[0].message,
      }
    }

    if (!Log.validateLastActivation(data.verifyingDevice, data.verificationType)) {
      return {
        success: false,
        status: 400,
        message: "Device has already activated a log recently",
      }
    }
    console.log("log data", data);
    const log = await Log.create(data);
    console.log("created log", log);
    return {
      success: true,
      status: 201,
      message: "the log has been created successfully",
      log
    }
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: error.message || "Internal Server Error",
    }
  }
};

// export{
//   addLog,
// };
