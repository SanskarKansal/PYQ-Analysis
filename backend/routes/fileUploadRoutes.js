import express from "express";
import multer from "multer";
import asyncHandler from "express-async-handler";
import { processFiles } from "../controllers/fileUploadController.js";
import { TopicModel } from "../models/Topic.js"; // Import TopicModel

const router = express.Router();

// 🔹 Use memory storage if directly sending files to FastAPI
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.fields([{ name: "pyqs" }, { name: "syllabus" }]), asyncHandler(processFiles));

router.get("/most-asked-topics", asyncHandler(async (req, res) => {
    const topics = await TopicModel.find().sort({ count: -1 }).limit(10);
    res.json(topics);
}));

export default router;
