import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Credits = () => {
  const [plans, setPlans] = useState([]); // ← renamed to "plans" (plural)
  const [loading, setLoading] = useState(true);
  const { axios, user } = useAppContext();
  const navigate = useNavigate();

  // Fetch plans from backend
  const fetchPlans = async () => {
    try {
      const { data } = await axios.get("/api/payment/plans", {
        withCredentials: true,
      });

      if (data.success && data.plans) {
        setPlans(data.plans);
      } else {
        toast.error(data.message || "Failed to load plans");
        setPlans([]); // fallback
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Network error");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // Purchase plan → redirect to Stripe Checkout
  const purchasePlan = async (planId) => {
    // Check if user is logged in
    if (!user) {
      toast.error("Please login to purchase credits");
      navigate("/");
      return;
    }

    try {
      const { data } = await axios.post(
        "/api/payment/purchase",
        { planId },
        { withCredentials: true },
      );

      if (data.success && data.url && data.transactionId) {
        // Store transaction ID and redirect to Stripe
        sessionStorage.setItem("transactionId", data.transactionId);
        window.location.href = data.url;
      } else if (data.success && data.url) {
        // Fallback if transactionId is not returned
        window.location.href = data.url;
      } else {
        // Show detailed error if available
        const errorMsg = data.details
          ? `${data.message}\n${data.details}`
          : data.message || "Failed to start checkout";
        toast.error(errorMsg);
      }
    } catch (error) {
      // Enhanced error messages for debugging
      const statusCode = error.response?.status;
      const errorData = error.response?.data;

      let errorMsg = "Payment failed. Please try again.";

      if (statusCode === 401) {
        errorMsg = "Please login first before making a purchase";
      } else if (statusCode === 400) {
        errorMsg =
          errorData?.message ||
          "Invalid request. Please check your plan selection.";
      } else if (statusCode === 500) {
        errorMsg =
          errorData?.message || "Server error. Please contact support.";
      } else if (!error.response) {
        errorMsg = "Connection error. Please check your network.";
      }

      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Loading state
  if (loading) {
    return <Loading />;
  }

  // No plans available
  if (plans.length === 0) {
    return (
      <div className="text-center mt-32">
        <p className="text-xl text-gray-500 dark:text-gray-400">
          No credit plans available at the moment.
        </p>
        <p className="text-sm text-gray-400 mt-2">Please check back later.</p>
      </div>
    );
  }

  // Main UI
  return (
    <div className={`${!user ? 'w-full' : ''} max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12`}>
      {/* Header for non-logged in users */}
      {!user && (
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-cyan-600">MyGPT</h1>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all"
          >
            Login / Sign Up
          </button>
        </div>
      )}

      <h2 className="text-4xl font-bold text-center mb-16 text-gray-800 dark:text-white">
        Choose Your Credits Plan
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className={`relative border-2 rounded-2xl shadow-lg p-8 flex flex-col transition-all hover:scale-105 ${
              plan._id === "pro"
                ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30 ring-4 ring-cyan-500/20"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            }`}
          >
            {/* Popular Badge */}
            {plan._id === "pro" && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-md">
                MOST POPULAR
              </span>
            )}

            <div className="flex-1">
              <h3 className="text-2xl font-bold text-center mb-4">
                {plan.name}
              </h3>

              <div className="text-center mb-8">
                <span className="text-5xl font-extrabold text-sky-600">
                  ${plan.price}
                </span>
                <span className="text-lg text-gray-600 dark:text-gray-400">
                  {" "}
                  / {plan.credits} credits
                </span>
              </div>

              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="text-cyan-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => purchasePlan(plan._id)}
              className="mt-8 w-full py-4 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md"
            >
              {user ? "Buy Now" : "Login to Buy"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Credits;
