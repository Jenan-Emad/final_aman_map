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
    // const isValid = await Log.validateLastActivation((data.verifyingDevice, data.verificationType));
    // if (!isValid) {
      // if (!Log.validateLastActivation(data.verifyingDevice, data.verificationType)) {
      // ✅ FIXED - Properly awaited
const isRecentlyActivated = await Log.validateLastActivation(
  data.verifyingDevice, 
  data.verificationType
);

if (!isRecentlyActivated) {
  return {
    success: false,
    status: 429, // Too Many Requests
    message: "يجب الانتظار 10 دقيقة قبل تنفيذ نفس الإجراء مرة أخرى",
  }
}
      // return {
      //   success: false,
      //   status: 400,
      //   message: "Device has already activated a log recently",
      // }
    // }
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
