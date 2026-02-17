using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class isku : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SkokviOF",
                table: "UcinakIgraca",
                newName: "SkokoviOF");

            migrationBuilder.RenameColumn(
                name: "SkokviDF",
                table: "UcinakIgraca",
                newName: "SkokoviDF");

            migrationBuilder.RenameColumn(
                name: "Skokvi",
                table: "UcinakIgraca",
                newName: "Skokovi");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SkokoviOF",
                table: "UcinakIgraca",
                newName: "SkokviOF");

            migrationBuilder.RenameColumn(
                name: "SkokoviDF",
                table: "UcinakIgraca",
                newName: "SkokviDF");

            migrationBuilder.RenameColumn(
                name: "Skokovi",
                table: "UcinakIgraca",
                newName: "Skokvi");
        }
    }
}
