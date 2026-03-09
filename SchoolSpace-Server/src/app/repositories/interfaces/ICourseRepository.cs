using backend.app.attributes.repository;
using backend.app.models.core;

namespace backend.app.repositories.interfaces
{
    [RetryOnTransientFailure]
    public interface ICourseRepository
    {
        Task<Course> CreateAsync(Course course);
        Task<Course?> GetByIdAsync(int id);
        Task<IEnumerable<Course>> GetAllAsync();
        Task<List<Course>> GetByIdsAsync(IEnumerable<int> ids);
        Task<IEnumerable<Course>> GetBySchoolIdAsync(int schoolId);
        Task<IEnumerable<Course>> GetByTeacherIdAsync(int teacherId);

        [HandleMissingEntity]
        Task<Course?> UpdateAsync(Course course);

        [HandleMissingEntity]
        Task<bool> DeleteAsync(int id);
        Task<int> DeleteByIdsAsync(IEnumerable<int> ids);

        [HandleMissingEntity]
        Task<bool> HardDeleteAsync(int id);
    }
}
