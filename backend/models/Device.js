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


export default dbConnection.model("Device", deviceSchema);