using elmanassa.ApplicationDbContext;
using elmanassa.DTOs;
using elmanassa.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace elmanassa.Services
{
    public interface ICourseService
    {
        Task<List<CourseDTO>> GetCoursesAsync(string? category = null, string? level = null, string? search = null, int page = 1, int perPage = 12);
        Task<List<CourseDTO>> GetPopularCoursesAsync(int page = 1, int perPage = 12);
        Task<CourseDTO?> GetCourseByIdAsync(string id);
        Task<List<ReviewDTO>> GetCourseReviewsAsync(string courseId, int page = 1, int perPage = 10);
        Task<ReviewDTO?> AddReviewAsync(string courseId, Guid userId, ReviewCreateDTO dto);
        Task<int> GetCourseCountAsync();
    }

    public class CourseService : ICourseService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<CourseService> _logger;

        public CourseService(AppDbContext context, ILogger<CourseService> logger)
        {
            _context = context;
            _logger = logger;
        }

        private CourseDTO MapToDTO(Subject s)
        {
            var lecturesCount = s.Levels?.Sum(l => l.Lectures?.Count ?? 0) ?? 0;
            
            return new CourseDTO
            {
                Id = Math.Abs(s.Id.GetHashCode() % 1000000) + 1,
                GuidId = s.Id,
                Title = s.Title ?? "",
                Description = s.Description,
                Category = string.IsNullOrEmpty(s.Category) ? "عام" : s.Category,
                InstructorId = s.TeacherId,
                Rating = 4.5M,
                Duration = s.Duration,
                LecturesCount = lecturesCount,
                Level = string.IsNullOrEmpty(s.Level) ? "مبتدئ" : s.Level,
                Language = string.IsNullOrEmpty(s.Language) ? "العربية" : s.Language,
                StudentsCount = s.StudentsCount,
                Price = s.Price,
                ImageUrl = s.ImageUrl,
                Status = string.IsNullOrEmpty(s.Status) ? "draft" : s.Status,
                CreatedAt = s.CreatedAt
            };
        }

        public async Task<List<CourseDTO>> GetCoursesAsync(string? category = null, string? level = null, string? search = null, int page = 1, int perPage = 12)
        {
            try
            {
                var query = _context.Subjects
                    .Where(s => s.Status == "published")
                    .AsQueryable();

                if (!string.IsNullOrEmpty(category))
                    query = query.Where(s => s.Category == category);

                if (!string.IsNullOrEmpty(level))
                    query = query.Where(s => s.Level == level);

                if (!string.IsNullOrEmpty(search))
                    query = query.Where(s => s.Title.Contains(search) || (s.Description != null && s.Description.Contains(search)));

                var subjects = await query
                    .OrderByDescending(s => s.CreatedAt)
                    .Skip((page - 1) * perPage)
                    .Take(perPage)
                    .Include(s => s.Levels)
                    .ThenInclude(l => l.Lectures)
                    .ToListAsync();

                return subjects.Select(MapToDTO).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetCoursesAsync");
                throw;
            }
        }

        public async Task<List<CourseDTO>> GetPopularCoursesAsync(int page = 1, int perPage = 12)
        {
            try
            {
                var subjects = await _context.Subjects
                    .Where(s => s.Status == "published")
                    .OrderByDescending(s => s.StudentsCount)
                    .Skip((page - 1) * perPage)
                    .Take(perPage)
                    .Include(s => s.Levels)
                    .ThenInclude(l => l.Lectures)
                    .ToListAsync();

                return subjects.Select(MapToDTO).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPopularCoursesAsync");
                throw;
            }
        }

        public async Task<CourseDTO?> GetCourseByIdAsync(string id)
        {
            try
            {
                if (!Guid.TryParse(id, out var guidId))
                    return null;

                var s = await _context.Subjects
                    .Include(s => s.Levels)
                    .ThenInclude(l => l.Lectures)
                    .FirstOrDefaultAsync(s => s.Id == guidId);

                if (s == null) return null;

                var dto = MapToDTO(s);
                dto.CurriculumSections = s.Levels?.OrderBy(l => l.SortOrder).Select(l => new CurriculumSectionDTO
                {
                    Id = l.Id,
                    Title = l.Title ?? "",
                    SortOrder = l.SortOrder,
                    Lectures = l.Lectures?.OrderBy(lec => lec.SortOrder).Select(lec => new LectureDTO
                    {
                        Id = lec.Id,
                        Title = lec.Title ?? "",
                        Duration = lec.Duration,
                        VideoUrl = lec.VideoUrl,
                        SortOrder = lec.SortOrder
                    }).ToList() ?? new()
                }).ToList();

                return dto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetCourseByIdAsync for {Id}", id);
                throw;
            }
        }

        public async Task<List<ReviewDTO>> GetCourseReviewsAsync(string courseId, int page = 1, int perPage = 10)
        {
            try
            {
                if (!Guid.TryParse(courseId, out var guidId))
                    return new List<ReviewDTO>();

                var reviews = await _context.Reviews
                    .Where(r => r.CourseId == guidId.GetHashCode())
                    .OrderByDescending(r => r.CreatedAt)
                    .Skip((page - 1) * perPage)
                    .Take(perPage)
                    .Include(r => r.User)
                    .ToListAsync();

                return reviews.Select(r => new ReviewDTO
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    UserName = r.User?.Name ?? "Unknown",
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetCourseReviewsAsync");
                return new List<ReviewDTO>();
            }
        }

        public async Task<ReviewDTO?> AddReviewAsync(string courseId, Guid userId, ReviewCreateDTO dto)
        {
            try
            {
                if (!Guid.TryParse(courseId, out var guidId))
                    return null;

                var enrollment = await _context.Enrollments
                    .Include(e => e.User)
                    .FirstOrDefaultAsync(e => e.UserId == userId && e.SubjectId == guidId);

                if (enrollment == null)
                    return null;

                var existing = await _context.Reviews
                    .FirstOrDefaultAsync(r => r.UserId == userId && r.CourseId == guidId.GetHashCode());

                if (existing != null)
                    return null;

                var review = new Review
                {
                    UserId = userId,
                    CourseId = guidId.GetHashCode(),
                    Rating = dto.Rating,
                    Comment = dto.Comment,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();

                return new ReviewDTO
                {
                    Id = review.Id,
                    UserId = review.UserId,
                    UserName = enrollment.User?.Name ?? "Unknown",
                    Rating = review.Rating,
                    Comment = review.Comment,
                    CreatedAt = review.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AddReviewAsync");
                return null;
            }
        }

        public async Task<int> GetCourseCountAsync()
        {
            return await _context.Subjects.CountAsync(s => s.Status == "published");
        }
    }
}
