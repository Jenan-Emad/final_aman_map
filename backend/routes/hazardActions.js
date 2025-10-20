import express from "express";
import {existHazardAction1} from "../controllers/ExistHazardActionsController.js";
import {errorHandler} from "../middlewares/errorHandler.js";

const router = express.Router();

router.post("/hazardAction",  existHazardAction1);

export default router;