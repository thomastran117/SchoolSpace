using backend.app.configurations.resources.database;
using backend.app.models.core;
using backend.app.repositories.interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.app.repositories.implementations
{
    public class AnnouncementRepository : IAnnouncementRepository
    {
        private readonly AppDatabaseContext _context;

        public AnnouncementRepository(AppDatabaseContext context)
        {
            _context = context;
        }

        public async Task<Announcement> CreateAsync(Announcement announcement)
        {
            await _context.Announcements.AddAsync(announcement);
            await _context.SaveChangesAsync();
            return announcement;
        }

        public async Task<Announcement?> GetByIdAsync(int id)
        {
            return await _context
                .Announcements.AsNoTracking()
                .Include(a => a.Course)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<IEnumerable<Announcement>> GetByCourseIdAsync(int courseId)
        {
            return await _context
                .Announcements.AsNoTracking()
                .Where(a => a.CourseId == courseId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<Announcement?> UpdateAsync(Announcement announcement)
        {
            var existing = await _context.Announcements.FindAsync(announcement.Id);
            if (existing is null)
                return null;

            existing.Title = announcement.Title;
            existing.Content = announcement.Content;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement is null)
                return false;

            _context.Announcements.Remove(announcement);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
