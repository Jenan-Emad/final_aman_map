import Hazard from "../models/Hazard.js";
import { hazardValidator } from "../validation/index.js";

export const createHazard = async (data) => {
  try {
    const { error } = hazardValidator(data);
    if (error) {
      return {
        success: false,
        status: 400,
        message: error.details[0].message,
      };
    }
    const [lng, lat] = data.geometry.coordinates

    const insideGaza = Hazard.pointInGazaPolygon(lat, lng);
    if (!insideGaza) {
      return {
        success: false,
        status: 400,
        message: "يجب أن تكون منطقة الخطر داخل حدود قطاع غزة",
      };
    }

    console.log("hazard data", data);
    const hazard = await Hazard.create(data);

    console.log("created hazard", hazard);
    return {
      success: true,
      status: 201,
      message: "the hazard has been created successfully",
      hazard,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: error.message || "Internal Server Error",
    };
  }
};

// this function used to update the status of hazard
export const updateHazardData = async (hazardId) => {
  try {
    const hazard = await Hazard.findById(hazardId);
    if (!hazard) {
      return {
        success: false,
        status: 404,
        message: "Hazard not found",
      };
    }
    //update hazard status
    await hazard.resolveHazardStatus();
    await hazard.save();
    return {
      success: true,
      status: 200,
      message: "Hazard updated successfully",
      hazard,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: error.message || "Internal Server Error",
    };
  }
};

export const updateVerificationSummary = async  (verificationType, hazardId) =>{
const hazard = await Hazard.findById(hazardId);
if(!hazard) {
  return {
        success: false,
        status: 404,
        message: "Hazard not found",
      };
}
  switch (verificationType) {
    case "document": hazard.verificationSummary.documentCount++;
    break;
    case "report": hazard.verificationSummary.reportCount++;
    break;
    case "end": hazard.verificationSummary.endRequestCount++;
    break;
  }
await hazard.save();

}
