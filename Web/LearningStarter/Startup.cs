using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IdentityModel;
using LearningStarter.Data;
using LearningStarter.Entities;
using LearningStarter.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace LearningStarter;

public class Startup
{
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    private IConfiguration Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddCors();
        services.AddControllers();

        services.AddHsts(options =>
        {
            options.MaxAge = TimeSpan.MaxValue;
            options.Preload = true;
            options.IncludeSubDomains = true;
        });

        services.AddDbContext<DataContext>(options =>
        {
            options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"));
        });

        services.AddIdentity<User, Role>(options =>
            {
                options.SignIn.RequireConfirmedAccount = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireDigit = false;
                options.Password.RequiredLength = 8;
                options.ClaimsIdentity.UserIdClaimType = JwtClaimTypes.Subject;
                options.ClaimsIdentity.UserNameClaimType = JwtClaimTypes.Name;
                options.ClaimsIdentity.RoleClaimType = JwtClaimTypes.Role;
            })
            .AddEntityFrameworkStores<DataContext>();

        services.AddMvc();

        services
            .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
                options.Events.OnRedirectToLogin = context =>
                {
                    context.Response.StatusCode = 401;
                    return Task.CompletedTask;
                };
            });

        services.AddAuthorization();

        // Swagger
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Learning Starter Server",
                Version = "v1",
                Description = "Description for the API goes here.",
            });

            c.CustomOperationIds(apiDesc => apiDesc.TryGetMethodInfo(out var methodInfo) ? methodInfo.Name : null);
            c.MapType(typeof(IFormFile), () => new OpenApiSchema { Type = "file", Format = "binary" });
        });

        services.AddSpaStaticFiles(config => { config.RootPath = "learning-starter-web/build"; });

        services.AddHttpContextAccessor();

        // configure DI for application services
        services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        services.AddScoped<IAuthenticationService, AuthenticationService>();
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env, DataContext dataContext)
    {
        dataContext.Database.EnsureDeleted();
        dataContext.Database.EnsureCreated();

        app.UseHsts();
        app.UseHttpsRedirection();
        app.UseStaticFiles();
        app.UseSpaStaticFiles();
        app.UseRouting();
        app.UseAuthentication();
        app.UseAuthorization();

        // global cors policy
        app.UseCors(x => x
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());

        // Enable middleware to serve generated Swagger as a JSON endpoint.
        app.UseSwagger(options => { options.SerializeAsV2 = true; });

        // Enable middleware to serve swagger-ui (HTML, JS, CSS, etc.),
        // specifying the Swagger JSON endpoint.
        app.UseSwaggerUI(c => { c.SwaggerEndpoint("/swagger/v1/swagger.json", "Learning Starter Server API V1"); });

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseEndpoints(x => x.MapControllers());

        app.UseSpa(spa =>
        {
            spa.Options.SourcePath = "learning-starter-web";
            if (env.IsDevelopment())
            {
                spa.UseProxyToSpaDevelopmentServer("http://localhost:3001");
            }
        });

        using var scope = app.ApplicationServices.CreateScope();
        var userManager = scope.ServiceProvider.GetService<UserManager<User>>();
        var roleManager = scope.ServiceProvider.GetService<RoleManager<Role>>();

        SeedRoles(dataContext, roleManager).Wait();
        SeedUniversities(dataContext).Wait();
        SeedUsers(dataContext, userManager).Wait();
        SeedCategories(dataContext).Wait();
        SeedBlogs(dataContext).Wait();
        SeedForumThreads(dataContext).Wait();
    }

    private static async Task SeedUsers(DataContext dataContext, UserManager<User> userManager)
    {
        var numUsers = dataContext.Users.Count();

        if (numUsers == 0)
        {
            var seededUser = new User
            {
                FirstName = "Nitesh",
                LastName = "Shah",
                UserName = "admin",
                Email = "admin@gmail.com",
                UniversityId = 1,
                Status = "Freshman"
            };


            await userManager.CreateAsync(seededUser, "Password");
            await userManager.AddToRoleAsync(seededUser, "Admin");

            var studentUser = new User
            {
                FirstName = "Grish",
                LastName = "Neupane",
                UserName = "grishktm",
                Email = "grish.neupane@selu.edu",
                UniversityId = 2,
                Status = "Sophomore"
            };

            await userManager.CreateAsync(studentUser, "Password123");
            await userManager.AddToRoleAsync(studentUser, "Admin");
            
            var student1User = new User
            {
                FirstName = "Josh",
                LastName = "Cantu",
                UserName = "Josh23",
                Email = "josh.cantu@selu.edu",
                UniversityId = 1,
                Status = "Senior"
            };

            await userManager.CreateAsync(student1User, "Password");
            await userManager.AddToRoleAsync(student1User, "Student");
            var student2User = new User
            {
                FirstName = "Samsha",
                LastName = "Aryal",
                UserName = "Samsha",
                Email = "samsha.Aryal@selu.edu",
                UniversityId = 4,
                Status = "Senior"
            };

            await userManager.CreateAsync(student2User, "Password");
            await userManager.AddToRoleAsync(student2User, "Student");
            var student3User = new User
            {
                FirstName = "Jack",
                LastName = "Crishtopher",
                UserName = "Christopher",
                Email = "Chirsh.jack@selu.edu",
                UniversityId = 5,
                Status = "Junior"
            };

            await userManager.CreateAsync(student3User, "Password");
            await userManager.AddToRoleAsync(student3User, "Student");
            
            var student4User = new User
            {
                FirstName = "Ram",
                LastName = "Einstein",
                UserName = "einstein2",
                Email = "ram.einstein@selu.edu",
                UniversityId = 7,
                Status = "Freshman"
            };

            await userManager.CreateAsync(student4User, "Password");
            await userManager.AddToRoleAsync(student4User, "Student");
            await dataContext.SaveChangesAsync();
        }
    }

    private static async Task SeedRoles(DataContext dataContext, RoleManager<Role> roleManager)
    {
        var numRoles = dataContext.Roles.Count();

        if (numRoles == 0)
        {
            var seededRole = new Role
            {
                Name = "Admin"
            };

            var seededStudentRole = new Role
            {
                Name = "Student"
            };

            await roleManager.CreateAsync(seededRole);
            await roleManager.CreateAsync(seededStudentRole);
            await dataContext.SaveChangesAsync();
        }
    }

    private static async Task SeedUniversities(DataContext dataContext)
    {
        if (dataContext.Universities.Any()) return;

        var seededUniversity = new University
        {
            Name = "Southeastern Louisiana University",
        };
        var seededUniversity1 = new University
        {
            Name = "Louisiana Tech University",
        };
        var seededUniversity2 = new University
        {
            Name = "Louisiana State University",
        };
        var seededUniversity3 = new University
        {
            Name = "University of Louisiana at Lafayette",
        };
        var seededUniversity4 = new University
        {
            Name = "Tulane University",
        };
        var seededUniversity5 = new University
        {
            Name = "University of New Orleans",
        };
        var seededUniversity6 = new University
        {
            Name = "University of Florida",
        };
        var seededUniversity7 = new University
        {
            Name = "Texas A&M University",
        };
        var seededUniversity8 = new University
        {
            Name = "University of California, Berkeley",
        };
        var seededUniversity9 = new University
        {
            Name = "Massachusetts Institute of Technology",
        };

        dataContext.Set<University>().Add(seededUniversity);
        dataContext.Set<University>().Add(seededUniversity1);
        dataContext.Set<University>().Add(seededUniversity2);
        dataContext.Set<University>().Add(seededUniversity3);
        dataContext.Set<University>().Add(seededUniversity4);
        dataContext.Set<University>().Add(seededUniversity5);
        dataContext.Set<University>().Add(seededUniversity6);
        dataContext.Set<University>().Add(seededUniversity7);
        dataContext.Set<University>().Add(seededUniversity8);
        dataContext.Set<University>().Add(seededUniversity9);

        await dataContext.SaveChangesAsync();

    }

    private static async Task SeedCategories(DataContext dataContext)
    {
        if (dataContext.ForumThreads.Any()) return;


        var seededCategory = new List<Category>
        {
            new Category
            {
                Name = "Academics"
            },
            new Category
            {
                Name = "Creativity"
            },
            new Category
            {
                Name = "Careers"
            },
            new Category
            {
                Name = "Wellness"
            },
            new Category
            {
                Name = "Opinions"
            },
            new Category
            {
                Name = "Student Life"
            },
            new Category
            {
                Name = "Tech & Tools"
            },
        };

        await dataContext.Categories.AddRangeAsync(seededCategory);
        await dataContext.SaveChangesAsync();
    }

    private static async Task SeedBlogs(DataContext dataContext)
    {
        if (dataContext.Blogs.Any()) return;
        var user = dataContext.Users
            .FirstOrDefault(u => u.UserName.ToLower() == "admin");
        var category = dataContext.Categories
            .FirstOrDefault(c => c.Name.ToLower() == "Academics");

        if (user == null || category == null) return;

        var seededBlog = new List<Blog>
        {
            new Blog
            {
                UserId = 1,
                CategoryId = 6,
                BlogTitle = "Finding Balance in University Life",
                Body =
                    "University Life is full of new experiences and responsibilities. Balancing studies, work and social life can be tough but planning and staying organised make it easier.",
                BlogImageUrl = "/src/assets/images/campuslife.jpg"
            },
            new Blog
            {
                UserId = 2,
                CategoryId = 1,
                BlogTitle = "Top 5 Study Tips for Academic Success",
                Body =
                    "Consistency is key to academic success. Attend classes regularly, take clear notes, form study groups, and use campus resources like the library and tutoring services.",
                BlogImageUrl = "/src/assets/images/study-for-exam.jpg"
            },

            new Blog
            {
                UserId = 2,
                CategoryId = 2,
                BlogTitle = "Unlocking Your Inner Artist",
                Body =
                    "Explore practical ways to awaken your creative instincts—even if you don’t consider yourself “artistic.” Include tips on doodling, journaling, and overcoming the fear of a blank page.",
                BlogImageUrl = "/src/assets/images/findyourself.jpg"
            },

            new Blog
            {
                UserId = 1,
                CategoryId = 2,
                BlogTitle = "Capturing Moments: Photography as a Creative Habit",
                Body =
                    "Photography turns everyday moments into creative expressions, " +
                    "helping you see beauty in the ordinary.",
                BlogImageUrl = "/src/assets/images/photography.jpg"
            },
            new Blog
            {
                UserId = 2,
                CategoryId = 3,
                BlogTitle = "Mindful Coding: Finding Calm in the Flow of Logic",
                Body =
                    "Programming can be more than a task—it’s a mindful activity that helps you focus, stay present," +
                    " and build clarity through logic and structure.",
                BlogImageUrl = "/src/assets/images/mindful-coding.jpg"
            },
            new Blog
            {
                UserId = 4,
                CategoryId = 4,
                BlogTitle = "The Art of Collaboration in Tech Projects",
                Body =
                    "Teamwork is at the heart of every successful tech project. Learning to communicate, delegate, and support others is as vital as writing clean code.",
                BlogImageUrl = "/src/assets/images/team-collaboration.jpg"
            },
            
            new Blog
            {
                UserId = 3,
                CategoryId = 3,
                BlogTitle = "Building Strong Problem-Solving Skills in Programming",
                Body =
                    "Great programmers aren’t defined by how many languages they know, but by how they approach challenges. Problem-solving, debugging, and critical thinking shape your true coding journey.",
                BlogImageUrl = "/src/assets/images/problem-solving.png"
            },
            new Blog
            {
                UserId = 3,
                CategoryId = 1,
                BlogTitle = "Why Every Student Should Learn Version Control",
                Body =
                    "Version control systems like Git aren’t just for professional engineers—they’re essential tools for students too. They help you organize assignments, collaborate smoothly, and track your progress.",
                BlogImageUrl = "/src/assets/images/version-control.jpg"
            },
            new Blog
            {
                UserId = 3,
                CategoryId = 7,
                BlogTitle = "Understanding XSS Exploits: How Hackers Inject Malicious Scripts",
                Body =
                    "Cross-Site Scripting (XSS) is a web vulnerability that allows attackers to inject malicious " +
                    "JavaScript into websites that fail to properly sanitize user input. When executed in a victim’s " +
                    "browser, this script can steal cookies, hijack sessions, deface pages, or redirect users to" +
                    " harmful " +
                    "sites. XSS usually appears in three types—Stored, Reflected, and DOM-Based—and is " +
                    "commonly exploited using crafted payloads like <script>alert('XSS')</script>. " +
                    "Developers can prevent XSS by validating inputs, escaping outputs, and using security measures " +
                    "such as Content Security Policy (CSP).",
                BlogImageUrl = "/src/assets/images/xss-attack.jpg"
            },
            


        };

        await dataContext.Blogs.AddRangeAsync(seededBlog);
        await dataContext.SaveChangesAsync();
    }

    private static async Task SeedForumThreads(DataContext dataContext)
    {
        if (dataContext.ForumThreads.Any()) return;
        var user = dataContext.Users
            .FirstOrDefault(u => u.UserName == "admin");
        if (user == null) return;

        var seededForumThread = new ForumThread
        {
            UserId = 1,
            Post = "This is a place where you can ask questions and let fellow students answer it."
        };
        dataContext.Set<ForumThread>().Add(seededForumThread);
        await dataContext.SaveChangesAsync();

        var seededForumThread1 = new ForumThread
        {
            UserId = 1,
            Post = "Can someone tell me which approach should I take for this differential equation?"
        };
        dataContext.Set<ForumThread>().Add(seededForumThread1);
        await dataContext.SaveChangesAsync();
        
        var seededForumThread2 = new ForumThread
        {
            UserId = 2,
            Post = "Does anyone have tips for improving productivity during long study sessions?"
        };
        dataContext.Set<ForumThread>().Add(seededForumThread2);
        await dataContext.SaveChangesAsync();

        var seededForumThread3 = new ForumThread
        {
            UserId = 3,
            Post = "I’m struggling to understand recursion in programming—can someone explain it simply?"
        };
        dataContext.Set<ForumThread>().Add(seededForumThread3);
        await dataContext.SaveChangesAsync();

        var seededForumThread4 = new ForumThread
        {
            UserId = 2,
            Post = "What resources do you recommend for preparing for cybersecurity certifications like Security+?"
        };
        dataContext.Set<ForumThread>().Add(seededForumThread4);
        await dataContext.SaveChangesAsync();

        var seededForumThread5 = new ForumThread
        {
            UserId = 4,
            Post = "How do you stay motivated when working on long-term academic or coding projects?"
        };
        dataContext.Set<ForumThread>().Add(seededForumThread5);
        await dataContext.SaveChangesAsync();

        var seededForumThread6 = new ForumThread
        {
            UserId = 1,
            Post = "Can someone explain database normalization with easy examples?"
        };
        dataContext.Set<ForumThread>().Add(seededForumThread6);
        await dataContext.SaveChangesAsync();

    }
}