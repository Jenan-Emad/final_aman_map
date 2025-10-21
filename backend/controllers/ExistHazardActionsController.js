// import {
//   createHazard,
//   addReport,
//   addLog,
//   addDevice,
// } from "../services/index.js";
// import { Hazard, Report } from "../models/index.js";
// import mongoose from "mongoose";

// const validateRequest = (body) => {
//   const { verificationType, hazardId, device } = body;
//   const errors = [];

//   const validTypes = ["document", "report", "end"];
//   if (!validTypes.includes(verificationType)) {
//     errors.push("Invalid or missing verificationType");
//   }

//   if (!hazardId) {
//     errors.push("Hazard ID is required");
//   }

//   if (!device?.visitorId) {
//     errors.push("Device information is required");
//   }

//   return errors;
// }

// const updateHazardVerificationSummary = async (hazard, verificationType) => {
//   const summaryFieldMap = {
//     document: 'documentCount',
//     report: 'reportCount',
//     end: 'endRequestCount'
//   };

//   const field = summaryFieldMap[verificationType];
//   if (field) {
//     hazard.verificationSummary[field] += 1;
//     await hazard.save();
//   }
// };

// const handleVerification = async (req, res, next) => {
//   const session = await mongoose.startSession();

//   try {
//     await session.withTransaction(async () => {
//       // Input validation
//       const validationErrors = validateRequest(req.body);
//       if (validationErrors.length > 0) {
//         return res.status(400).send({
//           message: "Validation failed",
//           errors: validationErrors
//         });
//       }

//       const { verificationType, hazardId, device } = req.body;

//       // Check if device already confirmed (with session for consistency)
//       const alreadyConfirmed = await Report.validateNotConfirmed(
//         verificationType,
//         device.visitorId
//       ).session(session);

//       if (!alreadyConfirmed) {
//         return res.status(400).send({
//           message: "Device has already confirmed this report"
//         });
//       }

//       // Find or create report in single operation
//       let report = await Report.findOne({
//         hazard: hazardId,
//         verificationType
//       }).session(session);

//       if (!report) {
//         // Create device and report atomically
//         const newDevice = await addDevice(device).session(session);
//         if (!newDevice.success) {
//           return res.status(newDevice.status).send({
//             message: newDevice.message
//           });
//         }

//         const newReportResult = await addReport({
//           hazard: hazardId,
//           verificationType,
//           reportedByDevice: newDevice.device._id.toString(),
//         }).session(session);

//         if (!newReportResult.success) {
//           return res.status(newReportResult.status).send({
//             message: newReportResult.message
//           });
//         }

//         report = newReportResult.report || newReportResult;
//       }

//       // Add device confirmation
//       const deviceResult = await addDevice(device).session(session);
//       if (!deviceResult.success) {
//         return res.status(deviceResult.status).send({
//           message: deviceResult.message
//         });
//       }

//       // Update report confirmations
//       report.confirmations = report.confirmations || [];
//       report.confirmations.push(deviceResult.device._id);
//       await report.save({ session });

//       // Update hazard verification summary
//       const hazard = await Hazard.findById(hazardId).session(session);
//       if (hazard) {
//         await updateHazardVerificationSummary(hazard, verificationType);
//       }

//       // Async log entry (don't block response)
//       addLog(report._id, deviceResult.device._id, verificationType)
//         .catch(logErr => {
//           console.error("addLog error:", logErr);
//           // Consider sending to error monitoring service
//         });

//       return res.status(200).send({
//         message: "Verification recorded successfully",
//         reportId: report._id
//       });
//     });
//   } catch (err) {
//     console.error("Verification process error:", err);
//     next(err);
//   } finally {
//     session.endSession();
//   }
// };

import {
  addReport,
  addLog,
  addDevice,
} from "../services/index.js";
import { Hazard, Report, Log } from "../models/index.js";

const existHazardAction1 = async (req, res, next) => {
  try {
    const verificationType = req.body.verificationType;
    const validTypes = ["document", "report", "end"];
    
    if (!validTypes.includes(verificationType) || !verificationType) {
      return res.status(400).send({ message: "Invalid or missing verificationType" });
    }

    if (!req.body.hazardId) {
      return res.status(400).send({ message: "Hazard ID is required" });
    }

    if (!req.body.device || !req.body.device.visitorId) {
      return res.status(400).send({ message: "Device information is required" });
    }

    const hazardId = req.body.hazardId;

    // ✅ 1. احصل على الـ device أولاً
    const deviceResult = await addDevice(req.body.device);
    if (!deviceResult.success) {
      return res.status(deviceResult.status).send({ message: deviceResult.message });
    }

    // ✅ 2. تحقق من الـ cooldown
    const canPerformAction = await Log.validateLastActivation(
      deviceResult.device._id.toString(),
      verificationType
    );

    if (!canPerformAction) {
      return res.status(429).send({ 
        message: "يجب الانتظار 15 دقيقة قبل تنفيذ نفس الإجراء مرة أخرى",
        code: 'COOLDOWN_ACTIVE'
      });
    }

    // ✅ 3. ابحث عن الـ report
    let report = await Report.findOne({ hazard: hazardId, verificationType });
    
    if (!report) {
      // إنشاء report جديد
      const newReportResult = await addReport({
        hazard: hazardId,
        verificationType,
        reportedByDevice: deviceResult.device._id.toString(),
      });

      if (!newReportResult.success) {
        return res.status(newReportResult.status).send({ message: newReportResult.message });
      }

      report = newReportResult.report || newReportResult;

      // ✅ حفظ الـ log
      const log = await addLog({
        reportId: report._id.toString(),
        verifyingDevice: deviceResult.device._id.toString(),
        verificationType,
      });
      
      if (!log.success) {
        console.error("addLog error:", log.message);
      }

      // ✅ تحديث حالة الـ hazard
      const hazard = await Hazard.findById(hazardId);
      if (hazard) {
        await hazard.resolveHazardStatus();
        await hazard.save(); // ✅ مهم جداً!
      }

      return res.status(201).send({ message: "تم إنشاء التقرير وتسجيل التحقق بنجاح" });
    }

    // ✅ 4. تحقق إذا الجهاز أكد من قبل
    const alreadyConfirmed = report.confirmations.some(
      confirmId => confirmId.toString() === deviceResult.device._id.toString()
    );

    if (alreadyConfirmed) {
      return res.status(400).send({ message: "لقد قمت بتأكيد هذا التقرير مسبقاً" });
    }

    // ✅ 5. أضف التأكيد الجديد
    report.confirmations.push(deviceResult.device._id);
    await report.save();

    // ✅ 6. حدّث عداد الـ hazard
    const hazard = await Hazard.findById(report.hazard);
    if (hazard) {
      switch (verificationType) {
        case "document":
          hazard.verificationSummary.documentCount += 1;
          break;
        case "report":
          hazard.verificationSummary.reportCount += 1;
          break;
        case "end":
          hazard.verificationSummary.endRequestCount += 1;
          break;
      }

      // ✅ حدّث الحالة واحفظ
      await hazard.resolveHazardStatus();
      await hazard.save(); // ✅ مع await
    }

    // ✅ 7. سجّل في الـ log
    const log = await addLog({
      reportId: report._id.toString(),
      verifyingDevice: deviceResult.device._id.toString(),
      verificationType,
    });
    
    if (!log.success) {
      console.error("addLog error:", log.message);
    }

    return res.status(200).send({ message: "تم تسجيل التحقق بنجاح" });
      
  } catch (err) {
    console.error("Error in existHazardAction1:", err);
    next(err);
  }
};

export { existHazardAction1 };