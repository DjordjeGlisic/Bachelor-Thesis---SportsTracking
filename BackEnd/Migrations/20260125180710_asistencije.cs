using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class asistencije : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AsistencijeDomacin",
                table: "Statistika",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AsistencijeGost",
                table: "Statistika",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AsistencijeDomacin",
                table: "Statistika");

            migrationBuilder.DropColumn(
                name: "AsistencijeGost",
                table: "Statistika");
        }
    }
}
