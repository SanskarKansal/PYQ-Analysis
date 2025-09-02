import React, { useState, useEffect } from 'react';
import axios from 'axios';
import pdfToText from 'react-pdftotext';
import Question from '../../Components/QuestionBox/Question';
import Graph from '../../Components/BarGraph/BarGraph';
import ErrorPopUp from '../../Components/Error/Error';
import ReactMarkdown from "react-markdown";
import { handleSuccess } from "../../utils";


function Home() {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [pdfText, setPdfText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [potentialQuestions, setPotentialQuestions] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
  const [showError, setShowError] = useState(false);
  const [summary, setSummary] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  const saveBookMarkedQuestions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (bookmarkedQuestions.length === 0) {
        console.warn("No bookmarked questions to send");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_URL}/api/user/add`,
        {
          subjectName: selectedSubject,
          questions: bookmarkedQuestions,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      handleSuccess(`Added To Favourites`);
      console.log("Success:", response.data);
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
    }
  }

  const extractText = async (event) => {
    const files = event.target.files;
    if (!files.length) {
      console.error("No files selected.");
      return;
    }

    setLoading(true);
    const textPromises = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const textPromise = pdfToText(file)
        .then(text => {
          console.log(`Text extracted successfully from file: ${file.name}`);
          return { fileName: file.name, text };
        })
        .catch(error => {
          console.error(`Error during text extraction for ${file.name}:`, error);
          return { fileName: file.name, text: 'Error extracting text' };
        });

      textPromises.push(textPromise);
    }

    try {
      const texts = await Promise.all(textPromises);
      const combinedText = texts.map(item => `File: ${item.fileName}\n${item.text}`).join("\n\n");
      setPdfText(combinedText);
      await sendTextToAI(combinedText);
    } catch (error) {
      console.error("Error processing files:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendTextToAI = async (extractedText) => {
    try {
      console.log("Sending extracted text to AI...");
      const response = await axios.post(`${import.meta.env.VITE_URL}/api/ai/extract`, { extractedText, subject: selectedSubject });
      if (response.data && response.data.ans) {
        console.log("AI Response:", response.data.ans);
        setAiResponse(response.data.ans);
      } else {
        console.error("No response from AI.");
      }
    } catch (error) {
      console.error("Error sending text to AI:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePotentialQuestions = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Sending request for potential questions...");
      const response = await axios.post(`${import.meta.env.VITE_URL}/api/ai/potentialQuestions`, {
        subject: selectedSubject,
        "questions": [
          "What is the operating system?",
          "How does virtual memory work?",
          "What is the difference between a process and a thread?"
        ]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.ans) {
        // console.log("Potential Questions Response:", response.data.ans);
        const filteredquestions = response.data.ans.slice(1);
        setPotentialQuestions(filteredquestions);
      } else {
        console.error("No response from AI for potential questions.");
      }
    } catch (error) {
      console.error("Error generating potential questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = (question) => {
    setBookmarkedQuestions((prev) =>
      prev.includes(question)
        ? prev.filter((q) => q !== question) // Remove from bookmarks
        : [...prev, question] // Add to bookmarks
    );

    console.log("Bookmarked Questions:", bookmarkedQuestions);
  };

  const renderQuestions = (text) => {
    const questions = text.split('\n');

    return questions.map((question, index) => (
      question.trim() !== "" && (
        <Question
          key={index}
          question={question}
          isBookmarked={bookmarkedQuestions.includes(question)}
          onBookmarkToggle={() => toggleBookmark(question)}
        />
      )
    ));
  };

  const handleFileUpload = (event) => {
    setFileList([...event.target.files]);
  };

  const [dots, setDots] = useState("");
  console.log(bookmarkedQuestions);

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 5 ? prev + "." : ""));
    }, 500);

    return () => clearInterval(interval);
  }, [loading]);

  // Topics drop down 




  // Function to handle the change of the selected topic
  const handleTopicChange = (event) => {
    setSelectedTopic(event.target.value);
  };

  const topics = [
    'CPU Scheduling',
    'System Programming',
    'Deadlock',
    'Memory Management',
    'Resource Allocation',
    'Synchronization',
  ];

  const generateSummary = async () => {
    if (!selectedTopic) {
      alert('Please select a topic');
      return;
    }

    setLoading(true); // Start loading

    try {
      const response = await axios.post(`${import.meta.env.VITE_URL}/api/ai/summary`, {
        topic: selectedTopic
      });
      console.log(response);

      if (response.data) {
        // Exclude the first item (index 0) from the array
        const filteredSummary = response.data.ans.slice(1);
        setSummary(filteredSummary);
      } else {
        console.error('No summary returned from the API');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setLoading(false); // Stop loading once the request is complete
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center bg-[#1E1E2E] p-8">
      <h1 className="text-4xl font-bold text-white px-8 py-3 rounded-lg shadow-lg 
                     bg-gradient-to-r from-[#3B82F6] to-[#9333EA]">
        PYQ Question Anaylizer
      </h1>

      {/* Subject Dropdown */}
      <div className="bg-[#2A2A3A] p-6 my-4 w-full max-w-lg shadow-lg rounded-xl border border-[#3B3B4F]">
        <h3 className="text-lg font-semibold text-gray-200">Select Subject:</h3>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full border p-2 rounded-md mt-2 bg-[#3B3B4F] text-gray-300 focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
        >
          <option value="Computer Networks">Computer Networks</option>
          <option value="Operating Systems">Operating Systems</option>
          <option value="Database Management Systems">Database Management Systems</option>
        </select>
      </div>

      {/* File Upload Section */}
      <div className="bg-[#2A2A3A] p-6 my-4 w-full max-w-lg shadow-lg rounded-xl border border-[#3B3B4F]">
        <h3 className="text-lg font-semibold text-gray-200">Upload PDF Files:</h3>
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileUpload}
          className="w-full border p-2 rounded-md mt-2 bg-[#3B3B4F] text-gray-300 focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
        />
      </div>

      <button
        onClick={() => extractText({ target: { files: fileList } })}
        className="px-4 py-2 bg-[#3B82F6] text-white rounded-md shadow-md mt-4 hover:bg-[#2563EB]">
        Generate Questions
      </button>

      {loading && (
        <div className="mt-6 w-full max-w-2xl p-6 transition-all duration-300">
          <h2 className="text-5xl font-bold text-center text-[#70a7ff] animate-pulse">
            Loading{dots}
          </h2>
        </div>
      )}

      <div className="mt-6 w-full max-w-2xl">
        {aiResponse && renderQuestions(aiResponse)}
      </div>
      {aiResponse &&
      <button
        onClick={() => saveBookMarkedQuestions()}
        className="px-4 py-2 bg-[#3B82F6] text-white rounded-md shadow-md mt-4 hover:bg-[#2563EB]">
        Save BookMarked Questions
      </button>
}

      {aiResponse && (
        <button
          onClick={() => {
            if (!localStorage.getItem("loggedInUser")) {
              setShowError(true);
            } else {
              generatePotentialQuestions();
            }
          }}
          className="px-4 py-2 bg-[#3B82F6] text-white rounded-md shadow-md mt-4 hover:bg-[#2563EB]"
        >
          Find More Potential Questions
        </button>
      )}

      {potentialQuestions.length > 0 && (
        <div className="mt-6 w-full max-w-2xl">
          <h2 className="text-xl font-bold text-white">The Potential Questions:</h2>
          {potentialQuestions.map((question, index) => (
            <Question
              key={index}
              question={question.replace("* ", "")}
              isBookmarked={bookmarkedQuestions.includes(question)}
              onBookmarkToggle={() => toggleBookmark(question)}
            />
          ))}
        </div>
      )}

      {aiResponse && <Graph />}
      {showError && <ErrorPopUp onClose={() => setShowError(false)} />}

      {aiResponse &&
        <div className="min-h-screen flex flex-col items-center bg-[#1E1E2E] p-8">
          <h1 className="text-4xl font-bold text-white px-8 py-3 rounded-lg shadow-lg bg-gradient-to-r from-[#3B82F6] to-[#9333EA]">
            Topic Summary Generator
          </h1>

          {/* Topic Selection Dropdown */}
          <div className="mt-6 w-full max-w-lg bg-[#2A2A3A] p-6 shadow-lg rounded-xl border border-[#3B3B4F]">
            <h3 className="text-lg font-semibold text-gray-200">Select a Topic:</h3>
            <select
              value={selectedTopic}
              onChange={handleTopicChange}
              className="w-full border p-2 rounded-md mt-2 bg-[#3B3B4F] text-gray-300 focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
            >
              <option value="">-- Choose a Topic --</option>
              {topics.map((topic, index) => (
                <option key={index} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {/* Button to Generate Summary */}
          <button
            onClick={generateSummary}
            className="px-4 py-2 bg-[#3B82F6] text-white rounded-md shadow-md mt-4 hover:bg-[#2563EB]"
          >
            Generate Summary
          </button>

          {/* Loading Spinner */}
          {loading && (
            <div className="mt-6 w-full max-w-2xl p-6 transition-all duration-300">
              <h2 className="text-5xl font-bold text-center text-[#70a7ff] animate-pulse">
                Loading{dots}
              </h2>
            </div>
          )}

          {/* Summary Display */}
          {summary.length > 0 && !loading && (
            <div className="mt-6 w-full max-w-2xl bg-[#2A2A3A] p-6 shadow-lg rounded-xl border border-[#3B3B4F]">
              <h3 className="text-xl font-semibold text-[#3B82F6] mb-4">Summary for {selectedTopic}:</h3>
              <ul className="list-disc p-4 space-y-2 text-lg">
                {summary.map((item, index) => (
                  <li key={index} className="text-gray-300 mb-2">
                    <ReactMarkdown>{item}</ReactMarkdown>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      }
    </div>

  );
}

export default Home;
