import React, { useState } from 'react';
import Header from './Header';

const settings = () => {
  const [language, setLanguage] = useState('');
  const [theme, setTheme] = useState('');
  const [feedback, setFeedback] = useState(0);
  const [comments, setComments] = useState('');

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const handleFeedbackChange = (rating) => {
    setFeedback(rating);
  };

  const handleCommentsChange = (e) => {
    setComments(e.target.value);
  };

  const handleSubmit = () => {
    alert(`Feedback Submitted!
           Language: ${language}
           Theme: ${theme}
           Rating: ${feedback}
           Comments: ${comments}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
    <div className="flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-950">SETTINGS</h2>
        
        <div className="mb-4">
          <label className="block text-indigo-950  font-semibold mb-2">Preferred Language</label>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="w-full p-2 border border-gray-300 text-indigo-950 bg-slate-200 rounded-lg">
            <option value="" disabled>Select a language</option>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
          </select>
        </div>
        
        {/* Themes */}
        <div className="mb-4">
          <label className="block text-indigo-950 font-semibold mb-2">Themes</label>
          <select
            value={theme}
            onChange={handleThemeChange}
            className="w-full p-2 border border-gray-300 text-indigo-950 bg-slate-200 rounded-lg">
            <option value="" disabled>Select a theme</option>
            <option value="Light">Light</option>
            <option value="Dark">Dark</option>
            <option value="System Default">System Default</option>
          </select>
        </div>
        
        {/* Feedback */}
        <div className="mb-4">
          <label className="block text-gray-700 text-indigo-950 font-semibold mb-2">Feedback</label>
          <div className="flex space-x-2 ">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleFeedbackChange(star)}
                className={`text-2xl ${feedback >= star ? 'text-yellow-500' : 'text-indigo-950'} bg-slate-200`}>
                ★
              </button>
            ))}
          </div>
        </div>
        
        {/* Feedback Comments */}
        <div className="mb-4">
          <label className="block text-indigo-950 font-semibold mb-2">Comments</label>
          <textarea
            value={comments}
            onChange={handleCommentsChange}
            className="w-full p-2 border border-gray-300 bg-slate-200 rounded-lg"
            placeholder="Leave your comments here..."></textarea>
        </div>
        
        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
          Submit Feedback
        </button>
      </div>
      
      {/* FAQ Section */}
      <div className="mt-6">
        <h3 className="text-xl font-bold text-center mb-2">FAQ</h3>
        <a href="https://www.financestrategists.com/wealth-management/asset-management" target="_blank" rel="noopener noreferrer"
          className="text-indigo-950 hover:text-red-500">
          https://www.financestrategists.com/wealth-management/asset-management
        </a>
      </div>
    </div>
    </div>
  );
};

export default settings;
