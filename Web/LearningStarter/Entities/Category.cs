using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace LearningStarter.Entities;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; }
}

public class CategoryCreateDto
{
    public string Name { get; set; } = string.Empty;
}

public class CategoryUpdateDto
{
    public string Name { get; set; } = string.Empty;
}

public class CategoryGetDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class CategoryEntityConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired();
    }
}
