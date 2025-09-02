import express from "express";
import { ensureAuthenticated } from "../middlewares/authEnsure.js";
import {generatePotentialQuestions, generateTopicSummary, handleAiResponse} from "../controllers/ai.js";
const router=express.Router();
router.post("/extract", handleAiResponse);
router.post("/potentialQuestions",ensureAuthenticated,generatePotentialQuestions);
router.post("/summary",generateTopicSummary);
export default router;