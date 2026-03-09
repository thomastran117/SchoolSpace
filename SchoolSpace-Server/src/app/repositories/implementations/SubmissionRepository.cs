using backend.app.configurations.resources.database;
using backend.app.models.core;
using backend.app.repositories.interfaces;

using Microsoft.EntityFrameworkCore;

namespace backend.app.repositories.implementations
{
    public class SubmissionRepository : ISubmissionRepository
    {
        private readonly AppDatabaseContext _context;

        public SubmissionRepository(AppDatabaseContext context)
        {
            _context = context;
        }

        public async Task<Submission> CreateAsync(Submission submission)
        {
            await _context.Submissions.AddAsync(submission);
            await _context.SaveChangesAsync();
            return submission;
        }

        public async Task<Submission?> GetByIdAsync(int id)
        {
            return await _context.Submissions
                .AsNoTracking()
                .Include(s => s.Assignment)
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<IEnumerable<Submission>> GetByAssignmentIdAsync(int assignmentId)
        {
            return await _context.Submissions
                .AsNoTracking()
                .Include(s => s.User)
                .Where(s => s.AssignmentId == assignmentId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Submission>> GetByUserIdAsync(int userId)
        {
            return await _context.Submissions
                .AsNoTracking()
                .Include(s => s.Assignment)
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Submission>> GetByUserAndAssignmentAsync(int userId, int assignmentId)
        {
            return await _context.Submissions
                .AsNoTracking()
                .Where(s => s.UserId == userId && s.AssignmentId == assignmentId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<Submission?> UpdateAsync(Submission submission)
        {
            var existing = await _context.Submissions.FindAsync(submission.Id);
            if (existing is null)
                return null;

            existing.Content = submission.Content;
            existing.FileUrl = submission.FileUrl;
            existing.Grade = submission.Grade;
            existing.Feedback = submission.Feedback;
            existing.Status = submission.Status;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var submission = await _context.Submissions.FindAsync(id);
            if (submission is null)
                return false;

            _context.Submissions.Remove(submission);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
