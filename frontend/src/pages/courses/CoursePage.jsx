import { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import "../../styles/course.css";

export default function CoursePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const resp = await api.get("/courses");
        setCourses(resp.data.items);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(err.message || "Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 text-success">
        <div className="spinner-border me-2" role="status"></div>
        <span>Loading courses...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-danger">
        <i className="bi bi-exclamation-triangle-fill fs-1 mb-3"></i>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h1 className="mb-4 text-success fw-bold">Available Courses</h1>
      <div className="row g-4">
        {courses.map((course) => (
          <div className="col-md-6 col-lg-4" key={course.id}>
            <div
              className="card h-100 shadow-sm border-0 clickable-card position-relative"
              style={{
                cursor: "pointer",
                backgroundColor: "#f9fff9", // very light green
              }}
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              <div className="card-body">
                <h5 className="card-title text-success fw-bold">
                  {course.title}
                </h5>
                <p className="card-text text-muted">{course.description}</p>
                <p className="card-text">
                  <span className="fw-bold text-success">Code:</span>{" "}
                  {course.code}
                </p>
                {/* Stretched link makes entire card a clickable target */}
                <a href={`/courses/${course.id}`} className="stretched-link"></a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
