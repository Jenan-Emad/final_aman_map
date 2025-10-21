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
                message: error.details[0].message
            }
        }
        const notConfirmed = await Report.validateNotConfirmed(data.verificationType, data.reportedByDevice);
        if (!notConfirmed) {
            return {
                success: false,
                status: 400,
                message: "Device has already confirmed this report"
            }
        }
        console.log("report data", data);
        const report = await Report.create(data);
        console.log("created report:", report);
        report.confirmations.push(data.reportedByDevice);
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
        console.log("created report", report);
        return {
            success: true,
            status: 201,
            message: "the report has been created successfully",
            report
        }
    } catch (error) {
        return {
            success: false,
            status: 500,
            message: error.message || "Internal Server Error",
        }
    }
};

// I comment them because they are not used except from the system so they did not require a route for now(res, req, next) => { ... }

// const getReportsByHazard = async (hazardId) => {
//     return await Report.find({ hazardId });
// };

// const getReportById = async (reportId) => {
//     return await Report.findById(reportId);
// };

// const updateReport = async (reportId, updateData) => {
//     return await Report.findByIdAndUpdate(reportId, updateData, { new: true });
// };

// const deleteReport = async (reportId) => {
//     return await Report.findByIdAndDelete(reportId);
// };


export {
    addReport
};
