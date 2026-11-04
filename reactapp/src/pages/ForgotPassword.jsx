import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset, resetPassword } from "../services/AuthServices";

function ForgotPassword() {
  const [stage, setStage] = useState("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequest(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const response = await requestPasswordReset(email);
      setMessage(response.message || "If that email is registered, a reset code has been sent.");
      if (response.data?.resetCode) {
        setMessage(`Development reset code: ${response.data.resetCode}`);
      }
      setStage("reset");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not request a reset code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 8 || newPassword.length > 72) {
      setError("Password must be 8 to 72 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword({ email, code, newPassword });
      setMessage(response.message || "Password reset successful. You can now log in.");
      setStage("complete");
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Could not reset the password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">
          {stage === "request" ? "Reset your password" : "Choose a new password"}
        </h1>
        <p className="mb-6 text-center text-gray-500">
          {stage === "request"
            ? "We'll send a reset code if an account matches your email."
            : "Enter the reset code and your new password."}
        </p>

        {message && (
          <p role="status" className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-700">
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {stage === "request" && (
          <form onSubmit={handleRequest}>
            <label className="mb-5 block font-medium text-gray-700">
              Email address
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset code"}
            </button>
          </form>
        )}

        {stage === "reset" && (
          <form onSubmit={handleReset}>
            <label className="mb-5 block font-medium text-gray-700">
              Reset code
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </label>
            <label className="mb-5 block font-medium text-gray-700">
              New password
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>
        )}

        {stage === "complete" && (
          <Link
            to="/login"
            className="block rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white"
          >
            Go to login
          </Link>
        )}
        {stage !== "complete" && (
          <Link to="/login" className="mt-6 block text-center text-sm font-medium text-blue-600 hover:underline">
            Back to login
          </Link>
        )}
      </section>
    </main>
  );
}

export default ForgotPassword;
