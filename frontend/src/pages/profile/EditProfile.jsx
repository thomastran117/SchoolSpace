import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ProtectedApi from "../../api/ProtectedApi";
import config from "../../configs/envManager";
import ProfileTab from "../../components/profile/EditProfileTab";
import DashboardTab from "../../components/profile/EditDashboardTab";
import AdvancedTab from "../../components/profile/EditAdvancedTab";

const EditProfile = () => {
  const [activeTab, setActiveTab] = useState("personal");

  const { avatar, username } = useSelector((state) => state.auth);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState("");

  const [form, setForm] = useState({
    name: username || "User",
    title: "Administrator",
    organization: "Ingeniux",
    workPhone: "(509)-123-4567",
    mobilePhone: "(509)-123-4567",
    email: "admin@ingeniux.com",
  });

  const [formMsg, setFormMsg] = useState("");

  useEffect(() => {
    if (avatar) {
      const imageUrl = `${config.backend_url}${
        avatar.startsWith("/") ? avatar : `/${avatar}`
      }`;
      setAvatarPreview(imageUrl);
    }
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
    if (!avatarFile) return setAvatarMsg("Please select a photo first.");
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
      setAvatarMsg("❌ Failed to upload photo.");
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
      await ProtectedApi.post("/users/profile", form);
      setFormMsg("✅ Profile saved successfully!");
    } catch (err) {
      console.error(err);
      setFormMsg("❌ Failed to save profile information.");
    }
  };

  const handleCancel = () => window.history.back();

  return (
    <div
      className="container py-5 d-flex justify-content-center"
      style={{ backgroundColor: "#f8fdf8", minHeight: "100vh" }}
    >
      {" "}
      <div
        className="p-4 rounded-4 shadow-lg bg-white"
        style={{
          maxWidth: "900px",
          width: "100%",
          border: "1px solid #d1e7dd",
        }}
      >
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
          <h4 className="fw-bold text-success mb-0">Edit Your Profile</h4>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={handleCancel}
          ></button>
        </div>

        <div className="row g-4">
          <div className="col-md-4 text-center">
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-light align-items-center">
              <img
                src={
                  avatarPreview ||
                  "https://via.placeholder.com/140x140.png?text=Profile"
                }
                alt="Profile Preview"
                className="rounded-circle shadow-sm mb-3 border border-success-subtle"
                style={{
                  width: "140px",
                  height: "140px",
                  objectFit: "cover",
                }}
              />
              <div className="d-grid gap-2">
                <label
                  htmlFor="photoUpload"
                  className="btn btn-outline-success fw-semibold rounded-pill"
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
                  className="btn btn-success fw-semibold rounded-pill"
                >
                  {avatarLoading ? "Uploading..." : "Upload"}
                </button>
              </div>

              {avatarMsg && (
                <div
                  className={`small mt-3 ${
                    avatarMsg.startsWith("✅")
                      ? "text-success"
                      : avatarMsg.startsWith("❌")
                        ? "text-danger"
                        : "text-muted"
                  }`}
                >
                  {avatarMsg}
                </div>
              )}
            </div>
          </div>

          <div className="col-md-8">
            <ul className="nav nav-tabs border-success mb-4">
              {[
                ["personal", "Profile"],
                ["dashboard", "Dashboard"],
                ["advanced", "Advanced"],
              ].map(([tab, label]) => (
                <li className="nav-item" key={tab}>
                  <button
                    className={`nav-link text-success fw-semibold ${
                      activeTab === tab ? "active bg-light border-success" : ""
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>

            {activeTab === "personal" && (
              <ProfileTab
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
