
using Models;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using Hubs;
using Microsoft.AspNetCore.SignalR;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();
builder.Services.AddControllers();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<Services.IKorisnikService, Services.KorisnikService>();
builder.Services.AddScoped<Services.IKlubService, Services.KlubService>();
builder.Services.AddCors(options=>
{
    options.AddPolicy("CORS",builder=>
    {
        builder.WithOrigins(new string[] {"http://localhost:3000","https://localhost:3000","http://127.0.0.1:3000","https://127.0.0.1:3000"})
         .AllowCredentials()
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
    
});
var redisConfiguration = builder.Configuration.GetConnectionString("RedisConnection");

if (string.IsNullOrEmpty(redisConfiguration))
{
    throw new InvalidOperationException("Redis connection string is not set in appsettings.json");
}

builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>ConnectionMultiplexer.Connect(redisConfiguration));
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("CORS");
app.UseWebSockets();
app.MapHub<ChatHub>("/ChatHub");
app.UseHttpsRedirection();
app.MapControllers();



app.Run();

