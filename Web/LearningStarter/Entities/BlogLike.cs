using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace LearningStarter.Entities;

public class BlogLike
{
    public int Id { get; set; }
    public int BlogId { get; set; }
    public Blog Blog { get; set; } = null!;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}

public class BlogLikeGetDto
{
    public int Id { get; set; }
    public int BlogId { get; set; }
    public int UserId { get; set; }
}

public class BlogLikeEntityConfiguration : IEntityTypeConfiguration<BlogLike>
{
    public void Configure(EntityTypeBuilder<BlogLike> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        
        builder.HasOne(x => x.Blog)
            .WithMany(b => b.BlogLikes)
            .HasForeignKey(x => x.BlogId)
            .OnDelete(DeleteBehavior.Cascade);

    }
}