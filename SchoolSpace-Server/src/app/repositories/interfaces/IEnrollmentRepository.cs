using backend.app.models.core;
using backend.app.attributes.repository;

namespace backend.app.repositories.interfaces
{
    [RetryOnTransientFailure]
    public interface IEnrollmentRepository
    {
        Task<Enrollment> CreateAsync(Enrollment enrollment);
        Task<bool> ExistsAsync(int userId, int courseId);
        Task<bool> DeleteAsync(int userId, int courseId);
        Task<IEnumerable<Course>> GetCoursesByUserIdAsync(int userId);
        Task<IEnumerable<User>> GetUsersByCourseIdAsync(int courseId);
    }
}
