using System.Collections;
using System.Collections.Generic;

namespace LearningStarter.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;


public class University
{
    public int Id { get; set; }
    public string Name { get; set; }
    
    
}

public class UniversitiesCreateDto
{
    public string Name { get; set; } = string.Empty;
   
    
}

public class UniversitiesUpdateDto
{
    public string Name { get; set; }= string.Empty;
    
}

public class UniversitiesGetDto
{
    public int Id { get; set; }
    public string Name { get; set; }= string.Empty;
 
    
}
public class UniversityEntityConfiguration : IEntityTypeConfiguration<University>
{
    public void Configure(EntityTypeBuilder<University> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Name)
            .IsRequired();
  
    }
}