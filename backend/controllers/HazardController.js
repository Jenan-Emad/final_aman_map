const Hazard = require("../models/Hazard");
const { validateHazard } = require('../validation');

const createHazard = async (req, res) => {
    try {
        const { error } = validateHazard(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }   
        const insideGaza = Hazard.pointInGazaPolygon(
            req.body.geometry.coordinates[1],
            req.body.geometry.coordinates[0]
        );
        if (!insideGaza) {
            return res.status(400).json({ message: "Hazard location must be within Gaza" });
        }
        const hazard = await Hazard.create(req.body);
        res.status(201).json({ message: "Hazard created successfully", hazard });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// عرض كل الـ Hazards
exports.getHazards = async (req, res) => {
  try {
    const hazards = await hazardService.getHazards();
    res.json({ success: true, data: hazards });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// عرض Hazard واحد حسب ID
exports.getHazardById = async (req, res) => {
  try {
    const hazard = await hazardService.getHazardById(req.params.id);
    if (!hazard) return res.status(404).json({ success: false, message: "غير موجود" });
    res.json({ success: true, data: hazard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//  تحديث Hazard
exports.updateHazard = async (req, res) => {
  try {
    const hazard = await hazardService.updateHazard(req.params.id, req.body);
    if (!hazard) return res.status(404).json({ success: false, message: "غير موجود" });
    res.json({ success: true, data: hazard });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

//  حذف Hazard
exports.deleteHazard = async (req, res) => {
  try {
    const hazard = await hazardService.deleteHazard(req.params.id);
    if (!hazard) return res.status(404).json({ success: false, message: "غير موجود" });
    res.json({ success: true, message: "تم الحذف" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
    createHazard
};