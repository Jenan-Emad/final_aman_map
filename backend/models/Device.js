import dbConnection from "../config/index.js";
import mongoose from "mongoose";
import { WebServiceClient } from "@maxmind/geoip2-node";

const client = new WebServiceClient(
  process.env.MAXMIND_ACCOUNT_ID,
  process.env.MAXMIND_LICENSE_KEY
);

const deviceSchema = new mongoose.Schema({
  ipAddress: { type: String, required: true },
  visitorId: { type: String, required: true, unique: true }, // unique: true already creates index
  createdAt: { type: Date, default: Date.now }
});

// Validation functions

// Validate user location using MaxMind GeoIP

deviceSchema.statics.validateUserLocation = async function (ipAddress) {
  try {
    const DeviceLocationCity = await client.city(ipAddress);
    if (!DeviceLocationCity.city ||DeviceLocationCity.city.names.en !== "Gaza") {
      return false;
    }
    return true;
  } catch (err) {
    console.error("GeoIP lookup failed:", err);
    return false; // On error, consider location invalid
  }
};
 

export default dbConnection.model("Device", deviceSchema);