import express from "express";
import { getAllHazards } from "../controllers/GetHazardsController.js";
import { errorHandler } from "../middlewares/errorHandler.js"

const router = express.Router();

router.get("/hazards", errorHandler, getAllHazards);

export default router;