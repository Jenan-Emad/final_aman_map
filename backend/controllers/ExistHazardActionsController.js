import {
  addReport,
  addLog,
  addDevice,
  updateHazardData,
} from "../services/index.js";
import { Report } from "../models/index.js";

const existHazardAction1 = async (req, res, next) => {
  try {
    const verificationType = req.body.verificationType;
    const validTypes = ["document", "report", "end"];
    if (!validTypes.includes(verificationType) || !verificationType) {
      return res
        .status(400)
        .send({ message: "نوع التحقق غير صالح أو غير متوفر" });
    }

    if (!req.body.hazardId) {
      return res.status(400).send({ message: "منطقة الخطر هذه غير موجودة" });
    }

    const hazardId = req.body.hazardId;

    // find report by hazard + verificationType
    let report = await Report.returnExistReport(hazardId, verificationType);
    if (!report) {
      // create device if needed
      const newDevice = await addDevice(req.body.device);

      if (!newDevice.success) {
        return res
          .status(newDevice.status)
          .send({ message: newDevice.message });
      }

      // create report
      const newReportResult = await addReport({
        hazard: hazardId,
        verificationType,
        reportedByDevice: newDevice.device._id.toString(),
      });

      if (!newReportResult.success) {
        return res
          .status(newReportResult.status)
          .send({ message: newReportResult.message });
      }

      //update hazard data
      await updateHazardData(newReportResult.report.hazard);

      const log = await addLog({
        reportId: newReportResult.report._id.toString(),
        verifyingDevice: newDevice.device._id.toString(),
        verificationType,
      });
      if (!log.success || !log || !log.log) {
        return res.status(log.status).send({ message: log.message });
      }
      return res.status(201).send({
        message: "تمت عملية إنشاء التقرير بنجاح",
        report,
      });
    }

    // check if the device already confirmed this report
    const validateNotConfirmed = await report.validateNotConfirmed(
      req.body.device.visitorId
    );
    if (validateNotConfirmed) {
      const deviceResult = await addDevice(req.body.device);
      if (!deviceResult.success) {
        return res
          .status(deviceResult.status)
          .send({ message: deviceResult.message });
      }

      // add this device to report confirmations
      report.confirmations = report.confirmations || [];
      await report.confirmations.push(deviceResult.device._id);
      await report.save();

      //update the hazard data
      await updateHazardData(report.hazard);

      // add log entry (assumes addLog returns a promise)
      const log = await addLog({
        reportId: report._id.toString(),
        verifyingDevice: deviceResult.device._id.toString(),
        verificationType,
      });
      if (!log.success || !log || !log.log) {
        return res.status(log.status).send({ message: log.message });
      }

      return res
        .status(200)
        .send({ message: "تمت عملية تسجيل التحقق بنجاح" });
    } else {
      return res
        .status(400)
        .send({ message: "تم تأكيد هذا العملية مسبقًا من قِبل هذا الجهاز" });
    }
  } catch (err) {
    next(err);
  }
};
export { existHazardAction1 };
