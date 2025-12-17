using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LearningStarter.Data;
using LearningStarter.Entities;
using Microsoft.AspNetCore.Identity;

namespace LearningStarter.Controllers;

[ApiController]
[Route("api/[controller]")]

public class BlogLikesController : ControllerBase
{
    private readonly DataContext _context;

    public BlogLikesController(DataContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BlogLikeGetDto>>> GetAll()
    {
        var blogLikes = await _context.BlogLikes.ToListAsync();
        var result = blogLikes.Select(p => new BlogLikeGetDto
        {
            Id = p.Id,
            UserId = p.UserId,
            BlogId = p.BlogId
        });
        return Ok(result);
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<BlogLikeGetDto>> GetById(int id)
    {
        var blogLikes = await _context.BlogLikes.FindAsync(id);
        if (blogLikes == null)
            return NotFound();
        return Ok(new BlogLikeGetDto
        {
            Id = blogLikes.Id,
            UserId = blogLikes.UserId,
            BlogId = blogLikes.BlogId
        });
    }
    
    
}