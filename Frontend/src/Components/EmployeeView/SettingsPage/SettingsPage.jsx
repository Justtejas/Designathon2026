import React, { useState } from "react";
import EmployeeHeader from "../EmployeeHeader";

const Settings = () => {
  const [language, setLanguage] = useState("");
  const [theme, setTheme] = useState("");
  const [feedback, setFeedback] = useState(0);
  const [comments, setComments] = useState("");

  const handleSubmit = () => {
    alert(`Feedback Submitted!
Language: ${language}
Theme: ${theme}
Rating: ${feedback}
Comments: ${comments}`);
  };

  return (
    <div className="min-h-screen flex flex-col
      bg-gray-50 dark:bg-slate-950 transition-colors">

      <EmployeeHeader />

      <main className="flex-grow flex flex-col items-center p-28">

        <div className="w-full max-w-md
          bg-white dark:bg-slate-900
          border border-gray-200 dark:border-slate-700
          rounded-2xl shadow-lg p-6 animate-fadeUp">

          <h2 className="text-2xl font-extrabold text-center mb-6
            text-indigo-950 dark:text-slate-100">
            Settings
          </h2>

          <div className="mb-4">
            <label className="block mb-2 font-semibold
              text-gray-800 dark:text-slate-300">
              Preferred Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 rounded-lg
              bg-slate-200 dark:bg-slate-800
              border border-gray-300 dark:border-slate-600
              text-gray-900 dark:text-slate-200
              focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>Select a language</option>
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-semibold
              text-gray-800 dark:text-slate-300">
              Theme Preference
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full p-2 rounded-lg
              bg-slate-200 dark:bg-slate-800
              border border-gray-300 dark:border-slate-600
              text-gray-900 dark:text-slate-200
              focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>Select a theme</option>
              <option>Light</option>
              <option>Dark</option>
              <option>System Default</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-semibold
              text-gray-800 dark:text-slate-300">
              Feedback
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFeedback(star)}
                  className={`text-xl transition
                    ${feedback >= star
                      ? "text-yellow-400 dark:bg-gray-700"
                      : "text-slate-400 dark:text-slate-900 dark:bg-white"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-semibold
              text-gray-800 dark:text-slate-300">
              Comments
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              placeholder="Leave your comments here..."
              className="w-full p-2 rounded-lg
              bg-slate-200 dark:bg-slate-800
              border border-gray-300 dark:border-slate-600
              text-gray-900 dark:text-slate-200
              focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700
            text-white py-2 rounded-lg transition shadow"
          >
            Submit Feedback
          </button>
        </div>

        <div className="mt-8 text-center animate-fadeUp">
          <h3 className="text-xl font-bold
            text-gray-900 dark:text-slate-100 mb-2">
            FAQ
          </h3>
        </div>

      </main>
    </div>
  );
};

export default Settings;