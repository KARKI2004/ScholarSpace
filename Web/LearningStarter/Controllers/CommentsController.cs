using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LearningStarter.Data;
using LearningStarter.Entities;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace LearningStarter.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly DataContext _context;

    public CommentsController(DataContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CommentGetDto>>> GetAll()
    {
        var comments = await _context.Comments
            .Include(c => c.Replies)
            .Include(c => c.User)
            .Include(c => c.ForumThread)
            .ToListAsync();

        var result = comments.Select(c => new CommentGetDto
        {
            Id = c.Id,
            UserId = c.UserId,
            ForumThreadId = c.ForumThreadId,
            ParentCommentId = c.ParentCommentId,
            Body = c.Body,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt
        });

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CommentGetDto>> GetById(int id)
    {
        var comment = await _context.Comments
            .Include(c => c.Replies)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (comment == null)
            return NotFound();

        var dto = new CommentGetDto
        {
            Id = comment.Id,
            UserId = comment.UserId,
            ForumThreadId = comment.ForumThreadId,
            Body = comment.Body,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt,
            ParentCommentId = comment.ParentCommentId,
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<CommentGetDto>> Create(CommentCreatedDto dto)
    {
        var userExists = await _context.Users.AnyAsync(u => u.Id == dto.UserId);
        if (!userExists)
            return BadRequest(" User Not found");

        var threadExists = await _context.ForumThreads.AnyAsync(u => u.Id == dto.ForumThreadId);
        if (!threadExists)
            return BadRequest(" Forum Thread Not found");

        var comment = new Comment
        {
            Body = dto.Body,
            UserId = dto.UserId,
            ForumThreadId = dto.ForumThreadId,
            ParentCommentId = dto.ParentCommentId
        };
        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        var result = new CommentGetDto
        {
            Id = comment.Id,
            UserId = comment.UserId,
            ForumThreadId = comment.ForumThreadId,
            Body = comment.Body,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt,
            ParentCommentId = comment.ParentCommentId
        };
        return CreatedAtAction(nameof(GetById), new { id = comment.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CommentGetDto>> Update(int id, CommentUpdatedDto dto)
    {
        var comment = await _context.Comments.FindAsync(id);
        if (comment == null)
            return NotFound();

        comment.Body = dto.Body;
        comment.UpdatedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync();

        var result = new CommentGetDto
        {
            Id = comment.Id,
            UserId = comment.UserId,
            ForumThreadId = comment.ForumThreadId,
            Body = comment.Body,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt,
            ParentCommentId = comment.ParentCommentId
        };

        return Ok("Comment Updated successfully");
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var comment = await _context.Comments.FindAsync(id);
        if (comment == null)
            return NotFound();
        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();
        return Ok("Comment Deleted successfully");
    }
}