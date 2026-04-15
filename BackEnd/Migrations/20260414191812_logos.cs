using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class logos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DomacinLogo",
                table: "Utakmica",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GostLogo",
                table: "Utakmica",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DomacinLogo",
                table: "Utakmica");

            migrationBuilder.DropColumn(
                name: "GostLogo",
                table: "Utakmica");
        }
    }
}
