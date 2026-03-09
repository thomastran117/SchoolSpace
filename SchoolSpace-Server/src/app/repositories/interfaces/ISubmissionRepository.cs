using backend.app.models.core;
using backend.app.attributes.repository;

namespace backend.app.repositories.interfaces
{
    [RetryOnTransientFailure]
    public interface ISubmissionRepository
    {
        Task<Submission> CreateAsync(Submission submission);
        Task<Submission?> GetByIdAsync(int id);
        Task<IEnumerable<Submission>> GetByAssignmentIdAsync(int assignmentId);
        Task<IEnumerable<Submission>> GetByUserIdAsync(int userId);
        Task<IEnumerable<Submission>> GetByUserAndAssignmentAsync(int userId, int assignmentId);
        [HandleMissingEntity]
        Task<Submission?> UpdateAsync(Submission submission);
        [HandleMissingEntity]
        Task<bool> DeleteAsync(int id);
    }
}
