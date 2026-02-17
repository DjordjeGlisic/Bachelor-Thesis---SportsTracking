using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class dopuna : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Iskljuceja",
                table: "UcinakIgraca",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Skokvi",
                table: "UcinakIgraca",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SkokviDF",
                table: "UcinakIgraca",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SkokviOF",
                table: "UcinakIgraca",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UkupnoFaula",
                table: "UcinakIgraca",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UkupnoSuteva",
                table: "UcinakIgraca",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Iskljuceja",
                table: "UcinakIgraca");

            migrationBuilder.DropColumn(
                name: "Skokvi",
                table: "UcinakIgraca");

            migrationBuilder.DropColumn(
                name: "SkokviDF",
                table: "UcinakIgraca");

            migrationBuilder.DropColumn(
                name: "SkokviOF",
                table: "UcinakIgraca");

            migrationBuilder.DropColumn(
                name: "UkupnoFaula",
                table: "UcinakIgraca");

            migrationBuilder.DropColumn(
                name: "UkupnoSuteva",
                table: "UcinakIgraca");
        }
    }
}
