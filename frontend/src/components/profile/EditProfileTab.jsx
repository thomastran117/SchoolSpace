import React, { useState, useEffect } from "react";
import ProtectedApi from "../../api/ProtectedApi";
import { setCredentials } from "../../stores/authSlice";
import { useDispatch } from "react-redux";

const EditProfileTab = ({ onCancel }) => {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    username: "",
    name: "",
    phone: "",
    address: "",
    school: "",
    faculty: "",
  });

  const [originalForm, setOriginalForm] = useState({});
  const [formMsg, setFormMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fieldIcons = {
    username: "bi-person-badge-fill",
    name: "bi-person-fill",
    phone: "bi-telephone-fill",
    address: "bi-geo-alt-fill",
    school: "bi-mortarboard-fill",
    faculty: "bi-building-fill",
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setInitialLoading(true);
        const res = await ProtectedApi.get("/users");
        const user = res.data?.user || res.data;

        const data = {
          username: user.username || "",
          name: user.name || "",
          phone: user.phone || "",
          address: user.address || "",
          school: user.school || "",
          faculty: user.faculty || "",
        };

        setForm(data);
        setOriginalForm(data);
      } catch (err) {
        console.error(err);
        setFormMsg("❌ Failed to load user data.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetField = (key) => {
    setForm((prev) => ({ ...prev, [key]: originalForm[key] || "" }));
  };

  // ✅ Detect if anything changed
  const hasChanges = Object.keys(form).some(
    (key) => form[key] !== originalForm[key],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges) {
      setFormMsg("⚠️ No changes to save.");
      return;
    }

    try {
      setLoading(true);
      setFormMsg("Saving changes...");
      const res = await ProtectedApi.put("/users", form);

      const { accessToken, username, avatar, role } = res.data;
      dispatch(setCredentials({ token: accessToken, username, role, avatar }));

      setFormMsg("✅ Profile updated successfully!");
      setOriginalForm(form);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.error ||
        "❌ Failed to update profile. Please try again.";
      setFormMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="text-center py-5 text-indigo fw-semibold">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <div>Loading your profile...</div>
      </div>
    );
  }

  const renderMessageBox = (msg) => {
    if (!msg) return null;
    const isSuccess = msg.startsWith("✅");
    const isError = msg.startsWith("❌");
    const isWarning = msg.startsWith("⚠️");

    return (
      <div
        className={`mt-3 small fw-semibold text-end px-3 py-2 rounded-3 ${
          isSuccess
            ? "bg-success-subtle text-success border border-success-subtle"
            : isError
              ? "bg-danger-subtle text-danger border border-danger-subtle"
              : isWarning
                ? "bg-warning-subtle text-warning border border-warning-subtle"
                : "bg-light text-muted border border-secondary-subtle"
        }`}
        style={{ fontSize: "0.9rem", transition: "all 0.2s ease" }}
      >
        {msg}
      </div>
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-2 py-2"
      style={{ animation: "fadeIn 0.5s ease" }}
    >
      {[
        ["username", "Username"],
        ["name", "Full Name"],
        ["phone", "Phone Number"],
        ["address", "Address"],
        ["school", "School"],
        ["faculty", "Faculty"],
      ].map(([key, label]) => {
        const isModified = form[key] !== originalForm[key];
        return (
          <div className="mb-4 position-relative" key={key}>
            <label className="form-label fw-semibold text-muted small">
              <i className={`${fieldIcons[key]} me-2 text-indigo fs-6`}></i>
              {label}
            </label>

            <div className="position-relative">
              <input
                type="text"
                name={key}
                className="form-control shadow-sm border-0 rounded-3 py-2 px-3 pe-5"
                style={{
                  backgroundColor: "#f3f4f6",
                  transition: "all 0.2s ease",
                }}
                value={form[key]}
                onChange={handleChange}
                disabled={loading}
                placeholder={`Enter your ${label.toLowerCase()}`}
                onFocus={(e) => (e.target.style.backgroundColor = "#eef2ff")}
                onBlur={(e) => (e.target.style.backgroundColor = "#f3f4f6")}
              />

              {isModified && (
                <button
                  type="button"
                  onClick={() => handleResetField(key)}
                  className="position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent text-secondary me-2"
                  title={`Revert ${label}`}
                  disabled={loading}
                  style={{
                    cursor: "pointer",
                    color: "#6366f1",
                    opacity: 0.7,
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.7)}
                >
                  <i className="bi bi-x-circle-fill fs-6"></i>
                </button>
              )}
            </div>
          </div>
        );
      })}

      <div className="d-flex justify-content-end mt-4 gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="btn btn-outline-secondary rounded-pill px-4 fw-semibold shadow-sm"
        >
          <i className="bi bi-x-circle me-1"></i> Cancel
        </button>

        <button
          type="submit"
          disabled={loading || !hasChanges}
          className="btn rounded-pill px-4 fw-semibold shadow-sm"
          style={{
            background: hasChanges
              ? "linear-gradient(90deg, #6366f1, #818cf8)"
              : "#d1d5db",
            color: hasChanges ? "white" : "#6b7280",
            border: "none",
            cursor: hasChanges ? "pointer" : "not-allowed",
            transition: "all 0.2s ease",
          }}
        >
          <i className="bi bi-save2-fill me-1"></i>{" "}
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {renderMessageBox(formMsg)}
    </form>
  );
};

export default EditProfileTab;
