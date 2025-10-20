const Log  = require("../models/Log");
const { validateLog } = require("../validation");

const addLog = async (req, res, next) => {
  try {
    const { error } = validateLog(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });
    const recentlyActivated = await Log.validateLastActivation(
      req.body.deviceId
    );
    if (!recentlyActivated) {
      return res
        .status(400)
        .send({ message: "Device has already activated a log recently" });
    }

    await Log.create(req.body);
    res.status(201).send({ message: "Log created successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addLog,
}
