import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleSuccess, handleError } from "../../utils";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";

function Dashboard() {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [userDetails, setUserDetails] = useState({});
  const [error, setError] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    setLoggedInUser(user);

    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.get(
            `${import.meta.env.VITE_URL}/api/user/details`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setUserDetails(response.data);

          // Calculate total number of questions
          if (response.data.subjects) {
            const totalQuestions = Object.values(response.data.subjects).reduce(
              (acc, questions) => acc + (Array.isArray(questions) ? questions.length : 0),
              0
            );
            setQuestionCount(totalQuestions);
          }
        } else {
          setError({ message: "User not authenticated" });
        }
      } catch (err) {
        setError(err);
        handleError("Error fetching user details");
      }
    };

    if (user) {
      fetchUserDetails();
    } else {
      setError({ message: "No user logged in" });
    }
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    handleSuccess(`${loggedInUser} Logged Out`);
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("profilePhoto");
    setTimeout(() => navigate("/"), 1000);
  };

  const renderSubjects = () => {
    if (!userDetails.subjects || Object.keys(userDetails.subjects).length === 0) {
      return null;
    }

    return (
      <div className="mt-4">
        <h3 className="text-center text-white text-3xl font-bold mb-4">Favourite Questions</h3>
        <ul className="list-disc pl-5 text-gray-300">
          {Object.entries(userDetails.subjects).map(([subject, questions]) => (
            <li key={subject} className="mb-4">
              <strong className="text-lg">{subject}:</strong>
              {Array.isArray(questions) && questions.length > 0 ? (
                <ul className="list-inside list-decimal pl-5">
                  {questions.map((question, idx) => (
                    <li key={`${subject}-${idx}`}>{question}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No questions available for {subject}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
        <h1 className="text-2xl font-semibold text-center text-red-400 mb-6">
          Error: {error.message || error?.response?.data?.message}
        </h1>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-evenly bg-gray-900 p-6">
      <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-md p-6 flex">
        {/* Profile Section (Left) */}
        <div className="w-1/3 flex flex-col items-center border-r border-gray-700 pr-6">
          <div className="flex justify-center mb-6">
            {userDetails.profilePhoto ? (
              <img
                src={userDetails.profilePhoto}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-600"
              />
            ) : (
              <FaUserCircle className="text-gray-400 w-24 h-24" />
            )}
          </div>
          <h1 className="text-xl font-semibold text-white">{loggedInUser}</h1>
          <button
            onClick={handleLogout}
            className="mt-4 w-full py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition duration-300 shadow-md"
          >
            Log Out
          </button>
        </div>

        {/* User Details Section (Right) */}
        <div className="w-2/3 pl-6">
          <h2 className="text-2xl font-semibold text-white mb-4">User Details</h2>
          <div>
            {userDetails && (
              <div>
                <p className="shadow-md rounded-lg p-4 bg-gray-600 text-lg text-gray-300 mb-10">
                  <strong>Email :</strong> {userDetails.email}
                </p>
                <p className="shadow-md rounded-lg p-4 bg-gray-600 text-lg text-gray-300 mb-10">
                  <strong>Question Count :</strong> {questionCount}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 bg-gray-800 p-4 rounded-lg shadow-md">{renderSubjects()}</div>
      <ToastContainer />
    </div>
  );
}

export default Dashboard;
