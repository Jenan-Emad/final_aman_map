import Hazard from "../models/Hazard.js";

const removeHazard = async (req, res, next) => {
  try {
    const { hazardId } = req.params;
    await Hazard.findByIdAndRemove(hazardId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export default removeHazard;
