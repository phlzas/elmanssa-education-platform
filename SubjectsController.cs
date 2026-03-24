using elmanassa.ApplicationDbContext;
using elmanassa.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace elmanassa.Controllers
{
    [ApiController]
    [Route("api/v1/subjects")]
    public class SubjectsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<SubjectsController> _logger;

        public SubjectsController(AppDbContext context, ILogger<SubjectsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<SubjectDTO>>>> GetSubjects(
            [FromQuery] string? category = null,
            [FromQuery] string? level = null,
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int per_page = 12)
        {
            try
            {
                var query = _context.Subjects.Where(s => s.Status == "published").AsQueryable();

                if (!string.IsNullOrEmpty(category))
                    query = query.Where(s => s.Category == category);

                if (!string.IsNullOrEmpty(level))
                    query = query.Where(s => s.Level == level);

                if (!string.IsNullOrEmpty(search))
                    query = query.Where(s => s.Title.Contains(search));

                var subjects = await query
                    .OrderByDescending(s => s.CreatedAt)
                    .Skip((page - 1) * per_page)
                    .Take(per_page)
                    .Select(s => new SubjectDTO
                    {
                        Id = s.Id,
                        Name = s.Title,
                        Title = s.Title,
                        Description = s.Description,
                        Category = s.Category,
                        Duration = s.Duration,
                        Level = s.Level,
                        Language = s.Language,
                        Price = s.Price,
                        ImageUrl = s.ImageUrl,
                        Icon = s.Icon,
                        StudentsCount = s.StudentsCount,
                        Status = s.Status,
                        CreatedAt = s.CreatedAt
                    })
                    .ToListAsync();

                var total = await _context.Subjects.CountAsync(s => s.Status == "published");

                return Ok(new ApiResponse<List<SubjectDTO>>(subjects, true, total)
                {
                    Meta = new ApiMeta { Page = page, PerPage = per_page, Total = total }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching subjects");
                return StatusCode(500, new ApiResponse<object>("An error occurred", "SERVER_ERROR", false));
            }
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ApiResponse<SubjectDTO>>> GetSubjectById(Guid id)
        {
            try
            {
                var subject = await _context.Subjects
                    .Where(s => s.Id == id)
                    .Include(s => s.Levels)
                    .ThenInclude(l => l.Lectures)
                    .Select(s => new SubjectDTO
                    {
                        Id = s.Id,
                        Name = s.Title,
                        Title = s.Title,
                        Description = s.Description,
                        Icon = s.Icon,
                        StudentsCount = s.StudentsCount,
                        Status = s.Status,
                        CreatedAt = s.CreatedAt,
                        Levels = s.Levels.OrderBy(l => l.SortOrder).Select(l => new LevelDTO
                        {
                            Id = l.Id,
                            Name = l.Title,
                            SortOrder = l.SortOrder,
                            Lectures = l.Lectures.OrderBy(lec => lec.SortOrder).Select(lec => new LectureDTO
                            {
                                Id = lec.Id,
                                Title = lec.Title,
                                Duration = lec.Duration,
                                VideoUrl = VideoUrlHelper.EncodeForPlayer(lec.VideoUrl),
                                SortOrder = lec.SortOrder
                            }).ToList()
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (subject == null)
                    return NotFound(new ApiResponse<object>("Subject not found", "NOT_FOUND", false));

                return Ok(new ApiResponse<SubjectDTO>(subject));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching subject {SubjectId}", id);
                return StatusCode(500, new ApiResponse<object>("An error occurred", "SERVER_ERROR", false));
            }
        }
    }
}
