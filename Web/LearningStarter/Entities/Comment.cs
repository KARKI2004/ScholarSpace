using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;


namespace LearningStarter.Entities;

public class Comment
{
    public int Id { get; set; }
    public string Body { get; set; } = null!;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int ForumThreadId { get; set; }
    public ForumThread ForumThread { get; set; } = null!;

    public int? ParentCommentId { get; set; }
    public Comment? ParentComment { get; set; }
    public List<Comment> Replies { get; set; } = new();
}

public class CommentCreatedDto
{
    public string Body { get; set; } = null!;
    public int UserId { get; set; }
    public int ForumThreadId { get; set; }
    public int? ParentCommentId { get; set; }
}

public class CommentUpdatedDto
{
    public string Body { get; set; }
}

public class CommentGetDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ForumThreadId { get; set; }
    public string Body { get; set; } = null!;
    public int? ParentCommentId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public class CommentEntityConfiguration : IEntityTypeConfiguration<Comment>
{
    public void Configure(EntityTypeBuilder<Comment> builder)
    {
        builder.Property(x => x.Body)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.ForumThread)
            .WithMany(t => t.Comments)
            .HasForeignKey(c => c.ForumThreadId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(c => c.ParentComment)
            .WithMany(c => c.Replies)
            .HasForeignKey(c => c.ParentCommentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
