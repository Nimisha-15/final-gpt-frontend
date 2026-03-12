import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Loading = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, fetchUser, axios } = useAppContext();
  const [status, setStatus] = useState("verifying"); // verifying, success, error, pending
  const [message, setMessage] = useState("Processing your payment...");
  const retryCountRef = useRef(0);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get("session_id");
        const transactionId = sessionParams.get("transactionId");

        if (!sessionId && !transactionId) {
          // No payment session, just redirect
          setTimeout(() => {
            fetchUser();
            navigate("/");
          }, 2000);
          return;
        }

        // Check payment status from backend
        const { data } = await axios.get("/api/payment/status", {
          params: {
            sessionId: sessionId || undefined,
            transactionId: transactionId || undefined,
          },
          withCredentials: true,
        });

        if (data.success && data.status === "completed") {
          setStatus("success");
          setMessage("Payment successful! Credits added to your account.");
          
          // Refresh user data to show updated credits
          await new Promise(resolve => setTimeout(resolve, 1500));
          await fetchUser();
          
          toast.success("Credits purchased successfully! 🎉");
          
          // Redirect to home
          setTimeout(() => {
            navigate("/");
          }, 2000);
        } else {
          setStatus("pending");
          setMessage("Payment is being processed...");
          
          // Retry after 3 seconds
          setTimeout(verifyPayment, 3000);
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || "Payment verification failed";
        
        if (error.response?.status === 404) {
          setStatus("error");
          setMessage("Payment record not found. Please check your order.");
        } else {
          setStatus("error");
          setMessage(errorMsg);
        }
        
        toast.error(errorMsg);
        
        // Redirect to credits page on error
        setTimeout(() => {
          navigate("/credits");
        }, 3000);
      }
    };

    // Start verification
    verifyPayment();
  }, [searchParams, navigate, fetchUser, axios]);

  const isDark = theme === "dark";

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center transition-all duration-1000 ${
        isDark
          ? "bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]"
          : "bg-gradient-to-br from-[#e0f2fe] via-[#bae6fd] to-[#7dd3fc]"
      }`}
    >
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse ${
            isDark ? "bg-cyan-500" : "bg-sky-400"
          }`}
        />
        <div
          className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse delay-1000 ${
            isDark ? "bg-purple-600" : "bg-blue-500"
          }`}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo + App Name */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 p-1 shadow-2xl">
            <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
              <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                M
              </span>
            </div>
          </div>
          <h1
            className={`text-4xl font-bold tracking-tight ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            MyChatGPT
          </h1>
        </div>

        {/* Status Icon */}
        <div className="relative">
          {status === "verifying" || status === "pending" ? (
            // Spinner for processing
            <>
              <div
                className={`w-16 h-16 rounded-full border-4 border-transparent animate-spin
                bg-gradient-to-r from-cyan-500 to-blue-600 p-1`}
              >
                <div className="w-full h-full rounded-full bg-inherit"></div>
              </div>
              <div className="absolute inset-0 rounded-full animate-ping">
                <div
                  className={`w-full h-full rounded-full ${
                    isDark ? "bg-cyan-400/20" : "bg-sky-400/30"
                  }`}
                />
              </div>
            </>
          ) : status === "success" ? (
            // Success checkmark
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce">
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          ) : (
            // Error X
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Status Text */}
        <div className="flex flex-col items-center gap-2">
          <p
            className={`text-lg font-medium ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {message}
          </p>
          {status === "error" && (
            <p className="text-sm text-red-500">
              Redirecting to credits page...
            </p>
          )}
          {status === "success" && (
            <p className="text-sm text-green-500">
              Redirecting to dashboard...
            </p>
          )}
          {(status === "verifying" || status === "pending") && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please don't close this page
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Loading;
