import dbConnection from "../config/index.js";
import mongoose from "mongoose";
import Device from "./Device.js";

const reportSchema = new mongoose.Schema({
  verificationType: {
    type: String,
    enum: ["document", "report", "end"],
    required: true,
  },
  hazard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hazard",
  },
  reportedByDevice: { type: String, required: true },
  confirmations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Device" }],
  createdAt: { type: Date, default: Date.now },
});

//validation functions

//validate if it included in confirmations
reportSchema.methods.validateNotConfirmed = async function (visitorId) {
  const device = await Device.findOne({ visitorId });
  if (!device) return true;

  const alreadyConfirmed = this.confirmations.some(
    (id) => id.toString() === device._id.toString()
  );
  if (alreadyConfirmed) {
    return false;
  }

  return true; // true = not confirmed yet
};

// validate if report exists
reportSchema.statics.returnExistReport = async function (
  hazardId,
  verificationType
) {
  const report = await this.findOne({
    hazard: hazardId,
    verificationType: verificationType,
  });
  if (!report) {
    return null; // Report does not exist
  }
  return report; // Report exists
};

export default dbConnection.model("Report", reportSchema);
