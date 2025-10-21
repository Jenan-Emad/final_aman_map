// import dbConnection from "../config/index.js";
// import mongoose from "mongoose";
// import { WebServiceClient } from "@maxmind/geoip2-node";
// const client = new WebServiceClient(
//   process.env.MAXMIND_ACCOUNT_ID,
//   process.env.MAXMIND_LICENSE_KEY
// );

// const deviceSchema = new mongoose.Schema({
//   // deviceType: { type: String, required: true }, //I think this info is not important because we use the visitorId which mainly depend on these information
//   ipAddress: { type: String, required: true, unique: true },
//   visitorId: { type: String, required: true, unique: true }, // this is the unique id from fingerprintjs library
//   // lastActive: { type: Date, default: Date.now },
//   //I commented location because we do not want to view it we only use it to validate the user location using ip address and maxmind service
//   // location: {
//   //   type: {
//   //     type: String,
//   //     enum: ["Point"],
//   //     required: true,
//   //   },
//   //   coordinates: {
//   //     type: [Number],
//   //     required: true,
//   //   },
//   // },
// });

// // deviceSchema.index({ location: "2dsphere" });

// //validation functions

// //validate user location  tested: true with ip example
// deviceSchema.statics.validateUserLocation = async function (ipAddress) {
//   try {
//     const DeviceLocationCity = await client.city(ipAddress);
//     if (!DeviceLocationCity.city ||DeviceLocationCity.city.names.en !== "Gaza") {
//       return false;
//     }
//     return true;
//   } catch (err) {
//     console.error("GeoIP lookup failed:", err);
//     return false; // On error, consider location invalid
//   }
// };

// //validate user fingerprint
// deviceSchema.statics.validateVisitorId = async function (visitorId) {
//   const device = await this.findOne({ visitorId: visitorId });
//   if (!device) {
//     return false; // Device not found
//   }
//   return true;
// };


// //validate ip address
// deviceSchema.statics.validateIpAddress = async function (ipAddress) {
//   const device = await this.findOne({ ipAddress: ipAddress });
//   if (!device) {
//     return false; // Device not found
//   }
//   return true;
// };

// export default dbConnection.model("Device", deviceSchema);


import dbConnection from "../config/index.js";
import mongoose from "mongoose";
import { WebServiceClient } from "@maxmind/geoip2-node";

const client = new WebServiceClient(
  process.env.MAXMIND_ACCOUNT_ID,
  process.env.MAXMIND_LICENSE_KEY
);

const deviceSchema = new mongoose.Schema({
  ipAddress: { type: String, required: true },
  visitorId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
});

// Create index on visitorId for faster lookups
deviceSchema.index({ visitorId: 1 });

// Validation functions

// Validate user location using MaxMind GeoIP
deviceSchema.statics.validateUserLocation = async function (ipAddress) {
  try {
    // Skip validation for localhost/development
    if (ipAddress === '127.0.0.1' || ipAddress === '::1' || ipAddress === '0.0.0.0') {
      console.log("Development mode: Skipping location validation");
      return true;
    }

    // Validate with MaxMind
    const DeviceLocationCity = await client.city(ipAddress);

    // Check if city is Gaza
    if (DeviceLocationCity.city && DeviceLocationCity.city.names.en === "Gaza") {
      return true;
    }

    // Also check country for broader validation
    if (DeviceLocationCity.country &&
      DeviceLocationCity.country.names.en === "Palestine") {
      return true;
    }

    console.log("Location validation failed:", {
      city: DeviceLocationCity.city?.names.en,
      country: DeviceLocationCity.country?.names.en
    });

    return false;
  } catch (err) {
    console.error("GeoIP lookup failed:", err);
    // In production, you might want to return false here
    // For development, return true to allow testing
    return process.env.NODE_ENV === 'development' ? true : false;
  }
};


// Validate visitor ID exists (for checking existing devices)
deviceSchema.statics.validateVisitorId = async function (visitorId) {
  const device = await this.findOne({ visitorId: visitorId });
  return device !== null;
};

// Validate IP address exists (for checking existing devices)
deviceSchema.statics.validateIpAddress = async function (ipAddress) {
  const device = await this.findOne({ ipAddress: ipAddress });
  return device !== null;
};

// Update last active timestamp
deviceSchema.methods.updateActivity = async function () {
  this.lastActive = new Date();
  return this.save();
};


export default dbConnection.model("Device", deviceSchema);