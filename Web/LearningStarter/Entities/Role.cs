using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace LearningStarter.Entities;

public class Role : IdentityRole<int>
// Just deciding on the roles here 
{
    public List<UserRole> Users { get; set; } = new();
}