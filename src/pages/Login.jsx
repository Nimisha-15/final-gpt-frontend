import { useState, useCallback, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// Validation utilities
const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address",
  },
  password: {
    minLength: 8,
    hasUpperCase: /[A-Z]/,
    hasLowerCase: /[a-z]/,
    hasNumber: /[0-9]/,
    hasSpecial: /[!@#$%^&*]/,
    message:
      "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
  },
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
    message:
      "Name should contain only letters, spaces, hyphens, and apostrophes",
  },
};

const validateEmail = (email) => {
  if (!email.trim()) return "Email is required";
  if (!VALIDATION_RULES.email.pattern.test(email)) {
    return VALIDATION_RULES.email.message;
  }
  return "";
};

const validatePassword = (password, isLogin = false) => {
  if (!password) return "Password is required";
  if (isLogin) return ""; // Only basic check for login

  if (password.length < VALIDATION_RULES.password.minLength) {
    return `Password must be at least ${VALIDATION_RULES.password.minLength} characters`;
  }
  if (!VALIDATION_RULES.password.hasUpperCase.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!VALIDATION_RULES.password.hasLowerCase.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!VALIDATION_RULES.password.hasNumber.test(password)) {
    return "Password must contain at least one number";
  }
  if (!VALIDATION_RULES.password.hasSpecial.test(password)) {
    return "Password must contain at least one special character (!@#$%^&*)";
  }
  return "";
};

const validateName = (name) => {
  if (!name.trim()) return "Name is required";
  if (name.trim().length < VALIDATION_RULES.name.minLength) {
    return `Name must be at least ${VALIDATION_RULES.name.minLength} characters`;
  }
  if (name.trim().length > VALIDATION_RULES.name.maxLength) {
    return `Name cannot exceed ${VALIDATION_RULES.name.maxLength} characters`;
  }
  if (!VALIDATION_RULES.name.pattern.test(name)) {
    return VALIDATION_RULES.name.message;
  }
  return "";
};

