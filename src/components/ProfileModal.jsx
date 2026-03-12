import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, logout, axios, fetchUser } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  if (!isOpen || !user) return null;

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (!editData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.put(
        "/api/user/update-profile",
        {
          name: editData.name,
        },
        { withCredentials: true },
      );

      if (data.success || data.user) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        // Refresh user data
        await fetchUser();
      } else {
        toast.error(data?.message || "Failed to update profile");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Error updating profile";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout? You will need to sign in again.",
    );
    if (confirmLogout) {
      logout();
      onClose();
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getMemberSince = (createdAt) => {
    if (!createdAt) return "Recently";
    const date = new Date(createdAt);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden animate-slideIn">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition"
              aria-label="Close profile"
            >
              ✕
            </button>

            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-white">
                  {getInitials(user.name)}
                </span>
              </div>

              {!isEditing ? (
                <div className="text-center">
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-blue-100 text-sm mt-1">{user.email}</p>
                </div>
              ) : (
                <div className="w-full space-y-3">
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => handleEditChange("name", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 text-white placeholder-white/50 outline-none border border-white/20 focus:border-white/50 transition"
                    placeholder="Enter name"
                    disabled={isLoading}
                  />
                  <input
                    type="email"
                    value={editData.email}
                    disabled
                    className="w-full px-3 py-2 rounded-lg bg-white/10 text-white/50 placeholder-white/30 outline-none border border-white/20 cursor-not-allowed opacity-60"
                    placeholder="Email (cannot be changed)"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Account Statistics */}
            {!isEditing && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Credits
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {user.credits || 0}
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Account Type
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    Free
                  </p>
                </div>
              </div>
            )}

            {/* Account Info */}
            <div className="space-y-3 py-4 border-t border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Member Since
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {getMemberSince(user.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Account Status
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-semibold rounded-full">
                  Active
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditData({ name: user.name, email: user.email });
                    }}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center gap-2"
                  >
                    ✎ Edit Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center gap-2"
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin">⏳</span> Saving...
                      </>
                    ) : (
                      <>✓ Save Changes</>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditData({ name: user.name, email: user.email });
                    }}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-medium rounded-lg transition duration-200"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-600 dark:text-gray-400">
            Version 1.0 • Privacy & Security is our priority 🔒
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileModal;
