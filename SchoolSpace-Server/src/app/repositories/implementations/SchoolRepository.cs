using backend.app.attributes.repository;
using backend.app.configurations.resources.database;
using backend.app.models.core;
using backend.app.repositories.interfaces;

using Microsoft.EntityFrameworkCore;

namespace backend.app.repositories.implementations
{
    [RetryOnTransientFailure]
    public class SchoolRepository : ISchoolRepository
    {
        private readonly AppDatabaseContext _context;

        public SchoolRepository(AppDatabaseContext context)
        {
            _context = context;
        }

        public async Task<School> CreateAsync(School school)
        {
            await _context.Schools.AddAsync(school);
            await _context.SaveChangesAsync();
            return school;
        }

        public async Task<School?> GetByIdAsync(int id)
        {
            return await _context.Schools
                .AsNoTracking()
                .Include(s => s.Principal)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<School?> GetByPrincipalIdAsync(int principalId)
        {
            return await _context.Schools
                .AsNoTracking()
                .Include(s => s.Principal)
                .FirstOrDefaultAsync(s => s.PrincipalId == principalId);
        }

        public async Task<IEnumerable<School>> GetAllAsync()
        {
            return await _context.Schools
                .AsNoTracking()
                .Include(s => s.Principal)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<School>> GetByIdsAsync(IEnumerable<int> ids)
        {
            var idList = ids.Distinct().ToList();

            if (idList.Count == 0)
                return [];

            return await _context.Schools
                .AsNoTracking()
                .Include(s => s.Principal)
                .Where(s => idList.Contains(s.Id))
                .ToListAsync();
        }

        public async Task<School?> UpdateAsync(School school)
        {
            var existing = await _context.Schools.FindAsync(school.Id);
            if (existing is null)
                return null;

            existing.Name = school.Name;
            existing.Location = school.Location;
            existing.PrincipalId = school.PrincipalId;
            existing.ImageUrl = school.ImageUrl;
            existing.TeacherNumber = school.TeacherNumber;
            existing.CoursesNumber = school.CoursesNumber;
            existing.Status = school.Status;
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var school = await _context.Schools.FindAsync(id);
            if (school is null)
                return false;

            school.Status = SchoolStatus.SoftDelete;
            school.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> DeleteByIdsAsync(IEnumerable<int> ids)
        {
            var idList = ids.Distinct().ToList();

            if (idList.Count == 0)
                return 0;

            var schools = await _context.Schools
                .Where(s => idList.Contains(s.Id))
                .ToListAsync();

            var now = DateTime.UtcNow;
            foreach (var school in schools)
            {
                school.Status = SchoolStatus.SoftDelete;
                school.UpdatedAt = now;
            }

            await _context.SaveChangesAsync();
            return schools.Count;
        }

        public async Task<bool> HardDeleteAsync(int id)
        {
            var school = await _context.Schools
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(s => s.Id == id);

            if (school is null)
                return false;

            _context.Schools.Remove(school);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
