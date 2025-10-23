import dbConnection from "../config/index.js";
import mongoose from "mongoose";
import Device from "./Device.js";

const logSchema = new mongoose.Schema({
  reportId: { type: String, required: true },
  verifyingDevice: { type: String, required: true },
  verificationType: {
    type: String,
    enum: ["document", "report", "end"],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

//validation functions

//validate last activation time
logSchema.statics.validateLastActivation = async function (
  visitorId,
  verificationType
) {
  const device = await Device.findOne({ visitorId: visitorId });
  if (!device) {
    console.log("No device found for visitorId:", visitorId);
    return true;
  } // no device found, so valid
  const now = new Date();
  const log = await this.findOne({ verifyingDevice: device._id }).sort({
    createdAt: -1,
  }); // get latest log
  if (!log) {
    console.log("No previous logs found for device:", device._id);
    return true; // no previous logs, so valid
  }

  const diffInMinutes = (now - new Date(log.createdAt)) / (1000 * 60); // difference in minutes
  if (log.verificationType?.trim().toLowerCase() === verificationType?.trim().toLowerCase() && diffInMinutes < 10) {
    console.log("Last log too recent for same type:", log);
    return false; // same type within 10 minutes is invalid
  }
  if (log.verificationType?.trim().toLowerCase() !== verificationType?.trim().toLowerCase() && diffInMinutes < 1) {
    console.log("Last log too recent for different type:", log);
    return false; // different type within 5 minutes is invalid
  }
  console.log("Last log:", log);
  console.log("Diff in minutes:", diffInMinutes);
  return true; // valid
};


export default dbConnection.model("Log", logSchema);
