import Hazard from "../models/Hazard.js";
import {hazardValidator}  from "../validation/index.js";

export const createHazard = async (data) => {
  try {
    const { error } = hazardValidator
    (data);
    if (error) {
      return {
        success: false,
        status: 400,
        message: error.details[0].message,
      }
    }
    const insideGaza = Hazard.pointInGazaPolygon(
      data.geometry.coordinates[1],
      data.geometry.coordinates[0]
    );
    if (!insideGaza) {
      return { 
        success: false,
        status: 400,
        message: "the hazard location must be within Gaza"
      };
    }

    
    console.log("hazard data", data);
    const hazard = await Hazard.create(data);
    hazard.verificationSummary.documentCount++;
    hazard.save();
    console.log("created hazard", hazard);
    return {
      success: true,
      status: 201,
      message: "the hazard has been created successfully",
      hazard
    }
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: error.message || "Internal Server Error",
    }
  }
};

//

// // عرض كل الـ Hazards
// exports.getHazards = async (data) => {
//     const hazards = await hazardService.getHazards();
//     return hazards;
// };

// // عرض Hazard واحد حسب ID
// exports.getHazardById = async (req, res) => {
//     const hazard = await hazardService.getHazardById(req.params.id);
//     if (!hazard) {
//         throw new Error("This hazard is not exist");
//     }
//     return hazard;
// };

// //  تحديث Hazard
// exports.updateHazard = async (data) => {
//     const hazard = await hazardService.updateHazard(req.params.id, req.body);
//     if (!hazard) {
//         throw new Error("This hazard is not exist");
//     }
//     return hazard;
// };

// //  حذف Hazard
// exports.deleteHazard = async (req, res) => {
//     const hazard = await hazardService.deleteHazard(req.params.id);
//     if (!hazard) {
//         throw new Error("This hazard is not exist")
//     }
//     return true;
// };

// export {
//   createHazard,
// };
