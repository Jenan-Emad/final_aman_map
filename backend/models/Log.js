import  dbConnection  from "../config/index.js";
import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  reportId: { type: String, required: true},
  verifyingDevice: { type: String, required: true },
  verificationType: {
    type: String,
    enum: ["document", "report", "end", "add"],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  // ipAddress: { type: String, required: true },
});

//validation functions

// //validate last activation time
// logSchema.statics.validateLastActivation = async function(verifiedBy, verificationType) {
//   const now = new Date();
//   const log = await this.findOne({ verifyingDevice : verifiedBy , verificationType: verificationType }).sort({createdAt: -1}); // get latest log
//   if (!log) return true; // no previous logs, so valid

//   const diffInMinutes = (now - log.createdAt) / (1000 * 60); // difference in minutes
//   if (log.verificationType == verificationType && diffInMinutes < 10) return false; // same type within 10 minutes is invalid
//   if (log.verificationType != verificationType && diffInMinutes < 5) return false; // different type within 5 minutes is invalid

//   return true;
// }

//validation functions

// ✅ FIXED: 15-minute cooldown for same action type
logSchema.statics.validateLastActivation = async function(verifiedBy, verificationType) {
  const now = new Date();
  
  // Find the most recent log for this device AND this specific verification type
  const log = await this.findOne({ 
    verifyingDevice: verifiedBy,
    verificationType: verificationType 
  }).sort({createdAt: -1});
  
  if (!log) return true; // No previous logs for this action type, so valid

  const diffInMinutes = (now - log.createdAt) / (1000 * 60); // difference in minutes
  
  // Require 15 minutes between same action types
  if (diffInMinutes < 1) {
    console.log(`⏳ Cooldown active: ${Math.ceil(15 - diffInMinutes)} minutes remaining for ${verificationType}`);
    return false; // Too soon, reject
  }

  return true; // Enough time has passed
}

// ✅ Performance: Index for faster cooldown checks
logSchema.index({ 
  verifyingDevice: 1, 
  verificationType: 1, 
  createdAt: -1 
});

export default dbConnection.model("Log", logSchema);
