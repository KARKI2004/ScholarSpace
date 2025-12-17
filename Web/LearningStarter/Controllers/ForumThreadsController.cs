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
public class ForumThreadsController : ControllerBase
{
    private readonly DataContext _context;

    public ForumThreadsController(DataContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ForumThreadGetDto>>> GetAll()
    {
        var forumThreads = await _context.ForumThreads.ToListAsync();
        var result = forumThreads.Select(u => new ForumThreadGetDto
        {
            Id = u.Id,
            UserId = u.UserId,
            Post = u.Post,
            CreatedAt = u.CreatedAt,
            UpdatedAt = u.UpdatedAt,
        });
        return Ok(result);
    }


    [HttpGet("{id}")]
    public async Task<ActionResult<ForumThreadGetDto>> GetById(int id)
    {
        var forumThreads = await _context.ForumThreads.FindAsync(id);
        if (forumThreads == null)
            return NotFound();
        return Ok(new ForumThreadGetDto
        {
            Id = forumThreads.Id,
            UserId = forumThreads.UserId,
            Post = forumThreads.Post,
            CreatedAt = forumThreads.CreatedAt,
            UpdatedAt = forumThreads.UpdatedAt,
        });
    }

    [HttpPost]
    public async Task<ActionResult<ForumThreadGetDto>> Create(ForumThreadCreatedDto dto)
    {
        var userExists = await _context.Users.AnyAsync(u=>u.Id==dto.UserId);
        if (!userExists)
            return BadRequest(" User Not found");
        var forumThread = new ForumThread
        {
            Post = dto.Post,
            UserId = dto.UserId
        };
        _context.ForumThreads.Add(forumThread);
        await _context.SaveChangesAsync();

        var result = new ForumThreadGetDto
        {
            Id = forumThread.Id,
            UserId = forumThread.UserId,
            Post = forumThread.Post,
            CreatedAt = forumThread.CreatedAt,
            UpdatedAt = forumThread.UpdatedAt,

        };
        return CreatedAtAction(nameof(GetById), new { id = forumThread.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ForumThreadGetDto>> Update(int id, ForumThreadUpdatedDto dto)
    {
        var forumThread = await _context.ForumThreads.FindAsync(id);
        if (forumThread == null)
            return NotFound();
        forumThread.Post = dto.Post;
        forumThread.UpdatedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync();
        var result = new ForumThread()
        {
            Id = forumThread.Id,
            UserId = forumThread.UserId,
            Post = forumThread.Post,
            
        };
        return Ok(" ForumThread Updated successfully");
        
    }
    
    
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var forumThread = await _context.ForumThreads.FindAsync(id);
        if (forumThread == null)
            return NotFound();
        _context.ForumThreads.Remove(forumThread);
        await _context.SaveChangesAsync();
        return Ok("ForumThread Deleted successfully");
    }
    
}