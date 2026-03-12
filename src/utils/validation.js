// Frontend validation utilities
export const VALIDATION_LIMITS = {
  PROMPT: {
    MIN: 3,
    MAX: 2000,
  },
  CHAT_NAME: {
    MIN: 1,
    MAX: 100,
  },
};

export const VALIDATION_MESSAGES = {
  PROMPT_EMPTY: "❌ Please enter a prompt",
  PROMPT_TOO_SHORT: `⚠️ Prompt must be at least ${VALIDATION_LIMITS.PROMPT.MIN} characters`,
  PROMPT_TOO_LONG: `⚠️ Prompt cannot exceed ${VALIDATION_LIMITS.PROMPT.MAX} characters`,
  NO_CHAT_SELECTED: "❌ No chat selected. Please create a new chat",
  NO_USER: "❌ User not authenticated. Please login again",
  INSUFFICIENT_CREDITS: "❌ Insufficient credits. Please purchase more",
  DUPLICATE_PROMPT: "❌ Please change the prompt before generating again",
  MODE_CHANGE_WARNING: "⚠️ Change the content type or modify your prompt",
  NETWORK_ERROR: "❌ Network error. Please check your connection",
  SERVER_ERROR: "❌ Server error. Please try again later",
  API_ERROR: "❌ Something went wrong. Please try again",
};

export const HTTP_ERROR_MESSAGES = {
  400: "Invalid request. Please check your input",
  401: "Unauthorized. Please login again",
  403: "You don't have permission to perform this action",
  404: "Resource not found",
  429: "Too many requests. Please wait a moment",
  500: "Server error. Please try again later",
  502: "Service temporarily unavailable",
  503: "Service under maintenance",
};

/**
 * Validate and sanitize prompt input
 */
export const validatePrompt = (prompt) => {
  if (!prompt || !prompt.trim()) {
    return VALIDATION_MESSAGES.PROMPT_EMPTY;
  }

  const trimmed = prompt.trim();

  if (trimmed.length < VALIDATION_LIMITS.PROMPT.MIN) {
    return VALIDATION_MESSAGES.PROMPT_TOO_SHORT;
  }

  if (trimmed.length > VALIDATION_LIMITS.PROMPT.MAX) {
    return VALIDATION_MESSAGES.PROMPT_TOO_LONG;
  }

  return null; // No errors
};

/**
 * Get appropriate error message based on error response
 */
export const getErrorMessage = (error) => {
  // Network error
  if (!error.response) {
    return VALIDATION_MESSAGES.NETWORK_ERROR;
  }

  const status = error.response.status;
  const errorMsg = error.response?.data?.message;

  // Use provided error message if available
  if (errorMsg) {
    return errorMsg;
  }

  // Use generic HTTP error messages
  return HTTP_ERROR_MESSAGES[status] || VALIDATION_MESSAGES.API_ERROR;
};

/**
 * Check if credit is sufficient for operation
 */
export const isSufficientCredits = (credits, operation = "text") => {
  const creditsNeeded = operation === "image" ? 2 : 1;
  return credits >= creditsNeeded;
};

/**
 * Format error for user display
 */
export const formatErrorDisplay = (error) => {
  const message = getErrorMessage(error);
  return message.startsWith("❌") || message.startsWith("⚠️") ? message : `❌ ${message}`;
};
