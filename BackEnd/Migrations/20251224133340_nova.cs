using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class nova : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Klub",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Naziv = table.Column<string>(type: "text", nullable: false),
                    Sport = table.Column<int>(type: "integer", nullable: false),
                    Trofeji = table.Column<string>(type: "text", nullable: false),
                    Sponzori = table.Column<string>(type: "text", nullable: false),
                    Adresa = table.Column<string>(type: "text", nullable: false),
                    Prihodi = table.Column<string>(type: "text", nullable: false),
                    Rashodi = table.Column<string>(type: "text", nullable: false),
                    LogoURL = table.Column<string>(type: "text", nullable: false),
                    Istorija = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Password = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Klub", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Korisnik",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Ime = table.Column<string>(type: "text", nullable: false),
                    Prezime = table.Column<string>(type: "text", nullable: false),
                    Username = table.Column<string>(type: "text", nullable: false),
                    Lozinka = table.Column<string>(type: "text", nullable: false),
                    Telefon = table.Column<int>(type: "integer", maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Korisnik", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Takmicenje",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Sport = table.Column<int>(type: "integer", nullable: false),
                    Naziv = table.Column<string>(type: "text", nullable: false),
                    LogoURL = table.Column<string>(type: "text", nullable: false),
                    Opis = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Drzava = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Takmicenje", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Igrac",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Ime = table.Column<string>(type: "text", nullable: false),
                    Prezime = table.Column<string>(type: "text", nullable: false),
                    DatumPocetkaUgovora = table.Column<DateOnly>(type: "date", nullable: false),
                    DatumKrajaUgovora = table.Column<DateOnly>(type: "date", nullable: false),
                    Pozicija = table.Column<string>(type: "text", nullable: false),
                    Visina = table.Column<float>(type: "real", nullable: false),
                    Tezina = table.Column<float>(type: "real", nullable: false),
                    DatumRodjenja = table.Column<DateOnly>(type: "date", nullable: false),
                    ListaKlubova = table.Column<string>(type: "text", nullable: false),
                    BrojGodina = table.Column<int>(type: "integer", nullable: false),
                    KlubID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Igrac", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Igrac_Klub_KlubID",
                        column: x => x.KlubID,
                        principalTable: "Klub",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Novosti",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nalsov = table.Column<string>(type: "text", nullable: false),
                    Autor = table.Column<string>(type: "text", nullable: false),
                    Datum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Novost = table.Column<string>(type: "text", nullable: false),
                    KlubID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Novosti", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Novosti_Klub_KlubID",
                        column: x => x.KlubID,
                        principalTable: "Klub",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "KorisnikKlub",
                columns: table => new
                {
                    KorisnikId = table.Column<int>(type: "integer", nullable: false),
                    KlubId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KorisnikKlub", x => new { x.KorisnikId, x.KlubId });
                    table.ForeignKey(
                        name: "FK_KorisnikKlub_Klub_KlubId",
                        column: x => x.KlubId,
                        principalTable: "Klub",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_KorisnikKlub_Korisnik_KorisnikId",
                        column: x => x.KorisnikId,
                        principalTable: "Korisnik",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Kolo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BrojKola = table.Column<int>(type: "integer", nullable: false),
                    PocetakKola = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    KrajKola = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TakmicenjeId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Kolo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Kolo_Takmicenje_TakmicenjeId",
                        column: x => x.TakmicenjeId,
                        principalTable: "Takmicenje",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tabela",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Odigrane = table.Column<int>(type: "integer", nullable: false),
                    Pobede = table.Column<int>(type: "integer", nullable: false),
                    Izgubljene = table.Column<int>(type: "integer", nullable: false),
                    Neresene = table.Column<int>(type: "integer", nullable: false),
                    BrojDatihPoena = table.Column<int>(type: "integer", nullable: false),
                    BrojPrimljenihPoena = table.Column<int>(type: "integer", nullable: false),
                    Razlika = table.Column<int>(type: "integer", nullable: false),
                    BrojBodova = table.Column<int>(type: "integer", nullable: false),
                    Sezona = table.Column<string>(type: "text", nullable: false),
                    TakmicenjeId = table.Column<int>(type: "integer", nullable: false),
                    KlubId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tabela", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tabela_Klub_KlubId",
                        column: x => x.KlubId,
                        principalTable: "Klub",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tabela_Takmicenje_TakmicenjeId",
                        column: x => x.TakmicenjeId,
                        principalTable: "Takmicenje",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UcinakIgraca",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Pogotci = table.Column<int>(type: "integer", nullable: false),
                    Asistencije = table.Column<int>(type: "integer", nullable: false),
                    IndeksKorisnosti = table.Column<int>(type: "integer", nullable: false),
                    OdigraneUtakmice = table.Column<int>(type: "integer", nullable: false),
                    IzgubljeneLopte = table.Column<int>(type: "integer", nullable: false),
                    UkradeneLopte = table.Column<int>(type: "integer", nullable: false),
                    BlokiraniUdarci = table.Column<int>(type: "integer", nullable: false),
                    VraceniPosedi = table.Column<int>(type: "integer", nullable: false),
                    UkupnoDodavanja = table.Column<int>(type: "integer", nullable: false),
                    UkupnoTacnihDodavanja = table.Column<int>(type: "integer", nullable: false),
                    PredjenaDistancaKM = table.Column<int>(type: "integer", nullable: false),
                    Sezona = table.Column<string>(type: "text", nullable: false),
                    TakmicenjeId = table.Column<int>(type: "integer", nullable: false),
                    IgracId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UcinakIgraca", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UcinakIgraca_Igrac_IgracId",
                        column: x => x.IgracId,
                        principalTable: "Igrac",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UcinakIgraca_Takmicenje_TakmicenjeId",
                        column: x => x.TakmicenjeId,
                        principalTable: "Takmicenje",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Utakmica",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Uzivo = table.Column<bool>(type: "boolean", nullable: false),
                    Domacin = table.Column<string>(type: "text", nullable: false),
                    Gost = table.Column<string>(type: "text", nullable: false),
                    Lokacija = table.Column<string>(type: "text", nullable: false),
                    Rezultat = table.Column<string>(type: "text", nullable: false),
                    KoloId = table.Column<int>(type: "integer", nullable: false),
                    StatistikaId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Utakmica", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Utakmica_Kolo_KoloId",
                        column: x => x.KoloId,
                        principalTable: "Kolo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Statistika",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TrenutniMinut = table.Column<int>(type: "integer", nullable: false),
                    UtakmicaId = table.Column<int>(type: "integer", nullable: false),
                    Sport = table.Column<int>(type: "integer", nullable: false),
                    GoloviDomacin = table.Column<int>(type: "integer", nullable: true),
                    GoloviGost = table.Column<int>(type: "integer", nullable: true),
                    SutDomacin = table.Column<int>(type: "integer", nullable: true),
                    SutGost = table.Column<int>(type: "integer", nullable: true),
                    SutKaGolDomacin = table.Column<int>(type: "integer", nullable: true),
                    SutKaGolGost = table.Column<int>(type: "integer", nullable: true),
                    ZutiKartoniDomacin = table.Column<int>(type: "integer", nullable: true),
                    ZutiKartoniGost = table.Column<int>(type: "integer", nullable: true),
                    CrveniKartoniDomacin = table.Column<int>(type: "integer", nullable: true),
                    CrveniKartoniGost = table.Column<int>(type: "integer", nullable: true),
                    PosedDomacin = table.Column<int>(type: "integer", nullable: true),
                    PosedGost = table.Column<int>(type: "integer", nullable: true),
                    PreciznostPasovaDomacin = table.Column<int>(type: "integer", nullable: true),
                    PreciznostPasovaGost = table.Column<int>(type: "integer", nullable: true),
                    PrvaCetDomacin = table.Column<int>(type: "integer", nullable: true),
                    PrvaCetGost = table.Column<int>(type: "integer", nullable: true),
                    DrugaCetDomacin = table.Column<int>(type: "integer", nullable: true),
                    DrugaCetGost = table.Column<int>(type: "integer", nullable: true),
                    TrecaCetDomacin = table.Column<int>(type: "integer", nullable: true),
                    TrecaCetGost = table.Column<int>(type: "integer", nullable: true),
                    CetvCetDomacin = table.Column<int>(type: "integer", nullable: true),
                    CetvCetGost = table.Column<int>(type: "integer", nullable: true),
                    TwoPointDomacin = table.Column<int>(type: "integer", nullable: true),
                    TwoPointGost = table.Column<int>(type: "integer", nullable: true),
                    ThreePointDomacin = table.Column<int>(type: "integer", nullable: true),
                    ThreePointGost = table.Column<int>(type: "integer", nullable: true),
                    FreeThrowDomacin = table.Column<int>(type: "integer", nullable: true),
                    FreeThrowGost = table.Column<int>(type: "integer", nullable: true),
                    ReboundsDomacin = table.Column<int>(type: "integer", nullable: true),
                    ReboundsGost = table.Column<int>(type: "integer", nullable: true),
                    StealsDomacin = table.Column<int>(type: "integer", nullable: true),
                    StealsGost = table.Column<int>(type: "integer", nullable: true),
                    BlocksDomacin = table.Column<int>(type: "integer", nullable: true),
                    BlocksGost = table.Column<int>(type: "integer", nullable: true),
                    VP_PrvaCetDomacin = table.Column<int>(type: "integer", nullable: true),
                    VP_PrvaCetGost = table.Column<int>(type: "integer", nullable: true),
                    VP_DrugaCetDomacin = table.Column<int>(type: "integer", nullable: true),
                    VP_DrugaCetGost = table.Column<int>(type: "integer", nullable: true),
                    VP_TrecaCetDomacin = table.Column<int>(type: "integer", nullable: true),
                    VP_TrecaCetGost = table.Column<int>(type: "integer", nullable: true),
                    VP_CetvCetDomacin = table.Column<int>(type: "integer", nullable: true),
                    VP_CetvCetGost = table.Column<int>(type: "integer", nullable: true),
                    IskljucenjaDomacin = table.Column<int>(type: "integer", nullable: true),
                    IskljucenjaGost = table.Column<int>(type: "integer", nullable: true),
                    PeterciDomacin = table.Column<int>(type: "integer", nullable: true),
                    PeterciGost = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Statistika", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Statistika_Utakmica_UtakmicaId",
                        column: x => x.UtakmicaId,
                        principalTable: "Utakmica",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Igrac_KlubID",
                table: "Igrac",
                column: "KlubID");

            migrationBuilder.CreateIndex(
                name: "IX_Kolo_TakmicenjeId",
                table: "Kolo",
                column: "TakmicenjeId");

            migrationBuilder.CreateIndex(
                name: "IX_KorisnikKlub_KlubId",
                table: "KorisnikKlub",
                column: "KlubId");

            migrationBuilder.CreateIndex(
                name: "IX_Novosti_KlubID",
                table: "Novosti",
                column: "KlubID");

            migrationBuilder.CreateIndex(
                name: "IX_Statistika_UtakmicaId",
                table: "Statistika",
                column: "UtakmicaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tabela_KlubId",
                table: "Tabela",
                column: "KlubId");

            migrationBuilder.CreateIndex(
                name: "IX_Tabela_TakmicenjeId",
                table: "Tabela",
                column: "TakmicenjeId");

            migrationBuilder.CreateIndex(
                name: "IX_UcinakIgraca_IgracId",
                table: "UcinakIgraca",
                column: "IgracId");

            migrationBuilder.CreateIndex(
                name: "IX_UcinakIgraca_TakmicenjeId",
                table: "UcinakIgraca",
                column: "TakmicenjeId");

            migrationBuilder.CreateIndex(
                name: "IX_Utakmica_KoloId",
                table: "Utakmica",
                column: "KoloId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "KorisnikKlub");

            migrationBuilder.DropTable(
                name: "Novosti");

            migrationBuilder.DropTable(
                name: "Statistika");

            migrationBuilder.DropTable(
                name: "Tabela");

            migrationBuilder.DropTable(
                name: "UcinakIgraca");

            migrationBuilder.DropTable(
                name: "Korisnik");

            migrationBuilder.DropTable(
                name: "Utakmica");

            migrationBuilder.DropTable(
                name: "Igrac");

            migrationBuilder.DropTable(
                name: "Kolo");

            migrationBuilder.DropTable(
                name: "Klub");

            migrationBuilder.DropTable(
                name: "Takmicenje");
        }
    }
}
