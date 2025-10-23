import Hazard from "../models/Hazard.js";
import Report from "../models/Report.js";
import { reportValidator } from "../validation/index.js";

const addReport = async (data) => {
  try {
    const { error } = reportValidator(data);
    if (error) {
      return {
        success: false,
        status: 400,
        message: error.details[0].message,
      };
    }

    console.log("report data", data);
    const report = await Report.create(data);

    report.confirmations.push(data.reportedByDevice);
    await report.save();

    const hazard = await Hazard.findOne(report.hazard);
    console.log("related hazard:", hazard);

    switch (report.verificationType) {
      case "document":
        hazard.verificationSummary.documentCount++;
        break;
      case "report":
        hazard.verificationSummary.reportCount++;
        break;
      case "end":
        hazard.verificationSummary.endRequestCount++;
        break;
    }
    await hazard.save();

    console.log("created report", report);
    return {
      success: true,
      status: 201,
      message: "the report has been created successfully",
      report,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: error.message || "Internal Server Error",
    };
  }
};

export { addReport };