const Login = () => {
  const [state, setState] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const { axios, settoken, setUser } = useAppContext();

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (state === "register") {
      const nameError = validateName(formData.name);
      if (nameError) newErrors.name = nameError;
    }

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(
      formData.password,
      state === "login",
    );
    if (passwordError) newErrors.password = passwordError;

    if (state === "register") {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, state]);

  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = state === "login" ? "/api/user/login" : "/api/user/register";

    if (!validateForm()) {
      toast.error("Please fix the errors above");
      return;
    }

    setIsLoading(true);

    try {
      const payload =
        state === "login"
          ? { email: formData.email, password: formData.password }
          : {
              name: formData.name,
              email: formData.email,
              password: formData.password,
            };

      const { data } = await axios.post(url, payload);

      if (data?.success) {
        settoken(data.token);
        localStorage.setItem("token", data.token);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleAuthState = useCallback(() => {
    setState(state === "login" ? "register" : "login");
    setErrors({});
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
  }, [state]);

  // Load remembered email on component mount
  useMemo(() => {
    if (state === "login") {
      const rememberedEmail = localStorage.getItem("rememberedEmail");
      if (rememberedEmail) {
        setFormData((prev) => ({ ...prev, email: rememberedEmail }));
        setRememberMe(true);
      }
    }
  }, [state]);

  return (
    <div className="min-h-screen w-full flex p-4 md:p-6 bg-gray-950">
      <div className="hidden md:flex w-1/2 items-center justify-center">
        <img
          className="h-full w-full object-cover rounded-2xl"
          src="https://images.unsplash.com/photo-1766582888708-04ab69f2277a?q=80&w=1036&auto=format&fit=crop"
          alt="Authentication background"
        />
      </div>

      <div className="flex w-full md:w-1/2 items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl px-6 md:px-8 py-8 md:py-10 shadow-xl"
          noValidate
          aria-label={`${state === "login" ? "Login" : "Sign up"} form`}
        >
          <h1 className="text-white text-3xl font-bold text-center">
            {state === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-gray-400 text-sm mt-2 text-center">
            {state === "login"
              ? "Sign in to continue"
              : "Sign up to get started"}
          </p>

          {/* Name Field - Register Only */}
          {state === "register" && (
            <div className="mt-6">
              <label className="block text-gray-300 text-xs font-medium mb-2">
                Full Name
              </label>
              <div className="flex items-center bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg px-4 py-3 transition">
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full text-white placeholder-gray-500 outline-none bg-transparent"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={isLoading}
                  aria-label="Full name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
              </div>
              {errors.name && (
                <p
                  id="name-error"
                  className="text-red-400 text-xs mt-1 flex items-center gap-1"
                >
                  ⚠ {errors.name}
                </p>
              )}
            </div>
          )}

          {/* Email Field */}
          <div className={state === "register" ? "mt-4" : "mt-6"}>
            <label className="block text-gray-300 text-xs font-medium mb-2">
              Email Address
            </label>
            <div className="flex items-center bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg px-4 py-3 transition">
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full text-white placeholder-gray-500 outline-none bg-transparent"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={isLoading}
                autoComplete="email"
                aria-label="Email address"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>
            {errors.email && (
              <p
                id="email-error"
                className="text-red-400 text-xs mt-1 flex items-center gap-1"
              >
                ⚠ {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="mt-4">
            <label className="block text-gray-300 text-xs font-medium mb-2">
              Password
            </label>
            <div className="flex items-center bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg px-4 py-3 transition gap-2">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={
                  state === "login"
                    ? "Enter password"
                    : "Min 8 chars with special char"
                }
                className="flex-1 text-white placeholder-gray-500 outline-none bg-transparent"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={isLoading}
                autoComplete={
                  state === "login" ? "current-password" : "new-password"
                }
                aria-label="Password"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-300 transition text-lg"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isLoading}
              >
                {showPassword ? "👁" : "👁‍🗨"}
              </button>
            </div>
            {errors.password && (
              <p
                id="password-error"
                className="text-red-400 text-xs mt-1 flex items-center gap-1"
              >
                ⚠ {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password - Register Only */}
          {state === "register" && (
            <div className="mt-4">
              <label className="block text-gray-300 text-xs font-medium mb-2">
                Confirm Password
              </label>
              <div className="flex items-center bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg px-4 py-3 transition gap-2">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  className="flex-1 text-white placeholder-gray-500 outline-none bg-transparent"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  disabled={isLoading}
                  autoComplete="new-password"
                  aria-label="Confirm password"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={
                    errors.confirmPassword
                      ? "confirm-password-error"
                      : undefined
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-300 transition text-lg"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  disabled={isLoading}
                >
                  {showConfirmPassword ? "👁" : "👁‍🗨"}
                </button>
              </div>
              {errors.confirmPassword && (
                <p
                  id="confirm-password-error"
                  className="text-red-400 text-xs mt-1 flex items-center gap-1"
                >
                  ⚠ {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {/* Remember Me - Login Only */}
          {state === "login" && (
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 rounded cursor-pointer"
                aria-label="Remember me"
              />
              <label
                htmlFor="rememberMe"
                className="text-gray-400 text-sm ml-2 cursor-pointer"
              >
                Remember email
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full h-11 rounded-lg text-white font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                {state === "login" ? "Signing in..." : "Creating account..."}
              </>
            ) : state === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>

          {/* Toggle Auth State */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {state === "login"
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>
            <button
              type="button"
              onClick={toggleAuthState}
              disabled={isLoading}
              className="text-indigo-400 hover:text-indigo-300 hover:underline text-sm font-medium mt-1 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {state === "login" ? "Sign up here" : "Sign in here"}
            </button>
          </div>

          {/* Security Info */}
          <p className="text-gray-500 text-xs text-center mt-6">
            🔒 Your data is encrypted and secure
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
