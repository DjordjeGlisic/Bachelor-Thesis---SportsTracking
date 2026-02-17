using Microsoft.EntityFrameworkCore;

namespace Models
{

    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Klub> Klubovi { get; set; }
        public DbSet<Korisnik> Korisnici { get; set; }
        public DbSet<Takmicenje> Takmicenja { get; set; }
        public DbSet<Tabela> Tabele { get; set; }
        public DbSet<Ucinak> Ucinci { get; set; }
        public DbSet<Kolo> Kola { get; set; }
        public DbSet<Igrac> Igraci { get; set; }
        public DbSet<Utakmica> Utakmice { get; set; }
        public DbSet<Novosti> Novosti { get; set; }

        public DbSet<Statistika> Statistike { get; set; }
        public DbSet<FudbalStatistika> FudbalStatistike { get; set; }
        public DbSet<KosarkaStatistika> KosarkaStatistike { get; set; }
        public DbSet<VaterpoloStatistika> VaterPoloStatistike { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // MANY-TO-MANY: Korisnik <-> Klub (pracenje klubova)
            modelBuilder.Entity<Korisnik>()
                    .HasMany(k => k.PraceniKlubovi)
                    .WithMany(c => c.Pratioci)
                    .UsingEntity<Dictionary<string, object>>(
                        "KorisnikKlub",
                        j => j
                            .HasOne<Klub>()
                            .WithMany()
                            .HasForeignKey("KlubId")
                            .OnDelete(DeleteBehavior.Cascade),
                        j => j
                            .HasOne<Korisnik>()
                            .WithMany()
                            .HasForeignKey("KorisnikId")
                            .OnDelete(DeleteBehavior.Cascade),
                        j =>
                        {
                            j.HasKey("KorisnikId", "KlubId");
                            j.ToTable("KorisnikKlub");
                        });
            // 1:N Klub -> Novosti
            modelBuilder.Entity<Novosti>()
                .HasOne(n => n.Klub)
                .WithMany(k => k.Novosti)
                .HasForeignKey(n => n.KlubID)
                .OnDelete(DeleteBehavior.Cascade);

            // 1:N Klub -> Igrac
            modelBuilder.Entity<Igrac>()
                .HasOne(i => i.Klub)
                .WithMany(k => k.Igraci)
                .HasForeignKey(i => i.KlubID)
                .OnDelete(DeleteBehavior.Cascade);
            // 1:N Klub -> Tabela (jedan klub ima više redova tabele u raznim takmičenjima)
            modelBuilder.Entity<Tabela>()
                .HasOne(t => t.Klub)
                .WithMany(k => k.Takmicenja)
                .HasForeignKey(t => t.KlubId)
                .OnDelete(DeleteBehavior.Cascade);
            // 1:N Takmicenje -> Tabela
            modelBuilder.Entity<Tabela>()
                .HasOne(t => t.Takmicenje)
                .WithMany(tak => tak.Klubovi)
                .HasForeignKey(t => t.TakmicenjeId)
                .OnDelete(DeleteBehavior.Cascade);
            // 1:N Takmicenje -> Kolo
            modelBuilder.Entity<Kolo>()
                .HasOne(k => k.Takmicenje)
                .WithMany(t => t.Kolа)
                .HasForeignKey(k => k.TakmicenjeId)
                .OnDelete(DeleteBehavior.Cascade);
            // 1:N Takmicenje -> Ucinak
            modelBuilder.Entity<Ucinak>()
                .HasOne(u => u.Takmicenje)
                .WithMany(t => t.Ucinci)
                .HasForeignKey(u => u.TakmicenjeId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Ucinak>()
           .HasOne(u => u.Igrac)
           .WithMany(i => i.Ucinci)
           .HasForeignKey(u => u.IgracId)
           .OnDelete(DeleteBehavior.Cascade);
            // 1:N Kolo -> Utakmica
            modelBuilder.Entity<Utakmica>()
                .HasOne(u => u.Kolo)
                .WithMany(k => k.Utakmice)
                .HasForeignKey(u => u.KoloId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Utakmica>()
          .HasOne(u => u.Statistika)
          .WithOne(s => s.Utakmica)
          .HasForeignKey<Statistika>(s => s.UtakmicaId);
                  modelBuilder.Entity<Statistika>()
                .HasDiscriminator(s => s.Sport)
                .HasValue<FudbalStatistika>(Strukture.SportType.Fudbal)
                .HasValue<KosarkaStatistika>(Strukture.SportType.Kosarka)
                .HasValue<VaterpoloStatistika>(Strukture.SportType.Vaterpolo);
        }
    }
}