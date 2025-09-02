import { GoogleGenerativeAI } from "@google/generative-ai";

export const handleAiResponse = async (req, res) => {
  try {
    const { extractedText } = req.body; 
    
    if (!extractedText) {
      return res.status(400).json({ error: "No extracted text provided" });
    }

    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


    const prompt = `

      Given the following extracted text from a scanned exam paper, your task is to analyze the text 
      and return  the questions.

      Ensure:
      1. The extracted questions should be clearly structured and free from unnecessary text.
      2. If a question is split across multiple lines, combine them properly.
      3. Ignore any non-question content such as instructions, numbers, or formatting artifacts.
      Here is the extracted text:
      ${extractedText}
      
    `;

    console.log("Sending prompt to Gemini...");

    const result = await model.generateContent(prompt);
    const responseText = result.response.text(); 

    // console.log("Gemini Response:", responseText);
    console.log("Gemini Response Received");

    return res.status(200).json({ans:responseText});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};

export const generatePotentialQuestions = async (req, res) => {
  try {
    const { questions } = req.body; 
    
    if (!questions) {
      return res.status(400).json({ error: "No questions provided" });
    }

    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `

      Generate  few  similar (Potential Questions) for upcoming exam based on these pyqs 
      ${questions.join(',')}
      and return an array of potential questions
    I do not want python code from you but the reponse array only
      
    `;

    console.log("Sending prompt to Gemini...");

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();  

    // console.log("Gemini Response:", responseText);
    console.log("Gemini Response Received");
    
    const potentialQuestions = responseText
    .split('\n') // Split by newline
    .map(question => question.trim()) // Trim any extra spaces
    .filter(question => question.length > 0); // Filter out any empty strings

  return res.status(200).json({ ans: potentialQuestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};


export const generateTopicSummary = async (req, res) => {
  try {
    const { topic } = req.body; 
    
    if (!topic) {
      return res.status(400).json({ error: "No topic provided" });
    }

    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      Generate a summary for ${topic} to make an undergraduate understand these concepts in 10 pointers
      
    `;

    console.log("Sending prompt to Gemini...");

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();  

    console.log("Gemini Response Received");
    
    const response = responseText .split('\n')
    .map(question => question.trim()) 
    .filter(question => question.length > 0); 
    return res.status(200).json({ ans: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};
