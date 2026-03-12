import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import Message from "./Message";
import toast from "react-hot-toast";
import {
  validatePrompt,
  getErrorMessage,
  isSufficientCredits,
  VALIDATION_MESSAGES,
} from "../utils/validation";

const Chatbox = () => {
  const containerRef = useRef(null);

  const { selectedChats, theme, user, axios } = useAppContext();
  const [message, setMessage] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [isPublished, setIsPublished] = useState(false);
  const [lastPromptUsed, setLastPromptUsed] = useState("");
  const [lastModeUsed, setLastModeUsed] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Pre-submission validation
    const currentPrompt = prompt.trim();

    // Validate prompt
    const promptError = validatePrompt(currentPrompt);
    if (promptError) {
      setError(promptError);
      toast.error(promptError);
      return;
    }

    // Check if user is logged in
    if (!user) {
      setError(VALIDATION_MESSAGES.NO_USER);
      toast.error(VALIDATION_MESSAGES.NO_USER);
      return;
    }

    // Check if chat is selected
    if (!selectedChats?._id) {
      setError(VALIDATION_MESSAGES.NO_CHAT_SELECTED);
      toast.error(VALIDATION_MESSAGES.NO_CHAT_SELECTED);
      return;
    }

    // Check if already loading
    if (loading) {
      toast.error("⏳ Please wait for the current request to complete");
      return;
    }

    // Check credits
    const creditsNeeded = mode === "image" ? 2 : 1;
    if (!isSufficientCredits(user.credits, mode)) {
      setError(
        `❌ Insufficient credits. Required: ${creditsNeeded}, Available: ${user.credits}`,
      );
      toast.error(
        `❌ Credits needed: ${creditsNeeded}, You have: ${user.credits}`,
      );
      return;
    }

    // Check if prompt is the same as last used
    if (currentPrompt === lastPromptUsed && mode === lastModeUsed) {
      setError(VALIDATION_MESSAGES.DUPLICATE_PROMPT);
      toast.error(VALIDATION_MESSAGES.DUPLICATE_PROMPT);
      return;
    }

    setPrompt("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        `/api/message/${mode}`,
        {
          chatId: selectedChats._id,
          prompt: currentPrompt,
          isPublished,
        },
        { withCredentials: true },
      );

      if (data.success) {
        // Update last used prompt and mode
        setLastPromptUsed(currentPrompt);
        setLastModeUsed(mode);

        // Instant local append (optimistic update)
        setMessage((prev) => [
          ...prev,
          {
            role: "user",
            content: currentPrompt,
            timestamp: Date.now(),
            isImage: false,
          },
          data.reply, // Append AI reply immediately
        ]);

        toast.success(
          mode === "image" ? "🖼️ Image generated!" : "✅ Response received!",
        );
      } else {
        const errorMsg = data.message || "Request failed";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode) => {
    if (prompt.trim() === lastPromptUsed && newMode !== mode) {
      toast.warn(VALIDATION_MESSAGES.MODE_CHANGE_WARNING);
    }
    setMode(newMode);
  };

  useEffect(() => {
    if (selectedChats && Array.isArray(selectedChats.messages)) {
      setMessage(selectedChats.messages);
    } else {
      setMessage([]);
    }
  }, [selectedChats]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [message]);

  return (
    <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-14">
      {/* CHAT MESSAGES  */}
      <div ref={containerRef} className="flex-1 mb-4 overflow-y-scroll">
        {message.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-1 text-primary ">
            <img
              className="w-full max-w-50 sm:max-w-62"
              src={assets.custom_logo}
              alt="Logo"
            />
            <p className="mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white">
              Ask me anything ...
            </p>
          </div>
        ) : (
          message.map((msg, index) => <Message key={index} message={msg} />)
        )}

        {/* Move Loader inside scroll container */}
        {loading && (
          <div className="loader flex items-center gap-1.5 p-4">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div
              className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        )}
      </div>

      {mode === "image" && (
        <label className="inline-flex items-center gap-2 mb-3 text-sm mx-auto ">
          <p className="text-xs ">Publish generated image to Community </p>
          <input
            type="checkbox"
            className="cursor-pointer"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            disabled={loading}
          />
        </label>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Credit Warning */}
      {user && !isSufficientCredits(user.credits, mode) && (
        <div className="mb-3 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg text-yellow-700 dark:text-yellow-300 text-sm">
          ⚠️ Low credits! Required: {mode === "image" ? 2 : 1}, Available:{" "}
          {user.credits}
        </div>
      )}

      {/* prompt input box */}
      <form
        onSubmit={onSubmit}
        className="bg-[#75a4add8]/20 dark:bg-[#58379]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center"
      >
        <select
          onChange={(e) => {
            handleModeChange(e.target.value);
          }}
          value={mode}
          disabled={loading}
          className="text-sm pl-2 pr-2 outline-none disabled:opacity-50 cursor-pointer"
          aria-label="Content type selector"
        >
          <option value="text">Text</option>
          <option value="image">Image</option>
        </select>
        <input
          type="text"
          placeholder={loading ? "Generating..." : "Write the prompt..."}
          className="flex-1 w-full text-sm outline-none disabled:opacity-50"
          disabled={loading}
          onChange={(e) => {
            setPrompt(e.target.value);
            setError(""); // Clear error when user starts typing
          }}
          value={prompt}
          maxLength="2000"
          aria-label="Prompt input"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transition-transform"
          aria-label={loading ? "Stop" : "Send"}
        >
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            className="w-8 cursor-pointer"
            alt={loading ? "Stop" : "Send"}
          />
        </button>
      </form>
    </div>
  );
};

export default Chatbox;
