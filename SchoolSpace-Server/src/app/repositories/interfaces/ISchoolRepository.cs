using backend.app.models.core;
using backend.app.attributes.repository;

namespace backend.app.repositories.interfaces
{
    [RetryOnTransientFailure]
    public interface ISchoolRepository
    {
        Task<School> CreateAsync(School school);
        Task<School?> GetByIdAsync(int id);
        Task<School?> GetByPrincipalIdAsync(int principalId);
        Task<IEnumerable<School>> GetAllAsync();
        Task<List<School>> GetByIdsAsync(IEnumerable<int> ids);
        [HandleMissingEntity]
        Task<School?> UpdateAsync(School school);
        [HandleMissingEntity]
        Task<bool> DeleteAsync(int id);
        Task<int> DeleteByIdsAsync(IEnumerable<int> ids);
        [HandleMissingEntity]
        Task<bool> HardDeleteAsync(int id);
    }
}
