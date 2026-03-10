using backend.app.configurations.resources.database;
using backend.app.models.core;
using backend.app.repositories.interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.app.repositories.implementations
{
    public class CourseRepository : ICourseRepository
    {
        private readonly AppDatabaseContext _context;

        public CourseRepository(AppDatabaseContext context)
        {
            _context = context;
        }

        public async Task<Course> CreateAsync(Course course)
        {
            await _context.Courses.AddAsync(course);
            await _context.SaveChangesAsync();
            return course;
        }

        public async Task<Course?> GetByIdAsync(int id)
        {
            return await _context
                .Courses.AsNoTracking()
                .Include(c => c.Teacher)
                .Include(c => c.School)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<IEnumerable<Course>> GetAllAsync()
        {
            return await _context
                .Courses.AsNoTracking()
                .Include(c => c.Teacher)
                .Include(c => c.School)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Course>> GetByIdsAsync(IEnumerable<int> ids)
        {
            var idList = ids.Distinct().ToList();

            if (idList.Count == 0)
                return [];

            return await _context
                .Courses.AsNoTracking()
                .Include(c => c.Teacher)
                .Include(c => c.School)
                .Where(c => idList.Contains(c.Id))
                .ToListAsync();
        }

        public async Task<IEnumerable<Course>> GetBySchoolIdAsync(int schoolId)
        {
            return await _context
                .Courses.AsNoTracking()
                .Include(c => c.Teacher)
                .Where(c => c.SchoolId == schoolId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Course>> GetByTeacherIdAsync(int teacherId)
        {
            return await _context
                .Courses.AsNoTracking()
                .Include(c => c.School)
                .Where(c => c.TeacherId == teacherId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<Course?> UpdateAsync(Course course)
        {
            var existing = await _context.Courses.FindAsync(course.Id);
            if (existing is null)
                return null;

            existing.Name = course.Name;
            existing.CourseCode = course.CourseCode;
            existing.Description = course.Description;
            existing.TeacherId = course.TeacherId;
            existing.SchoolId = course.SchoolId;
            existing.Status = course.Status;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course is null)
                return false;

            course.Status = CourseStatus.SoftDelete;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> DeleteByIdsAsync(IEnumerable<int> ids)
        {
            var idList = ids.Distinct().ToList();

            if (idList.Count == 0)
                return 0;

            var courses = await _context.Courses.Where(c => idList.Contains(c.Id)).ToListAsync();

            foreach (var course in courses)
            {
                course.Status = CourseStatus.SoftDelete;
            }

            await _context.SaveChangesAsync();
            return courses.Count;
        }

        public async Task<bool> HardDeleteAsync(int id)
        {
            var course = await _context
                .Courses.IgnoreQueryFilters()
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course is null)
                return false;

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
