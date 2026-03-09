using backend.app.configurations.resources.database;
using backend.app.models.core;
using backend.app.repositories.interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.app.repositories.implementations
{
    public class AssignmentRepository : IAssignmentRepository
    {
        private readonly AppDatabaseContext _context;

        public AssignmentRepository(AppDatabaseContext context)
        {
            _context = context;
        }

        public async Task<Assignment> CreateAsync(Assignment assignment)
        {
            await _context.Assignments.AddAsync(assignment);
            await _context.SaveChangesAsync();
            return assignment;
        }

        public async Task<Assignment?> GetByIdAsync(int id)
        {
            return await _context
                .Assignments.AsNoTracking()
                .Include(a => a.Course)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<IEnumerable<Assignment>> GetByCourseIdAsync(int courseId)
        {
            return await _context
                .Assignments.AsNoTracking()
                .Where(a => a.CourseId == courseId)
                .OrderByDescending(a => a.DueDate)
                .ToListAsync();
        }

        public async Task<Assignment?> UpdateAsync(Assignment assignment)
        {
            var existing = await _context.Assignments.FindAsync(assignment.Id);
            if (existing is null)
                return null;

            existing.Title = assignment.Title;
            existing.Description = assignment.Description;
            existing.DueDate = assignment.DueDate;
            existing.MaxPoints = assignment.MaxPoints;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var assignment = await _context.Assignments.FindAsync(id);
            if (assignment is null)
                return false;

            _context.Assignments.Remove(assignment);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
