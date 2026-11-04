import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { updateCurrentUser } from "../services/AuthServices";

function Profile() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [formData, setFormData] = useState(() => ({
    firstName: user.firstName,
    lastName: user.lastName,
    bio: user.bio || "",
  }));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previousData) => ({ ...previousData, [name]: value }));
    setError("");
    setSuccess("");
  }

  function handleAvatarChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please select a JPEG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must not exceed 2MB.");
      event.target.value = "";
      return;
    }

    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }
    if (formData.bio.length > 280) {
      setError("Bio must not exceed 280 characters.");
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await updateCurrentUser({
        ...formData,
        avatar,
      });
      setUser(updatedUser);
      setAvatar(null);
      setAvatarPreview("");
      setIsEditing(false);
      setSuccess("Your profile has been updated.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio || "",
    });
    setAvatar(null);
    setAvatarPreview("");
    setIsEditing(false);
    setError("");
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <section className="mx-auto max-w-2xl overflow-hidden rounded-2xl bg-white shadow-lg">
        <header className="bg-blue-400 px-6 py-10 text-center text-white">
          <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-gray-100">
            {avatarPreview || user.avatar?.url ? (
              <img
                src={avatarPreview || user.avatar.url}
                alt={`${fullName}'s profile`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl text-gray-400">
                👤
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold">{fullName}</h1>
          <p className="mt-1 text-blue-100">{user.role}</p>
        </header>

        <div className="p-6 sm:p-8">
          {success && (
            <p className="mb-5 rounded-lg bg-green-100 p-3 text-sm text-green-700">
              {success}
            </p>
          )}
          {error && (
            <p role="alert" className="mb-5 rounded-lg bg-red-100 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {isEditing ? (
            <form onSubmit={handleSave}>
              <h2 className="mb-6 text-xl font-bold text-gray-800">Edit your profile</h2>
              <div className="mb-5 grid gap-4 sm:grid-cols-2">
                <label className="font-medium text-gray-700">
                  First name
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    maxLength={40}
                    required
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
                  />
                </label>
                <label className="font-medium text-gray-700">
                  Last name
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    maxLength={40}
                    required
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
                  />
                </label>
              </div>
              <label className="mb-5 block font-medium text-gray-700">
                Email address
                <input
                  value={user.email}
                  disabled
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3"
                />
              </label>
              <label className="mb-5 block font-medium text-gray-700">
                Profile picture
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="mt-2 w-full rounded-lg border border-gray-300 p-3"
                />
              </label>
              <label className="mb-6 block font-medium text-gray-700">
                Bio
                <textarea
                  name="bio"
                  rows="4"
                  maxLength={280}
                  value={formData.bio}
                  onChange={handleChange}
                  className="mt-2 w-full resize-none rounded-lg border border-gray-300 px-4 py-3"
                />
                <span className="mt-1 block text-right text-xs text-gray-500">
                  {formData.bio.length}/280 characters
                </span>
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-blue-400 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 rounded-lg bg-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h2 className="mb-6 text-xl font-bold text-gray-800">Personal information</h2>
              <dl className="space-y-5">
                <div>
                  <dt className="text-sm text-gray-500">Full name</dt>
                  <dd className="font-semibold text-gray-800">{fullName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Email address</dt>
                  <dd className="font-semibold text-gray-800">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Bio</dt>
                  <dd className="whitespace-pre-wrap text-gray-800">
                    {user.bio || "No bio added yet."}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Account role</dt>
                  <dd className="font-semibold capitalize text-gray-800">{user.role}</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="mt-8 w-full rounded-lg bg-blue-400 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Edit profile
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 w-full rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
          >
            Log out
          </button>
        </div>
      </section>
    </main>
  );
}

export default Profile;
