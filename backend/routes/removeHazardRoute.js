import express from "express";
import {RemoveHazardController} from "../controllers/RemoveHazardController.js";
import {errorHandler} from "../middlewares/errorHandler.js";

const router = express.Router();

router.post("/removeHazard/:hazardId",  errorHandler, RemoveHazardController);

export default router;