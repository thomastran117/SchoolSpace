import React, { useState } from "react";
import PrimaryApi from "../../api/primaryApi";

const EditProfile = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setMessage("");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please choose a file first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("avatar", file);

      const res = await PrimaryApi.post("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("✅ Avatar updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.error ||
          err.message ||
          "❌ Failed to upload avatar.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div
        className="card shadow-sm p-4"
        style={{ maxWidth: "450px", width: "100%" }}
      >
        <h2 className="text-center mb-4 fw-bold">Edit Profile</h2>

        <form onSubmit={handleUpload}>
          <div className="mb-3 text-center">
            <label
              htmlFor="avatar"
              className="form-label fw-semibold"
              style={{ cursor: "pointer" }}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="rounded-circle mb-2"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                    border: "3px solid #dee2e6",
                  }}
                />
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center border rounded-circle mx-auto mb-2"
                  style={{
                    width: "120px",
                    height: "120px",
                    backgroundColor: "#f8f9fa",
                    color: "#6c757d",
                  }}
                >
                  <i className="bi bi-person-circle fs-1"></i>
                </div>
              )}
              <div className="text-muted small">
                Click to choose a new avatar
              </div>
            </label>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              className="form-control d-none"
              onChange={handleFileChange}
            />
          </div>

          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Avatar"}
            </button>
          </div>
        </form>

        {message && (
          <div
            className={`alert mt-3 py-2 ${
              message.startsWith("✅")
                ? "alert-success"
                : message.startsWith("❌")
                  ? "alert-danger"
                  : "alert-secondary"
            }`}
            role="alert"
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfile;
