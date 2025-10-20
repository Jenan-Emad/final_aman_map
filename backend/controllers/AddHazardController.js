import {
  createHazard,
  addReport,
  addLog,
  addDevice,
} from "../services/index.js";
import Hazard from "../models/Hazard.js";

// const addHazardAction = (req, res, next) => {
//   try {
//     addDevice(req.body.device, (deviceResult) => {
//       if (deviceResult.success === false) {
//         return res.status(deviceResult.status).json(deviceResult);
//       }
//       console.log("device result", deviceResult);
//       const deviceId = deviceResult.device._id.toString();
//       createHazard(req.body.hazard, (hazardResult) => {
//         if (hazardResult.success === false) {
//           return res.status(hazardResult.status).json(hazardResult);
//         }
//         console.log("hazard result", hazardResult);
//         req.body.report.reportedByDevice = deviceId.toString();
//         addReport(req.body.report, (reportResult) => {
//           console.log("report result", reportResult);
//           if (reportResult.success === false) {
//             return res.status(reportResult.status).json(reportResult);
//           }
//           const reportId = reportResult.report._id.toString();
//           const logData = {
//             reportId,
//             verifyingDevice: deviceId,
//             verificationType: req.body.log.verificationType,
//           };
//           addLog(logData, (logResult) => {
//             console.log("log result", logResult);
//             if (logResult.success === false) {
//               return res.status(logResult.status).json(logResult);
//             }
//             res.status(201).json({
//               success: true,
//               message: "the hazard have been created successfully",
//             });
//           });
//         });
//       });
//     });
//   } catch (err) {
//     next(err);
//   }
// };

const addHazard = async (req, res, next) => {

  try {
    const device = await addDevice(req.body.device);
    if(!device.success || !device || !device.device){
      return  res.status(device.status).send({ message: device.message });
    }
    const hazard =  await createHazard(req.body.hazard);
    if(!hazard.success ||!hazard || !hazard.hazard){
      return  res.status(hazard.status).send({ message: hazard.message });
    }
    const reportData = {
      verificationType: "document",
      hazard: hazard.hazard._id.toString(),
      reportedByDevice: device.device._id.toString(),
    };
    const report = await addReport(reportData);
    report.report.confirmations = [device.device._id.toString()];
    await report.report.save();

    if(!report.success || !report || !report.report){
      return  res.status(report.status).send({ message: report.message });
    }
    const logData = {
      reportId: report.report._id.toString(),
      verifyingDevice: device.device._id.toString(),
      verificationType: "document",
    };
    const log = await addLog(logData);
    if(!log.success || !log || !log.log){
      return  res.status(log.status).send({ message: log.message });
    }
    res.status(201).send({
      message: "the hazard have been created successfully",
    });


  } catch (err) {
    next(err);
  }
}


export { addHazard };
