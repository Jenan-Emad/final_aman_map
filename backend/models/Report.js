import dbConnection from "../config/index.js";
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  // dangerType: {
  //   type: String,
  //   enum: ["evacuation", "incursion", "fire_control", "hard_to_reach"],
  //   required: true,
  // },
  // coordinates: {
  //   type: {
  //     type: String,
  //     enum: ["Point"],
  //     required: true,
  //   },
  //   coordinates: {
  //     type: [Number],
  //     validate: {
  //       validator: (v) => v.length == 2,
  //       message: (props) => `${props.value} must be [lng, lat]`,
  //     },
  //     required: true,
  //   },
  // },
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
  //the current state of this specific report
  // status: {
  //   type: String,
  //   enum: ["pending", "verified", "rejected"],
  //   default: "pending",
  // },
  confirmations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Device" }],
  createdAt: { type: Date, default: Date.now },
});

reportSchema.index({ coordinates: "2dsphere" }); // Geospatial index


//validation functions

// //validate if it included in confirmations
// reportSchema.statics.validateNotConfirmed = async function (
//   verificationType,
//   visitorId
// ) {
//   const report = await this.findOne({visitorId: visitorId, verificationType: verificationType});
//   if (!report) {
//     return true; // Report does not exist
//   }

//   for (let confirm of report.confirmations) {
//     if (confirm.toString() === visitorId.toString() && verificationType === report.verificationType) {
//       return false; // Device already confirmed
//     }
//   }
//   return true; // Not confirmed yet
// };

//validate if device already confirmed this report
reportSchema.statics.validateNotConfirmed = async function (
  verificationType,
  visitorId
) {
  // Find report with this verification type
  const report = await this.findOne({ verificationType: verificationType });
  
  if (!report) {
    return true; // No report exists for this type, so valid
  }

  // Check if this device is in confirmations
  const deviceInConfirmations = report.confirmations.some(
    confirmId => confirmId.toString() === visitorId.toString()
  );

  if (deviceInConfirmations) {
    return false; // Device already confirmed
  }

  return true; // Not confirmed yet
};


export default dbConnection.model("Report", reportSchema);
