import { useState } from "react";
import EditProfileModal from "./EditProfileModal";
import EditPasswordModal from "./EditPasswordModal";

export default function UserInfoSection({ user, onUpdateUser }) {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditPasswordOpen, setIsEditPasswordOpen] = useState(false);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Redirect to login page
    window.location.href = "/ejpeace/home";
  };

  // Helper function to safely display user data
  const displayUserData = (data, fallback = "Not provided") => {
    // Handle null, undefined, or empty string cases
    if (data === undefined || data === null || data === "") {
      return fallback;
    }
    return String(data);
  };

  // Log user data for debugging
  console.log("UserInfoSection - User data:", user);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Profile Information</h2>

        <div className="space-y-4">
          {/* Name */}
          <div className="border-b pb-4">
            <label className="text-sm text-gray-500 font-medium">
              Full Name
            </label>
            <p className="text-lg font-semibold mt-1">
              {displayUserData(user?.username)}
            </p>
          </div>

          {/* Email */}
          <div className="border-b pb-4">
            <label className="text-sm text-gray-500 font-medium">Email</label>
            <p className="text-lg font-semibold mt-1">
              {displayUserData(user?.email)}
            </p>
          </div>

          {/* Phone */}
          <div className="border-b pb-4">
            <label className="text-sm text-gray-500 font-medium">Phone</label>
            <p className="text-lg font-semibold mt-1">
              {displayUserData(user?.phone)}
            </p>
          </div>

          {/* Address */}
          <div className="border-b pb-4">
            <label className="text-sm text-gray-500 font-medium">Address</label>
            <p className="text-lg font-semibold mt-1">
              {displayUserData(user?.address)}
            </p>
          </div>

          {/* Join Date */}
          {user?.created_at && (
            <div className="border-b pb-4">
              <label className="text-sm text-gray-500 font-medium">
                Member Since
              </label>
              <p className="text-lg font-semibold mt-1">
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Edit Profile
          </button>
          <button
            onClick={() => setIsEditPasswordOpen(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Change Password
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        user={user}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onUpdate={onUpdateUser}
      />

      {/* Edit Password Modal */}
      <EditPasswordModal
        user={user}
        isOpen={isEditPasswordOpen}
        onClose={() => setIsEditPasswordOpen(false)}
      />
    </>
  );
}
