using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LearningStarter.Data;
using LearningStarter.Entities;

namespace LearningStarter.Controllers;

[ApiController]
[Route("api/[controller]")]

public class CategoriesController : ControllerBase
{
    private readonly DataContext _context;
    
    public CategoriesController(DataContext context)
    {
        _context = context;
    }

    [HttpGet]

    public async Task<ActionResult<IEnumerable<CategoryGetDto>>> GetAll()
    {
        var categoryName = await _context.Categories.ToListAsync();
        var result = categoryName.Select(c => new CategoryGetDto
        {
            Id = c.Id,
            Name = c.Name
        });
        return Ok(result);
    }
    
    [HttpGet("{id}")]
    
    public async Task<ActionResult<IEnumerable<CategoryGetDto>>> GetById(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return NotFound();
        return Ok(new CategoryGetDto
        {
            Id = category.Id,
            Name = category.Name

        });
    }
    
    [HttpPost]
    
    public async Task<ActionResult<CategoryGetDto>> Create(CategoryCreateDto dto)
    {

        var category = new Category
        {
            Name = dto.Name

        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        var result = new CategoryGetDto
        {
            Id = category.Id,
            Name = category.Name,

        };
     
        return CreatedAtAction(nameof(GetById), new { id = category.Id }, result);
    }
    
    [HttpPut("{id}")]
    
    public async Task<IActionResult> Update(int id, [FromBody] CategoryUpdateDto dto)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return NotFound();
        
        category.Name = dto.Name;
        _context.Categories.Update(category);
        await _context.SaveChangesAsync();
        
        return Ok("Category has been updated successfully !");
    }

    [HttpDelete("{id}")]

    public async Task<IActionResult> Delete(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return NotFound();
        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        
        return Ok("Category has been deleted successfully !");
    }
}