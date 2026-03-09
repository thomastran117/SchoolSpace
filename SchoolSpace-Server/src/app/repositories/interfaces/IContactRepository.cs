using backend.app.attributes.repository;
using backend.app.models.core;

namespace backend.app.repositories.interfaces
{
    public interface IContactRepository
    {
        Task<Contact> CreateAsync(Contact contact);
        Task<Contact?> GetByIdAsync(int id);
        Task<IEnumerable<Contact>> GetAllAsync();
    }
}
