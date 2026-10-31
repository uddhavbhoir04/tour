import React, { useState, useEffect } from "react";

const AskAIModal = ({
  isOpen,
  onClose,
  onAsk,
  reply,
  loading,
  defaultPrompt,
}) => {
  const [prompt, setPrompt] = useState("");
  useEffect(() => {
    if (defaultPrompt && isOpen) {
      onAsk(defaultPrompt);
    }
  }, [defaultPrompt, isOpen]);

  useEffect(() => {
    if (reply) {
      setPrompt("");
    }
  }, [reply]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-2xl w-[90%] max-w-lg relative animate-fade-in-up">
        <h2 className="text-2xl font-semibold mb-4 text-center text-zinc-800 dark:text-zinc-100">
          I'am TRB AI
        </h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask anything"
          className="w-full h-32 p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white resize-none outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-zinc-700 text-zinc-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-zinc-600 transition"
          >
            Close
          </button>
          <button
            onClick={() => onAsk(prompt)}
            disabled={loading || prompt.trim() === ""}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              loading
                ? "bg-[#EB662B] text-white cursor-not-allowed"
                : "bg-[#EB662B]  text-white"
            }`}
          >
            {loading ? "Searching..." : "Ask AI"}
          </button>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-zinc-300 dark:scrollbar-track-zinc-700">
          <p className="text-white font-bold text-3xl mb-4">Answer is here</p>

          {loading ? (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 animate-pulse">
              <span className="loading-spinner h-5 w-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Generating answer...
            </div>
          ) : reply ? (
            <p className="text-zinc-800 dark:text-zinc-100 whitespace-pre-line">
              {reply}
            </p>
          ) : (
            <p className="text-zinc-400 italic">
              Your answer will appear here...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AskAIModal;
