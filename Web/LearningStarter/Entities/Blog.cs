using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace LearningStarter.Entities;

public class Blog 
{
    public int Id { get; set; }
    public string BlogTitle { get; set; } = String.Empty;
    public string Body { get; set; } = String.Empty;
    public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedDate { get; set; } = DateTimeOffset.UtcNow;
    
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    
    public ICollection<BlogLike> BlogLikes { get; set; } = new List<BlogLike>();
    
    public string? BlogImageUrl { get; set; }

}

public class BlogCreateDto
{
    public int UserId { get; set; }
    public int CategoryId { get; set; }
    public string BlogTitle { get; set; } = String.Empty;
    public string Body { get; set; } = String.Empty;
    
   
    
}

public class BlogUpdateDto
{
    public string BlogTitle { get; set; }
    public string Body { get; set; } = String.Empty;
}


public class BlogGetDto
{
    public int Id { get; set; }
    
    public int UserId { get; set; }
    public int CategoryId { get; set; }
    public string BlogTitle { get; set; } = String.Empty;
    public string Body { get; set; } = String.Empty;
    public int LikesCount { get; set; } 
    public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedDate { get; set; } = DateTimeOffset.UtcNow;
    
    public List<int> LikedUserIds { get; set; } = new List<int>();
    
    public string? BlogImageUrl { get; set; }
}

public class BlogEntityConfiguration : IEntityTypeConfiguration<Blog>
{
    public void Configure(EntityTypeBuilder<Blog> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(x => x.Category)
            .WithMany()
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasMany(x => x.BlogLikes)
            .WithOne(bl => bl.Blog)
            .HasForeignKey(bl => bl.BlogId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.BlogTitle)
            .IsRequired()
            .HasMaxLength(100);
        
        builder.Property(x => x.Body)
            .IsRequired()
            .HasMaxLength(1000);
        
        builder.Property(x => x.BlogImageUrl)
            .HasMaxLength(500);
    }
}