import express from "express";
import { getAllHazards } from "../controllers/GetHazardsController.js";

const router = express.Router();

router.get("/hazards", getAllHazards);

export default router;