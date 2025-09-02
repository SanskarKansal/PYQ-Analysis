import React from 'react';
import { CiBookmark } from "react-icons/ci";
import { FaBookmark } from "react-icons/fa";

function Question({ question, onBookmarkToggle, isBookmarked }) {
  return (
    <div className="mt-4 w-full max-w-2xl bg-[#2A2A3A] p-6 shadow-lg rounded-xl border border-[#3B3B4F]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">{question}</h3>
        <button onClick={onBookmarkToggle}>
          {isBookmarked ? (
            <FaBookmark className="text-yellow-500" size={24} />
          ) : (
            <CiBookmark className="text-gray-300" size={24} />
          )}
        </button>
      </div>
    </div>
  );
}

export default Question;