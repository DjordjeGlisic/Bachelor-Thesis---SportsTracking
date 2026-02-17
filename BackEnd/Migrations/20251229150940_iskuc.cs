using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class iskuc : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CrveniKartoni",
                table: "UcinakIgraca",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ZutiKartoni",
                table: "UcinakIgraca",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CrveniKartoni",
                table: "UcinakIgraca");

            migrationBuilder.DropColumn(
                name: "ZutiKartoni",
                table: "UcinakIgraca");
        }
    }
}
