
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerSchema } from "../schemas/AuthSchema";
import { registerUser } from "../services/AuthServices";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    bio: "",
    avatar: null,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

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
  const [profilePicture, setProfilePicture] = useState("");

  function handleProfilePicture(event) {
    const file = event.target.files[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setServerError("Please select a JPEG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setServerError("Image size must not exceed 2MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfilePicture(reader.result);
      setFormData((previousData) => ({ ...previousData, avatar: file }));
      setServerError("");
    };

    reader.onerror = () => {
      setServerError("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);
  }

  function removeProfilePicture() {
    setProfilePicture("");
    setFormData((previousData) => ({ ...previousData, avatar: null }));
  }


  // Handle registration
  async function handleSubmit(event) {
    event.preventDefault();

    setErrors({});
    setServerError("");

    // Validate form
    const result = registerSchema.safeParse(formData);

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
      // Register the user
      await registerUser(result.data);

      // Redirect to login after successful registration
      navigate("/login", {
        replace: true,
        state: {
          message: "Account created successfully! Please log in.",
        },
      });

    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Could not create the account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">
          Create an Account
        </h1>

        <p className="mb-8 text-center text-gray-600">
          Join our community and start sharing your stories.
        </p>

        {serverError && (
          <p role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>

{/* Profile Picture */}
<div className="mb-6 flex flex-col items-center">

  <div className="mb-3 h-28 w-28 overflow-hidden rounded-full border-4 border-blue-100 bg-gray-100">

    {profilePicture ? (
      <img
        src={profilePicture}
        alt="Profile preview"
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center">
        <span className="text-5xl text-gray-400">👤</span>
      </div>
    )}

  </div>

  <label
    htmlFor="profilePicture"
    className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700"
  >
    Upload Profile Picture
  </label>

  <input
    id="profilePicture"
    type="file"
    accept="image/*"
    onChange={handleProfilePicture}
    className="hidden"
  />

  <p className="mt-2 text-xs text-gray-500">
    JPEG, PNG, or WebP (maximum 2MB). A profile image is required.
  </p>

  {errors.avatar && (
    <p className="mt-1 text-sm text-red-600">{errors.avatar}</p>
  )}

  {profilePicture && (
    <button
      type="button"
      onClick={removeProfilePicture}
      className="mt-2 text-sm font-medium text-red-600 hover:underline"
    >
      Remove Picture
    </button>
  )}

</div>

          {/* First Name */}
          <div className="mb-5">
            <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-gray-700">
              First Name
            </label>

            <input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={handleChange}
              autoComplete="given-name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />

            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="mb-5">
            <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-gray-700">
              Last Name
            </label>

            <input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleChange}
              autoComplete="family-name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />

            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-5">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-5">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />

            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Enter your password again"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />

            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>
{/* User Bio */}
<div className="mb-5">

  <label
    htmlFor="bio"
    className="mb-2 block text-sm font-medium text-gray-700"
  >
    About Me (Bio)
  </label>

  <textarea
    id="bio"
    name="bio"
    rows="4"
    maxLength={280}
    placeholder="Tell us something about yourself..."
    value={formData.bio}
    onChange={handleChange}
    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
  />

  <div className="mt-1 flex justify-between text-xs text-gray-500">
    <span>Introduce yourself to the community.</span>

    <span>{formData.bio.length}/280</span>
  </div>

  {errors.bio && (
    <p className="mt-1 text-sm text-red-600">
      {errors.bio}
    </p>
  )}

</div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;
