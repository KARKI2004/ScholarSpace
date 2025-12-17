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
public class UniversitiesController : ControllerBase
{
    private readonly DataContext _context;

    public UniversitiesController(DataContext context)
    {
        _context = context;
    }
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UniversitiesGetDto>>> GetAll()
    {
        var universityName = await _context.Universities.ToListAsync();
        var result = universityName.Select(u => new UniversitiesGetDto
        {
            Id = u.Id,
            Name = u.Name,
            
        });
        return Ok(result) ;
    }
    

    [HttpGet("{id}")]
    public async Task<ActionResult<IEnumerable<UniversitiesGetDto>>> GetById(int id)
    {
        var university = await _context.Universities.FindAsync(id);
        if (university == null)
            return NotFound();
        return Ok(new UniversitiesGetDto
        {
            Id = university.Id,
            Name = university.Name,

        });
    }
    

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UniversitiesUpdateDto dto)
    {
        var university = await _context.Universities.FindAsync(id);
        if (university == null)
            return NotFound();
        university.Name = dto.Name;
        _context.Universities.Update(university);
        await _context.SaveChangesAsync();
        return Ok("University updated Successfully !");
    }

    [HttpPost]
    public async Task<ActionResult<UniversitiesGetDto>> Create(UniversitiesCreateDto dto)
    {

        var university = new University
        {
            Name = dto.Name,

        };

        _context.Universities.Add(university);
        await _context.SaveChangesAsync();

        var result = new UniversitiesGetDto
        {
            Id = university.Id,
            Name = university.Name,

        };
     
        return CreatedAtAction(nameof(GetById), new { id = university.Id }, result);
    }

    [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var university = await _context.Universities.FindAsync(id);
            if (university == null)
                return NotFound();
            _context.Universities.Remove(university);
            await _context.SaveChangesAsync();
        
            return Ok("University deleted Successfully !");
        }

    }