const Report = require("../models/Report");
const { validateReport } = require("../validation");

const addReport = async (req, res, next) => {
    try {
        const { error } = validateReport(req.body);
        if (error) return res.status(400).json({ success: false, message: error.details[0].message });
        const notConfirmed = await Report.validateNotConfirmed(req.body._id, req.body.reportedByDevice);
        if (!notConfirmed) {
            return res.status(400).json({ success: false, message: "Device has already confirmed this report" });
        }
        await Report.create(req.body);
        res.status(201).send({ message: "Report created successfully" });
    } catch (error) {
        next(error);
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


module.exports = {
    addReport
};
