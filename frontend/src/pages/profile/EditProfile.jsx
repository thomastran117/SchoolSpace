import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ProtectedApi from "../../api/ProtectedApi";
import EditProfileTab from "../../components/profile/EditProfileTab";
import DashboardTab from "../../components/profile/EditDashboardTab";
import AdvancedTab from "../../components/profile/EditAdvancedTab";
import "../../styles/profile.css";

const EditProfile = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const { avatar, username } = useSelector((state) => state.auth);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState("");

  const [form, setForm] = useState({
    username: username || "",
    name: "",
    phone: "",
    address: "",
    faculty: "",
    school: "",
  });

  const [formMsg, setFormMsg] = useState("");

  useEffect(() => {
    let revokeUrl = null;

    const fetchAvatar = async () => {
      if (!avatar) {
        setAvatarPreview(null);
        return;
      }

      try {
        // Fetch using protected route so token is included
        const res = await ProtectedApi.get(avatar, { responseType: "blob" });

        const blobUrl = URL.createObjectURL(res.data);
        setAvatarPreview(blobUrl);
        revokeUrl = blobUrl;
      } catch (err) {
        console.error("Failed to fetch protected avatar:", err);
        setAvatarPreview(null);
        // Show a placeholder image if 401 or missing file
      }
    };

    fetchAvatar();

    return () => {
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [avatar]);

  const handleAvatarChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setAvatarFile(selected);
      setAvatarPreview(URL.createObjectURL(selected));
      setAvatarMsg("");
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return setAvatarMsg("❌ Please select a photo first.");
    try {
      setAvatarLoading(true);
      setAvatarMsg("");

      const formData = new FormData();
      formData.append("avatar", avatarFile);
      await ProtectedApi.post("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAvatarMsg("✅ Photo updated successfully!");
    } catch (err) {
      console.error(err);
      setAvatarMsg("❌ Failed to upload photo. Please try again.");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setFormMsg("Saving...");
      await ProtectedApi.put("/users", form);
      setFormMsg("✅ Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setFormMsg("❌ Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => window.history.back();

  const renderMessageBox = (msg) => {
    if (!msg) return null;

    const isSuccess = msg.startsWith("✅");
    const isError = msg.startsWith("❌");

    return (
      <div
        className={`mt-3 small fw-semibold px-3 py-2 rounded-3 ${
          isSuccess
            ? "bg-success-subtle text-success border border-success-subtle"
            : isError
              ? "bg-danger-subtle text-danger border border-danger-subtle"
              : "text-muted"
        }`}
      >
        {msg}
      </div>
    );
  };

  return (
    <div
      className="container py-5 d-flex justify-content-center"
      style={{ backgroundColor: "#f9fafb", minHeight: "100vh" }}
    >
      <div
        className="p-4 rounded-4 shadow-lg bg-white"
        style={{
          maxWidth: "900px",
          width: "100%",
          border: "1px solid #e5e7eb",
        }}
      >
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
          <h4 className="fw-bold text-indigo mb-0">Edit Your Profile</h4>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={handleCancel}
          ></button>
        </div>

        <div className="row g-4">
          {/* --- Left Side Avatar Card --- */}
          <div className="col-md-4 text-center">
            <div
              className="card border-0 shadow-sm p-4 rounded-4 align-items-center"
              style={{
                background: "linear-gradient(180deg, #ffffff, #f9fafb)",
              }}
            >
              <img
                src={
                  avatarPreview ||
                  "https://via.placeholder.com/140x140.png?text=Profile"
                }
                alt="Profile Preview"
                className="rounded-circle shadow-sm mb-3 border border-indigo-subtle"
                style={{
                  width: "140px",
                  height: "140px",
                  objectFit: "cover",
                }}
              />
              <div className="d-grid gap-2">
                <label
                  htmlFor="photoUpload"
                  className="btn btn-outline-indigo fw-semibold rounded-pill"
                  style={{ borderColor: "#6366f1", color: "#6366f1" }}
                >
                  Change Photo
                </label>
                <input
                  type="file"
                  id="photoUpload"
                  accept="image/*"
                  className="d-none"
                  onChange={handleAvatarChange}
                />
                <button
                  onClick={handleAvatarUpload}
                  disabled={avatarLoading}
                  className="btn fw-semibold rounded-pill"
                  style={{
                    background: "linear-gradient(90deg, #6366f1, #818cf8)",
                    color: "white",
                    border: "none",
                  }}
                >
                  {avatarLoading ? "Uploading..." : "Upload"}
                </button>
              </div>

              {renderMessageBox(avatarMsg)}
            </div>
          </div>

          {/* --- Right Side Tabs --- */}
          <div className="col-md-8">
            <ul
              className="nav justify-content-start mb-4 gap-2 px-1"
              style={{ borderBottom: "1px solid rgba(99, 102, 241, 0.15)" }}
            >
              {[
                ["personal", "Profile"],
                ["dashboard", "Dashboard"],
                ["advanced", "Advanced"],
              ].map(([tab, label]) => {
                const isActive = activeTab === tab;

                return (
                  <li className="nav-item" key={tab}>
                    <button
                      className={`nav-link fw-semibold px-4 py-2 rounded-pill shadow-sm ${
                        isActive ? "text-white" : "text-secondary"
                      }`}
                      style={{
                        background: isActive
                          ? "linear-gradient(90deg, #6366f1, #818cf8)"
                          : "transparent",
                        border: isActive
                          ? "1px solid rgba(99, 102, 241, 0.4)"
                          : "1px solid transparent",
                        transition: "all 0.3s ease",
                        boxShadow: isActive
                          ? "0 3px 10px rgba(99, 102, 241, 0.25)"
                          : "none",
                      }}
                      onClick={() => setActiveTab(tab)}
                      onMouseEnter={(e) => {
                        if (!isActive)
                          e.currentTarget.style.backgroundColor =
                            "rgba(99, 102, 241, 0.08)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive)
                          e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>

            {activeTab === "personal" && (
              <EditProfileTab
                form={form}
                onChange={handleInputChange}
                onSave={handleSaveProfile}
                onCancel={handleCancel}
                formMsg={formMsg}
              />
            )}
            {activeTab === "dashboard" && <DashboardTab />}
            {activeTab === "advanced" && <AdvancedTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
