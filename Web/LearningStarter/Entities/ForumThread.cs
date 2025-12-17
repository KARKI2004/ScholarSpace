using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;

namespace LearningStarter.Entities;

public class ForumThread
{
    public int Id { get; set; }
    public string Post { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public List<Comment> Comments { get; set; } = new();
}

public class ForumThreadCreatedDto
{
    public string Post { get; set; } = string.Empty;
    public int UserId { get; set; }
}

public class ForumThreadUpdatedDto
{
    public string Post { get; set; } = string.Empty;
}

public class ForumThreadGetDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Post { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public class ForumThreadEntityConfiguration : IEntityTypeConfiguration<ForumThread>
{
    public void Configure(EntityTypeBuilder<ForumThread> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.Post)
            .IsRequired()
            .HasMaxLength(500);
        builder.HasMany(x => x.Comments)
            .WithOne(c => c.ForumThread)
            .HasForeignKey(c => c.ForumThreadId)
            .OnDelete(DeleteBehavior.Cascade);

        
    }
}