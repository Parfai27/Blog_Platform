
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  FaGoogle,
  FaFacebook,
  FaGithub,
} from "react-icons/fa";

import { loginSchema } from "../schemas/AuthSchema";
import { loginUser } from "../services/AuthServices";
import { useAuth } from "../context/auth-context";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const successMessage = location.state?.message;

  // Handle input changes
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: undefined,
    }));

    setServerError("");
  }

  // Handle login
  async function handleSubmit(event) {
    event.preventDefault();

    setErrors({});
    setServerError("");

    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const newErrors = {};

      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        newErrors[fieldName] = issue.message;
      });

      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const user = await loginUser(result.data);
      setUser(user);
      navigate("/profile", { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Could not log in.");
    } finally {
      setLoading(false);
    }
  }

  // Social login placeholder
  function handleSocialLogin(provider) {
    setServerError(
      `${provider} authentication is not connected yet.`
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">
          Welcome Back
        </h1>

        <p className="mb-6 text-center text-gray-500">
          Log in to continue to your account.
        </p>

        {/* Registration success message */}
        {successMessage && (
          <p className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-700">
            {successMessage}
          </p>
        )}

        {/* Login error */}
        {serverError && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700"
          >
            {serverError}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-1 block font-medium text-gray-700"
            >
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-5">

            <div className="mb-1 flex items-center justify-between">
              <label
                htmlFor="password"
                className="font-medium text-gray-700"
              >
                Password
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

        </form>

        {/* OR separator */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-300"></div>
          <span className="text-sm text-gray-500">OR</span>
          <div className="h-px flex-1 bg-gray-300"></div>
        </div>

        {/* Social login buttons */}
        <div className="space-y-3">

          <button
            type="button"
            onClick={() => handleSocialLogin("Google")}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <FaGoogle className="text-lg text-red-500" />
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin("Facebook")}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <FaFacebook className="text-lg text-blue-600" />
            Continue with Facebook
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin("GitHub")}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <FaGithub className="text-lg text-gray-900" />
            Continue with GitHub
          </button>

        </div>

        {/* Registration link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:underline"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
