import express from "express";
import {addHazard} from "../controllers/AddHazardController.js";
import {errorHandler} from "../middlewares/errorHandler.js";

const router = express.Router();

router.post("/addHazard",  addHazard);

export default router;