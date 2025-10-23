import {
  createHazard,
  addReport,
  addLog,
  addDevice,
} from "../services/index.js";

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

    const report = await addReport({
      verificationType: "document",
      hazard: hazard.hazard._id.toString(),
      reportedByDevice: device.device._id.toString()
    });

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
