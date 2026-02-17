using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class novosti : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Novost",
                table: "Novosti",
                newName: "Vest");

            migrationBuilder.RenameColumn(
                name: "Nalsov",
                table: "Novosti",
                newName: "Slika");

            migrationBuilder.AddColumn<int>(
                name: "BrojDislajkova",
                table: "Novosti",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "BrojLajkova",
                table: "Novosti",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Naslov",
                table: "Novosti",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Sazetak",
                table: "Novosti",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BrojDislajkova",
                table: "Novosti");

            migrationBuilder.DropColumn(
                name: "BrojLajkova",
                table: "Novosti");

            migrationBuilder.DropColumn(
                name: "Naslov",
                table: "Novosti");

            migrationBuilder.DropColumn(
                name: "Sazetak",
                table: "Novosti");

            migrationBuilder.RenameColumn(
                name: "Vest",
                table: "Novosti",
                newName: "Novost");

            migrationBuilder.RenameColumn(
                name: "Slika",
                table: "Novosti",
                newName: "Nalsov");
        }
    }
}
