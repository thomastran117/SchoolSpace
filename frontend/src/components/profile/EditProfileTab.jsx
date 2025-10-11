import React from "react";

const EditProfileTab = ({ form, onChange, onSave, onCancel, formMsg }) => {
  const fieldIcons = {
    name: "bi-person-circle",
    title: "bi-briefcase-fill",
    organization: "bi-building",
    workPhone: "bi-telephone-fill",
    mobilePhone: "bi-phone-fill",
    email: "bi-envelope-fill",
  };

  return (
    <form onSubmit={onSave} className="px-1">
      {[
        ["name", "Name:"],
        ["title", "Title:"],
        ["organization", "Organization:"],
        ["workPhone", "Work Phone:"],
        ["mobilePhone", "Mobile Phone:"],
        ["email", "Email:"],
      ].map(([key, label]) => (
        <div className="mb-3 row align-items-center" key={key}>
          <label className="col-sm-4 col-form-label fw-semibold text-success d-flex align-items-center gap-2">
            <i className={`${fieldIcons[key]} fs-5`}></i>
            {label}
          </label>
          <div className="col-sm-8">
            <input
              type={key === "email" ? "email" : "text"}
              name={key}
              className="form-control border-success-subtle rounded-pill px-3 shadow-sm"
              value={form[key]}
              onChange={onChange}
            />
          </div>
        </div>
      ))}

      <div className="d-flex justify-content-end mt-4 gap-2">
        <button
          type="button"
          className="btn btn-outline-success px-4 rounded-pill fw-semibold d-flex align-items-center gap-2"
          onClick={onCancel}
        >
          <i className="bi bi-x-circle"></i> Cancel
        </button>
        <button
          type="submit"
          className="btn btn-success px-4 rounded-pill fw-semibold d-flex align-items-center gap-2"
        >
          <i className="bi bi-save2-fill"></i> Save
        </button>
      </div>

      {formMsg && (
        <div
          className={`small mt-3 text-end ${
            formMsg.startsWith("✅")
              ? "text-success"
              : formMsg.startsWith("❌")
                ? "text-danger"
                : "text-muted"
          }`}
        >
          {formMsg}
        </div>
      )}
    </form>
  );
};

export default EditProfileTab;
