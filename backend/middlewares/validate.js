// const {validateHazard} = require("../validation");
import {validateHazard} from "../validation/index.js";

const validate = (validator) => {
  return (req, res, next) => {
    const { error } = validateHazard(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    next();
  };
};
export default validate;
