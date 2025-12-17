using System.Collections.Generic;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LearningStarter.Entities;

public class User : IdentityUser<int>
{
    public string FirstName { get; set; } 
    public string LastName { get; set; }

    public string Email { get; set; }
    public string Status { get; set; }

    public List<UserRole> UserRoles { get; set; } = new();
    public University University { get; set; }
    public int UniversityId { get; set; }
  
}

public class UserCreateDto
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string UserName { get; set; }
    public string Password { get; set; }
    public string Email { get; set; }
    
    public int UniversityId { get; set; }
    public string Status { get; set; }
}

public class UserUpdateDto
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string UserName { get; set; }
    public string Password { get; set; }

    public string Email { get; set; }

    public int UniversityId { get; set; }
    
    public string Status { get; set; }
}

public class UserGetDto
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string UserName { get; set; }

    public int UniversityId { get; set; }

    public string Status { get; set; }
    public string Role { get; set; }
}

public class UserEntityConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.Property(x => x.FirstName)
            .IsRequired();

        builder.Property(x => x.LastName)
            .IsRequired();

        builder.Property(x => x.UserName)
            .IsRequired();
        
        builder.Property(x => x.Status)
            .IsRequired();
        
        builder.Property(x=> x.Email)
            .IsRequired();
        
        builder.HasOne(x => x.University)
            .WithMany()
            .HasForeignKey(x => x.UniversityId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

