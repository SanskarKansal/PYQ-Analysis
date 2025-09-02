import axios from "axios";
import { TopicModel } from "../models/Topic.js";

export const processFiles = async (req, res) => {
    try {
        console.log("Processing files...");

        if (!req.files || !req.files["pyqs"] || !req.files["syllabus"]) {
            return res.status(400).json({ error: "Missing required files" });
        }

        // Convert files to base64
        const pyqBuffers = req.files["pyqs"].map(file => file.buffer.toString("base64"));
        const syllabusBuffer = req.files["syllabus"][0].buffer.toString("base64");

        console.log("Sending files to Python API...");

        // Step 1: Send PDFs to Python OCR API
        const response = await axios.post("http://localhost:8000/process_pdfs", {
            pyq_files: pyqBuffers,
            syllabus: syllabusBuffer
        });

        const { syllabus_text, extracted_texts } = response.data;
        console.log("Extracted Syllabus Text:", syllabus_text);
        console.log("Extracted PYQ Texts:", extracted_texts);

        // Step 2: Send extracted text to AI for question extraction
        console.log("Sending extracted text to AI API...");
        const aiResponse = await axios.post("http://localhost:5000/api/ai/extract", {
            extractedText: extracted_texts.join("\n")
        });

        // console.log("AI Response:", aiResponse);
        console.log("Response data:", aiResponse.data);
        const { questions } = aiResponse?.data;
        // console.log("Extracted Questions:", questions);

        // Step 3: Store extracted questions in MongoDB
        for (const question of questions) {
            await TopicModel.create({ content: question });
        }

        // Step 4: Send response to frontend
        res.json({ 
            message: "Processed Successfully!", 
            syllabus_text, 
            extracted_texts,
            extracted_questions: questions
        });

    } catch (error) {
        console.error("Error processing files:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
