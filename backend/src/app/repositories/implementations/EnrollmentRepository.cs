using backend.app.configurations.resources.database;
using backend.app.models.core;
using backend.app.repositories.interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.app.repositories.implementations
{
    public class EnrollmentRepository : IEnrollmentRepository
    {
        private readonly AppDatabaseContext _context;

        public EnrollmentRepository(AppDatabaseContext context)
        {
            _context = context;
        }

        public async Task<Enrollment> CreateAsync(Enrollment enrollment)
        {
            await _context.Enrollments.AddAsync(enrollment);
            await _context.SaveChangesAsync();
            return enrollment;
        }

        public async Task<bool> ExistsAsync(int userId, int courseId)
        {
            return await _context
                .Enrollments.AsNoTracking()
                .AnyAsync(e => e.UserId == userId && e.CourseId == courseId);
        }

        public async Task<bool> DeleteAsync(int userId, int courseId)
        {
            var enrollment = await _context.Enrollments.FindAsync(userId, courseId);

            if (enrollment is null)
                return false;

            _context.Enrollments.Remove(enrollment);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Course>> GetCoursesByUserIdAsync(int userId)
        {
            return await _context
                .Enrollments.AsNoTracking()
                .Where(e => e.UserId == userId)
                .Include(e => e.Course)
                    .ThenInclude(c => c.Teacher)
                .Include(e => e.Course)
                    .ThenInclude(c => c.School)
                .Select(e => e.Course)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<User>> GetUsersByCourseIdAsync(int courseId)
        {
            return await _context
                .Enrollments.AsNoTracking()
                .Where(e => e.CourseId == courseId)
                .Include(e => e.User)
                .Select(e => e.User)
                .OrderBy(u => u.Id)
                .ToListAsync();
        }
    }
}
