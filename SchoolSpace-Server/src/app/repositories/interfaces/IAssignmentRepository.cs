using backend.app.models.core;
using backend.app.attributes.repository;

namespace backend.app.repositories.interfaces
{
    [RetryOnTransientFailure]
    public interface IAssignmentRepository
    {
        Task<Assignment> CreateAsync(Assignment assignment);
        Task<Assignment?> GetByIdAsync(int id);
        Task<IEnumerable<Assignment>> GetByCourseIdAsync(int courseId);
        [HandleMissingEntity]
        Task<Assignment?> UpdateAsync(Assignment assignment);
        [HandleMissingEntity]
        Task<bool> DeleteAsync(int id);
    }
}
