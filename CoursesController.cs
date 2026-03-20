using elmanassa.DTOs;
using elmanassa.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace elmanassa.Controllers
{
    [ApiController]
    [Route("api/v1/subjects")]
    public class CoursesController : ControllerBase
    {
        private readonly ICourseService _courseService;
        private readonly ILogger<CoursesController> _logger;

        public CoursesController(ICourseService courseService, ILogger<CoursesController> logger)
        {
            _courseService = courseService;
            _logger = logger;
        }

        /// <summary>
        /// Get all published courses with filters
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<CourseDTO>>>> GetCourses(
            [FromQuery] string? category = null,
            [FromQuery] string? level = null,
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int per_page = 12)
        {
            try
            {
                var courses = await _courseService.GetCoursesAsync(category, level, search, page, per_page);
                var total = await _courseService.GetCourseCountAsync();
                
                return Ok(new ApiResponse<List<CourseDTO>>(courses, true, total)
                {
                    Meta = new ApiMeta { Page = page, PerPage = per_page, Total = total }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching courses");
                return StatusCode(500, new ApiResponse<object>(
                    "An error occurred while fetching courses", "SERVER_ERROR", false));
            }
        }

        /// <summary>
        /// Get the most popular courses (by enrollment count)
        /// </summary>
        [HttpGet("popular")]
        public async Task<ActionResult<ApiResponse<List<CourseDTO>>>> GetPopularCourses(
            [FromQuery] int page = 1,
            [FromQuery] int per_page = 12)
        {
            try
            {
                if (page < 1 || per_page < 1)
                {
                    return BadRequest(new ApiResponse<object>(
                        "Invalid pagination parameters", "VALIDATION_ERROR", false));
                }

                var courses = await _courseService.GetPopularCoursesAsync(page, per_page);
                var total = await _courseService.GetCourseCountAsync();

                return Ok(new ApiResponse<List<CourseDTO>>(courses, true, total)
                {
                    Meta = new ApiMeta { Page = page, PerPage = per_page, Total = total }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching popular courses");
                return StatusCode(500, new ApiResponse<object>(
                    "An error occurred while fetching popular courses", "SERVER_ERROR", false));
            }
        }

        /// <summary>
        /// Get course detail by ID (supports both int and Guid)
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<CourseDTO>>> GetCourseById(string id)
        {
            try
            {
                var course = await _courseService.GetCourseByIdAsync(id);
                
                if (course == null)
                    return NotFound(new ApiResponse<object>(
                        "Course not found", "NOT_FOUND", false));

                return Ok(new ApiResponse<CourseDTO>(course));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching course {CourseId}", id);
                return StatusCode(500, new ApiResponse<object>(
                    "An error occurred while fetching the course", "SERVER_ERROR", false));
            }
        }

        /// <summary>
        /// Get reviews for a course
        /// </summary>
        [HttpGet("{id}/reviews")]
        public async Task<ActionResult<ApiResponse<List<ReviewDTO>>>> GetCourseReviews(
            string id,
            [FromQuery] int page = 1,
            [FromQuery] int per_page = 10)
        {
            try
            {
                var reviews = await _courseService.GetCourseReviewsAsync(id, page, per_page);
                
                return Ok(new ApiResponse<List<ReviewDTO>>(reviews, true, reviews.Count));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching reviews for course {CourseId}", id);
                return StatusCode(500, new ApiResponse<object>(
                    "An error occurred while fetching reviews", "SERVER_ERROR", false));
            }
        }

        /// <summary>
        /// Add review for a course (student only, must be enrolled)
        /// </summary>
        [HttpPost("{id}/reviews")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<ReviewDTO>>> AddReview(string id, [FromBody] ReviewCreateDTO model)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new ApiResponse<object>(
                        "Invalid review data", "VALIDATION_ERROR", false));

                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
                var review = await _courseService.AddReviewAsync(id, userId, model);

                if (review == null)
                    return Forbid();

                return CreatedAtAction(nameof(GetCourseReviews), new { id }, 
                    new ApiResponse<ReviewDTO>(review));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding review for course {CourseId}", id);
                return StatusCode(500, new ApiResponse<object>(
                    "An error occurred while adding the review", "SERVER_ERROR", false));
            }
        }
    }
}
