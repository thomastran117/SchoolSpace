using backend.app.attributes.repository;
using backend.app.models.core;

namespace backend.app.repositories.interfaces
{
    [RetryOnTransientFailure]
    public interface IReportRepository
    {
        Task<Report> CreateAsync(Report report);
        Task<Report?> GetByIdAsync(int id);
        Task<IEnumerable<Report>> GetAllAsync();

        [HandleMissingEntity]
        Task<Report?> UpdateAsync(Report report);

        [HandleMissingEntity]
        Task<bool> DeleteAsync(int id);
    }
}
