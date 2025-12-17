using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LearningStarter.Data;
using LearningStarter.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

namespace LearningStarter.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BlogController : ControllerBase
{
    private readonly DataContext _context;

    public BlogController(DataContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BlogGetDto>>> GetAll()
    {
        var blogs = await _context.Blogs
            .Include(b => b.BlogLikes)
            .ToListAsync();
        
        var result = blogs.Select(p => new BlogGetDto
        {
            Id = p.Id,
            UserId = p.UserId,
            CategoryId = p.CategoryId,
            BlogTitle = p.BlogTitle,
            Body = p.Body,
            LikesCount = p.BlogLikes.Count,
            LikedUserIds = p.BlogLikes.Select(l => l.UserId).ToList(), 
            BlogImageUrl = p.BlogImageUrl,
            CreatedDate = p.CreatedDate,
            UpdatedDate = p.UpdatedDate
        });
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BlogGetDto>> GetById(int id)
    {
        var blog = await _context.Blogs
            .Include(b => b.BlogLikes)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (blog == null)
            return NotFound();
        return Ok(new BlogGetDto
        {
            Id = blog.Id,
            UserId = blog.UserId,
            CategoryId = blog.CategoryId,
            BlogTitle = blog.BlogTitle,
            Body = blog.Body,
            LikesCount = blog.BlogLikes.Count,
            LikedUserIds = blog.BlogLikes.Select(l => l.UserId).ToList(), 
            BlogImageUrl = blog.BlogImageUrl,
            CreatedDate = blog.CreatedDate,
            UpdatedDate = blog.UpdatedDate
        });
    }

    [HttpGet("category/{categoryId}")]
    public async Task<ActionResult<IEnumerable<BlogGetDto>>> GetByCategoryId(int categoryId)
    {
        var blogs = await _context.Blogs
            .Include(b => b.BlogLikes)
            .Where(b => b.CategoryId == categoryId)
            .ToListAsync();

        if (blogs == null || blogs.Count == 0)
            return NotFound();

        var result = blogs.Select(blog => new BlogGetDto
        {
            Id = blog.Id,
            UserId = blog.UserId,
            CategoryId = blog.CategoryId,
            BlogTitle = blog.BlogTitle,
            Body = blog.Body,
            CreatedDate = blog.CreatedDate,
            UpdatedDate = blog.UpdatedDate,
            LikesCount = blog.BlogLikes.Count
        });

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<BlogGetDto>> Create(BlogCreateDto dto)
    {
        var userExists = await _context.Users.AnyAsync(p => p.Id == dto.UserId);
        if (!userExists)
            return BadRequest("Invalid user id");

        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!categoryExists)
            return BadRequest("Invalid category id");

        var blog = new Blog
        {
            UserId = dto.UserId,
            CategoryId = dto.CategoryId,
            BlogTitle = dto.BlogTitle,
            Body = dto.Body,
            CreatedDate = DateTimeOffset.Now,
            UpdatedDate = DateTimeOffset.Now
        };

        _context.Blogs.Add(blog);
        await _context.SaveChangesAsync();

        var result = new BlogGetDto
        {
            Id = blog.Id,
            UserId = blog.UserId,
            CategoryId = blog.CategoryId,
            BlogTitle = blog.BlogTitle,
            Body = blog.Body,
            BlogImageUrl = blog.BlogImageUrl ?? "",
            LikesCount = 0,
            CreatedDate = blog.CreatedDate,
            UpdatedDate = blog.UpdatedDate
        };

        return CreatedAtAction(nameof(GetById), new { id = blog.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<BlogGetDto>> Update(int id, BlogUpdateDto dto)
    {
        var blog = await _context.Blogs.FindAsync(id);
        if (blog == null)
            return NotFound();

        blog.BlogTitle = dto.BlogTitle;
        blog.Body = dto.Body;
        blog.UpdatedDate = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync();

        return Ok("Blog has been updated successfully !");
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var blog = await _context.Blogs.FindAsync(id);
        if (blog == null)
            return NotFound();
        _context.Blogs.Remove(blog);
        await _context.SaveChangesAsync();

        return Ok("Blog has been deleted successfully !");
    }
    
    [HttpPost("{id}/like")]
    public async Task<ActionResult> BlogLike(int id, int userId)
    {
        var blogExists = await _context.Blogs.AnyAsync(b => b.Id == id);
        if (!blogExists) return NotFound();
        
        var existingLike = await _context.BlogLikes
            .FirstOrDefaultAsync(bl => bl.BlogId == id && bl.UserId == userId);

        if (existingLike != null)
        {
            _context.BlogLikes.Remove(existingLike);
            await _context.SaveChangesAsync();
            return Ok("Blog unliked successfully");
        }
        else
        {
            var like = new BlogLike
            {
                BlogId = id,
                UserId = userId
            };
            _context.BlogLikes.Add(like);
            await _context.SaveChangesAsync();
            return Ok("Blog liked successfully");
        }
    }

    [HttpPost("{id}/upload-image")]
    public async Task<ActionResult> UploadImage(int id, IFormFile file)
    {
        var blog = await _context.Blogs.FindAsync(id);
        if (blog == null)
            return NotFound("Blog not found");

        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "blog");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }
        var imageUrl = $"/uploads/blog/{fileName}";

        blog.BlogImageUrl = imageUrl;
        blog.UpdatedDate = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { imageUrl });
    }

}