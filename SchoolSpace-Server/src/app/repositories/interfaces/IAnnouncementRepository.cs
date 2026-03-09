using backend.app.models.core;
using backend.app.attributes.repository;

namespace backend.app.repositories.interfaces
{
    [RetryOnTransientFailure]
    public interface IAnnouncementRepository
    {
        Task<Announcement> CreateAsync(Announcement announcement);
        Task<Announcement?> GetByIdAsync(int id);
        Task<IEnumerable<Announcement>> GetByCourseIdAsync(int courseId);
        [HandleMissingEntity]
        Task<Announcement?> UpdateAsync(Announcement announcement);
        [HandleMissingEntity]
        Task<bool> DeleteAsync(int id);
    }
}
