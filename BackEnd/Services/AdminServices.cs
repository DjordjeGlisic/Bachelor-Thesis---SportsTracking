using DTO;
using Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;
using Newtonsoft.Json;
using Strukture;
using Microsoft.AspNetCore.SignalR;
using Hubs;
using System.Runtime.Remoting;
using System.Reflection;
using System.Collections.Concurrent;
namespace Services
{
     public class AdminService : IAdminService
    {
        private readonly ApplicationDbContext _context;
        private readonly IDatabase _db;
        private readonly IServer _server;
        private readonly IHubContext<MatchHub> _hubMatchContext;
        private readonly IKlubService _klubService;
        private  readonly ConcurrentDictionary<int, (CancellationTokenSource Cts, Task Task)> _tokens;
        private readonly IServiceScopeFactory _scopeFactory;
        public AdminService(ApplicationDbContext context,IConnectionMultiplexer redis,
        IKlubService klubService, IHubContext<MatchHub> hubMatchContext, IServiceScopeFactory serviceScopeFactory)
        {
            _context = context;
            _db=redis.GetDatabase();
             var endpoint = redis.GetEndPoints().First();
            _server = redis.GetServer(endpoint);
            _tokens =  new ConcurrentDictionary<int, (CancellationTokenSource , Task )>();
            _klubService = klubService;
            _hubMatchContext = hubMatchContext;
            _scopeFactory = serviceScopeFactory;
        }
        public async Task<List<TakmicenjeDTO>> VratiTakmicenjaSporta(int sport)
        {
            SportType sportType = sport == 1 ? SportType.Fudbal : sport == 2 ? SportType.Kosarka : SportType.Vaterpolo;
            var takmicenja =  await _context.Set<Takmicenje>().Where(t => t.Sport ==  sportType).ToListAsync();
            var listaTakmicenja =  new List<TakmicenjeDTO>();
            foreach(var takm in takmicenja)
            {
                var ucicniZaTakmicenje =  await _context.Set<Tabela>().Include(p=>p.Takmicenje).Where(t=> t.Takmicenje == takm)
                    .Select( s => new 
                    {
                        NazivTabele = s.NazivTabele,
                        Sezona = s.Sezona
                    })
                    .Distinct()
                    .Select( x => new UcinakDTO
                    {
                        NazivTabele = x.NazivTabele,
                        Sezona = x.Sezona
                    })
                    .ToListAsync();
                listaTakmicenja.Add(new TakmicenjeDTO
                {
                    Id = takm.Id,
                    NazivTakmicenja = takm.Naziv,
                    ListaUcinaka = ucicniZaTakmicenje
                    
                } );
            }
            return listaTakmicenja;
            
        }
        public async Task<List<PostojeciUcinak>> VratiUcinkeKlubaAsync(int KlubID)
        {
            var postoji = await _context.Set<Klub>().FirstOrDefaultAsync(x => x.Id == KlubID);
            if( postoji == null)
                throw new Exception("Klub ne postoji bazi");
            var ucinci = await _context.Set<Tabela>().Include(p=>p.Klub).Include(p=>p.Takmicenje).Where(p=>p.KlubId==KlubID)
            .Select(x=>new PostojeciUcinak
            {
                IdTakmicenja = x.TakmicenjeId,
                IdUcinka = x.Id,
                NazivTakmicenja = x.Takmicenje.Naziv,
                NazivTabele = x.NazivTabele,
                Sezona = x.Sezona
            }).ToListAsync();
            return ucinci;
        }
        public async  Task<object> DodajMenjajKlubAsync(int KlubID,DodajMenjajKlubDTO klub,SportType sport)
        {
            var postoji = await _context.Set<Klub>().Include(p=>p.Pratioci).Include(p=>p.Takmicenja).ThenInclude(p=>p.Takmicenje).FirstOrDefaultAsync(p=>p.Id==KlubID);
            Klub novi=null;
            if(postoji == null)
            {
                var nijeUnikatan =  await _context.Set<Klub>().Where( x => ( x.Naziv == (string)klub.Naziv && x.Sport == sport  )|| ( x.LogoURL == (string)klub.Logo && x.Sport == sport  )||
                  x.Email == (string)klub.Email ).FirstOrDefaultAsync();
                if(nijeUnikatan != null)
                    throw new Exception("Klub sa tim nazivom, ili logom ili email-om vec postoji u bazi");   
                novi = new Klub
                {
                    Naziv = (string)klub.Naziv,
                    Sport = sport,
                    Trofeji = "",
                    Sponzori = "",
                    Adresa="",
                    Prihodi= "0€",
                    Rashodi = "0€",
                    LogoURL = (string)klub.Logo,
                    Istorija = "",
                    Email= (string)klub.Email,
                    Password = (string)klub.Lozinka,
                    Pratioci= new List<Korisnik>(),
                    Novosti =  new List<Novosti>(),
                    Igraci =  new List<Igrac>(),
                    Takmicenja =  new List<Tabela>()     
                };
                await _context.Set<Klub>().AddAsync(novi);
                await _context.SaveChangesAsync();
                
                
            }
            else
            {
                var naziv = klub.Naziv != null ? (string)klub.Naziv : postoji.Naziv;
                var logo =  klub.Logo != null ? (string)klub.Logo : postoji.LogoURL;
                var email =  klub.Email != null ? (string)klub.Email : postoji.Email;
                var nijeUnikatan = await _context.Set<Klub>().Where(x => (x.Naziv == naziv && x.Sport == postoji.Sport && x.Id != KlubID)
                                                                    || (x.LogoURL == logo && x.Sport == postoji.Sport && x.Id != KlubID)
                                                                    || (x.Email == email && x.Id != KlubID)
                                                                    ).FirstOrDefaultAsync();
                if(nijeUnikatan != null)
                    throw new Exception("Klub koji pokusavate da promenite ne moze da sadrzi naziv, logo ili email drugog kluba!");
                postoji.Naziv =  naziv;
                postoji.LogoURL = logo;
                postoji.Email = email;
                postoji.Password = klub.Lozinka != null ? (string)klub.Lozinka : postoji.Password;

                await _context.SaveChangesAsync();

            }
            if(klub.ListaUcinaka != null && klub.ListaUcinaka.Count > 0 )
            {
                var takmicenjaID = klub.ListaUcinaka.Select(p=>p.IdTakmicenja).Distinct().ToList(); 
                var takmicenja =  await _context.Set<Takmicenje>().Where(x => takmicenjaID.Contains(x.Id)).ToListAsync();
                foreach( var ucinak in klub.ListaUcinaka)
                {
                    var postojiUcinak =  await _context.Set<Tabela>().Include(p=>p.Takmicenje).Include(p=>p.Klub).Where(x => x.TakmicenjeId == ucinak.IdTakmicenja && x.NazivTabele == ucinak.NazivTabele
                        && x.Sezona ==  ucinak.Sezona && KlubID == x.KlubId).FirstOrDefaultAsync();
                    if(postojiUcinak == null )
                    {
                        var tabela =  new Tabela
                        {
                            NazivTabele = ucinak.NazivTabele,
                            Odigrane = 0,
                            Pobede = 0,
                            Izgubljene = 0,
                            Neresene = 0,
                            BrojDatihPoena = 0,
                            BrojPrimljenihPoena = 0,
                            Razlika = 0,
                            BrojBodova = 0,
                            Sezona = ucinak.Sezona,

                        };
                        tabela.Takmicenje = takmicenja.Where(p=>p.Id ==  ucinak.IdTakmicenja).First();
                        tabela.Klub = postoji == null ? novi : postoji;
                        await _context.Set<Tabela>().AddAsync(tabela);
                        await _context.SaveChangesAsync();
                        ucinak.IdUcinka = tabela.Id;
                    } 
                    
                }
                var idUcinaka = klub.ListaUcinaka.Select(p=>p.IdUcinka).ToList();
                if(idUcinaka.Count > 0 && postoji !=  null)
                {
                    var obrisaniUcinci =  postoji.Takmicenja.Where(p=> !idUcinaka.Contains(p.Id)).ToList();
                     _context.Set<Tabela>().RemoveRange(obrisaniUcinci);
                     foreach(var obrisan in obrisaniUcinci)
                        postoji.Takmicenja.Remove(obrisan);
                    
                }
                await _context.SaveChangesAsync();
            }
            if(postoji != null )
            {
                var takicenja = (postoji.Takmicenja != null && postoji.Takmicenja.Count > 0) ?  postoji.Takmicenja.Select(s=>s.Takmicenje.Naziv).ToList(): new List<string>(); 
                return new
                {
                    Id= postoji.Id,
                    Naziv=postoji.Naziv,
                    Logo=postoji.LogoURL,
                    Takicenja= takicenja,
                    Sponzori=postoji.Sponzori,
                    BrojPratioca=postoji.Pratioci.Count,
                    KorisnikPrati=false,
                    Prihodi=postoji.Prihodi,
                    Rashodi=postoji.Rashodi,
                    Istorija=postoji.Istorija,
                    Trofeji=postoji.Trofeji,
                    Adresa=postoji.Adresa,
                    Email=postoji.Email
                    
                };
            }
            else
            {
                var takicenja = (novi.Takmicenja != null && novi.Takmicenja.Count > 0) ?  novi.Takmicenja.Select(s=>s.Takmicenje.Naziv).ToList(): new List<string>();
                return new
                {
                    Id= novi.Id,
                    Naziv=novi.Naziv,
                    Logo=novi.LogoURL,
                    Takicenja=novi.Takmicenja.Select(s=>s.Takmicenje.Naziv).ToList(),
                    Sponzori=novi.Sponzori,
                    BrojPratioca=novi.Pratioci.Count,
                    KorisnikPrati=false,
                    Prihodi=novi.Prihodi,
                    Rashodi=novi.Rashodi,
                    Istorija=novi.Istorija,
                    Trofeji=novi.Trofeji,
                    Adresa=novi.Adresa,
                    Email=novi.Email
                };
            }

        }
        public async Task<int> ObrisiKlubSaZavisnostimaAsync(int KlubID)
        {
            var postoji =  await _context.Set<Klub>()
                                         .Include(x => x.Igraci)
                                         .Include(x =>x.Takmicenja)
                                         .Include( x => x.Novosti)
                                         .Where(x => x.Id == KlubID).FirstOrDefaultAsync();
            if( postoji == null)
                throw new Exception("Klub koji ste prosledili se ne nalazi u bazi!");
            foreach(var igrac in postoji.Igraci)
            {
                igrac.DatumKrajaUgovora = DateOnly.FromDateTime(DateTime.UtcNow);
                igrac.ListaKlubova+=$",{postoji.Naziv}";
                igrac.Klub = null;
                igrac.KlubID = null;
            }
            postoji.Igraci = new List<Igrac>();
            _context.Set<Tabela>().RemoveRange(postoji.Takmicenja);
            foreach(var novost in postoji.Novosti)
            {
                await _klubService.ObrisiPostojecuVestAsync(postoji.Id,novost.Id);
            }
            postoji.Novosti = new List<Novosti>();
            foreach(var korisnik in postoji.Pratioci)
            {
                var sport = postoji.Sport == SportType.Fudbal ? 1 : postoji.Sport == SportType.Kosarka ? 2 : 3;
                string chatKey = $"chat:{korisnik.Id}:{postoji.Id}:{sport}";
                await _db.KeyDeleteAsync(chatKey);
            }
            postoji.Pratioci =  new List<Korisnik>();
            var id = postoji.Id;
            _context.Set<Klub>().Remove(postoji);
            await _context.SaveChangesAsync();
            return id;
        }
        public async Task<List<IgracZaTransferDTO>> VratiIgraceSportaAsync(SportType sport)
        {
            var result = await _context.Set<Igrac>().Include(x => x.Klub).Where(x => x.Sport == sport )
                                                    .Select( x => new IgracZaTransferDTO
                                                    {
                                                        Id = x.Id,
                                                        Ime = x.Ime,
                                                        Prezime = x.Prezime,
                                                        KlubID = x.Klub != null ? x.KlubID : null,
                                                        KlubNaziv = x.Klub != null ? x.Klub.Naziv : null,
                                                        ListaKlubova = x.ListaKlubova,
                                                        BrojGodina = x.BrojGodina,
                                                        DatumPocetkaUgovora = x.DatumPocetkaUgovora,
                                                        DatumKrajaUgovora = x.DatumKrajaUgovora
                                                    })
                                                    .ToListAsync();
            return result;
        }
        public async Task<List<KlubZaIgracaDTO>> VratiKluboveAsync(SportType sport)
        {
            var result =  await _context.Set<Klub>()
                                .Where(x => x.Sport == sport)
                                .Select(x => new KlubZaIgracaDTO
                                {
                                    Id = x.Id,
                                    Naziv = x.Naziv 
                                } )
                                .OrderByDescending(x => x.Naziv)
                                .ToListAsync();
            return result;
        }
        public async Task<IgracZaTransferDTO> IzvrsiTransferIgracaAsync(TransferDTO tranfer)
        {
            var igrac =  await _context.Set<Igrac>().Include(x => x.Klub).FirstOrDefaultAsync(x => x.Id == tranfer.Id);
            if( igrac == null)
                throw new Exception("Igrač nije pronađen u bazi");
            var klub =  await _context.Set<Klub>().FirstOrDefaultAsync(x => x.Id == tranfer.NoviKlubID);
            if( klub == null)
                throw new Exception("Klub nije pronađen u bazi");
            if(igrac.Klub != null)
                igrac.ListaKlubova+=$",{igrac.Klub.Naziv}";
            igrac.Klub = klub;
            igrac.KlubID = klub.Id;
            igrac.DatumPocetkaUgovora = tranfer.DatumPocetka;
            igrac.DatumKrajaUgovora = tranfer.DatumKraja;
            await _context.SaveChangesAsync();
            return new IgracZaTransferDTO
            {
                Id = igrac.Id,
                Ime = igrac.Ime,
                Prezime = igrac.Prezime,
                KlubID = igrac.KlubID,
                KlubNaziv = igrac.Klub.Naziv,
                ListaKlubova = igrac.ListaKlubova,
                BrojGodina = igrac.BrojGodina,
                DatumPocetkaUgovora = igrac.DatumPocetkaUgovora,
                DatumKrajaUgovora = igrac.DatumKrajaUgovora
            };
                
        }
        public async  Task<IgracZaTransferDTO> ProglasiIgracaSlobodnimAsync(int igracID)
        {
              var igrac =  await _context.Set<Igrac>().Include(x => x.Klub).FirstOrDefaultAsync(x => x.Id == igracID);
            if( igrac == null)
                throw new Exception("Igrač nije pronađen u bazi");
            if(igrac.Klub != null)
                igrac.ListaKlubova+=$",{igrac.Klub.Naziv}";
            igrac.Klub = null;
            igrac.KlubID = null;
            igrac.DatumKrajaUgovora =  DateOnly.FromDateTime(DateTime.UtcNow);
            await _context.SaveChangesAsync();
            return new IgracZaTransferDTO
            {
                Id = igrac.Id,
                Ime = igrac.Ime,
                Prezime = igrac.Prezime,
                KlubID = null,
                KlubNaziv = null,
                ListaKlubova = igrac.ListaKlubova,
                BrojGodina = igrac.BrojGodina,
                DatumPocetkaUgovora = igrac.DatumPocetkaUgovora,
                DatumKrajaUgovora = igrac.DatumKrajaUgovora
            };
        }
        public async  Task<List<KlubZaUcinakDTO>> VratiSveKluboveSportaAsync(SportType sport)
        {
            var klubovi = await _context.Set<Klub>().Where(x => x.Sport == sport)
                                .Select(x => new KlubZaUcinakDTO
                                {
                                    Id = x.Id,
                                    Naziv = x.Naziv 
                                } )
                                .OrderByDescending(x => x.Naziv)
                                .ToListAsync();
            return klubovi;
        }
        public async Task<OpsteZaTakmicenjaDTO> DodajTakmicenjeSportuAsync(AddOrEdiTakmicenjeDTO takmicenje)
        {
            var sport = takmicenje.Sport == 1 ? SportType.Fudbal : takmicenje.Sport == 2 ? SportType.Kosarka : SportType.Vaterpolo;
            var postoji  = await  _context.Set<Takmicenje>().Where(x => x.Naziv == takmicenje.Naziv && x.Sport == sport).FirstOrDefaultAsync();
            if(postoji != null)
                throw new Exception("Takmicenje sa tim nazivom vec postoji u bazi!");
            var novoTakmicenje = new Takmicenje
            {
                Sport = sport,
                Naziv = takmicenje.Naziv,
                LogoURL = takmicenje.LogoURL,
                Opis = takmicenje.Opis,
                Drzava = takmicenje.Drzava,

            };
            await _context.Set<Takmicenje>().AddAsync(novoTakmicenje);
            await _context.SaveChangesAsync();
            if(takmicenje.Sekcije.Count > 0)
            {
                foreach(var sekcija in takmicenje.Sekcije)
                {
                    var klubovi =  await _context.Set<Klub>().Include(p=>p.Igraci).Where(x => x.Sport == sport && sekcija.Klubovi.Select(k=>k.Id).Contains(x.Id)).ToListAsync();
                    foreach(var klub in sekcija.Klubovi)
                    {
                        var tabela = new Tabela
                        {
                            NazivTabele = sekcija.NazivTabele,
                            Odigrane = 0,
                            Pobede = 0,
                            Izgubljene = 0,
                            Neresene = 0,
                            BrojDatihPoena = 0,
                            BrojPrimljenihPoena = 0,
                            Razlika = 0,
                            BrojBodova = 0,
                            Sezona = sekcija.Sezona,
                        };
                        var trenutniKlub = klubovi.First(x => x.Id == klub.Id);
                        tabela.Klub = trenutniKlub;
                        tabela.KlubId = klub.Id;
                        tabela.Takmicenje = novoTakmicenje;
                        tabela.TakmicenjeId = novoTakmicenje.Id;
                        await _context.Set<Tabela>().AddAsync(tabela);
                        foreach(var igrac in trenutniKlub.Igraci)
                        {
                            var ucinakIgraca = new Ucinak
                            {
                                Pogotci = 0,
                                UkupnoSuteva = 0,
                                Asistencije = 0,
                                IndeksKorisnosti = 0,
                                OdigraneUtakmice = 0,
                                IzgubljeneLopte = sport == SportType.Fudbal ? null : 0,
                                UkradeneLopte = sport  == SportType.Kosarka ? 0 : null,
                                BlokiraniUdarci = 0,
                                VraceniPosedi = sport == SportType.Kosarka ? null : 0,
                                UkupnoDodavanja = sport == SportType.Fudbal ? 0 : null,
                                UkupnoTacnihDodavanja = sport == SportType.Fudbal ? 0 : null,
                                PredjenaDistancaKM = sport == SportType.Fudbal ? 0 : null,
                                Sezona = sekcija.Sezona,
                                NazivKluba = trenutniKlub.Naziv,
                                Skokovi = sport == SportType.Kosarka ? 0 : null,
                                SkokoviOF = sport == SportType.Kosarka ? 0 : null,
                                SkokoviDF = sport == SportType.Kosarka ? 0 : null,
                                Iskljucenja = sport == SportType.Vaterpolo ? 0 : null,
                                UkupnoFaula = 0,
                                CrveniKartoni = sport == SportType.Fudbal ? 0 : null,
                                ZutiKartoni = sport == SportType.Fudbal ? 0 : null

                            };
                            ucinakIgraca.Takmicenje = novoTakmicenje;
                            ucinakIgraca.TakmicenjeId = novoTakmicenje.Id;
                            ucinakIgraca.Igrac = igrac;
                            ucinakIgraca.IgracId = igrac.Id;
                            await _context.Set<Ucinak>().AddAsync(ucinakIgraca);
                        }
                        await _context.SaveChangesAsync();
                    }
                }
            }
            if(takmicenje.RegularnoBr != null && takmicenje.RegularnoBr > 0)
            {
                 await KreirajKola(novoTakmicenje,KoloType.Regularno,1, (int)takmicenje.RegularnoBr);
            }
            if(takmicenje.RoundOf128Br != null && takmicenje.RoundOf128Br > 0)
            {
                 await KreirajKola(novoTakmicenje,KoloType.RoundOf128,1, (int)takmicenje.RoundOf128Br);
            }
             if(takmicenje.RoundOf64Br != null && takmicenje.RoundOf64Br > 0)
            {
                 await KreirajKola(novoTakmicenje,KoloType.RoundOf64,1,(int)takmicenje.RoundOf64Br);
            }
             if(takmicenje.RoundOf32Br != null && takmicenje.RoundOf32Br > 0)
            {
                  await KreirajKola(novoTakmicenje,KoloType.RoundOf32,1,(int)takmicenje.RoundOf32Br);
            }
             if(takmicenje.RoundOf16Br != null && takmicenje.RoundOf16Br > 0)
            {
                 await KreirajKola(novoTakmicenje,KoloType.RoundOf16,1,(int)takmicenje.RoundOf16Br);
            }
             if(takmicenje.RoundOf8Br != null && takmicenje.RoundOf8Br > 0)
            {
                 await KreirajKola(novoTakmicenje,KoloType.RoundOf8,1,(int)takmicenje.RoundOf8Br);
            }
             if(takmicenje.RoundOf4Br != null && takmicenje.RoundOf4Br > 0)
            {
                 await KreirajKola(novoTakmicenje,KoloType.RoundOf4,1,(int)takmicenje.RoundOf4Br);
            }
             if(takmicenje.RoundOf2Br != null && takmicenje.RoundOf2Br > 0)
            {
                 await KreirajKola(novoTakmicenje,KoloType.RoundOf2,1,(int)takmicenje.RoundOf2Br);
            }
            await _context.SaveChangesAsync();
            return new OpsteZaTakmicenjaDTO
            {
                Id = novoTakmicenje.Id,
                Naziv = novoTakmicenje.Naziv,
                LogoURL = novoTakmicenje.LogoURL,
                Sport = novoTakmicenje.Sport,
                Opis = novoTakmicenje.Opis,
                Drzava = novoTakmicenje.Drzava
            };
            
           
        }
        public async Task<OpsteZaTakmicenjaDTO> ObrisiTakmicenjeAsync(int takmicenjeID)
        {
            var takmicenje =  await _context.Set<Takmicenje>()
            .Include(p=>p.Klubovi).Include(p=>p.Ucinci).Include(p=>p.Kolа)
            .FirstOrDefaultAsync(x => x.Id == takmicenjeID);
            if(takmicenje == null)
                throw new Exception("Takmicenje koje ste prosledili se ne nalazi u bazi!");
            _context.Set<Tabela>().RemoveRange(takmicenje.Klubovi);
            _context.Set<Ucinak>().RemoveRange(takmicenje.Ucinci);
            var statistike = await _context.Set<Statistika>()
            .Include(p=>p.Utakmica)
            .ThenInclude(p=>p.Kolo)
            .Where(x=> x.Utakmica.Kolo.TakmicenjeId == takmicenjeID)
            .ToListAsync();
            var utakmice = statistike.Select(s=>s.Utakmica).Distinct().ToList();
            var kola = utakmice.Select(s=>s.Kolo).Distinct().ToList();
            var keys = _server.Keys(pattern: "poruka:*");
            if(keys==null)
                throw new Exception("Nema chatova u bazi");
            var utakmiceID = utakmice.Select(s=>s.Id).ToList();
            foreach (var key in keys)
            {
                var value = await _db.StringGetAsync(key);

                if (value.IsNullOrEmpty)
                    continue;

                var poruka = JsonConvert.DeserializeObject<Poruka>(value!);

                if (poruka is null)
                    continue;
                if (utakmiceID.Contains(poruka.PrimaocID))
                { 
                    await _db.KeyDeleteAsync(key);
                }
            }
            foreach(var utakmica in utakmice)
            {
                string pattern =  $"stat:{utakmica.Id}:*:{(int)takmicenje.Sport}";
                var keysStat = _server.Keys(pattern: pattern).ToArray();
                foreach(var key in keysStat)
                    await _db.KeyDeleteAsync(key);
            }
             _context.Set<Statistika>().RemoveRange(statistike);
             _context.Set<Utakmica>().RemoveRange(utakmice);
            _context.Set<Kolo>().RemoveRange(takmicenje.Kolа);
            _context.Set<Takmicenje>().Remove(takmicenje);
            await _context.SaveChangesAsync();
            return new OpsteZaTakmicenjaDTO
            {
                Id = takmicenje.Id,
                Naziv = takmicenje.Naziv,
                LogoURL = takmicenje.LogoURL,
                Sport = takmicenje.Sport,
                Opis = takmicenje.Opis,
                Drzava = takmicenje.Drzava
            };
        }
        
        private async Task KreirajKola(Takmicenje takmicenje,KoloType tip,int brojPrvogKola,int brojPoslednjegKola)
        {
            DateTime danas = DateTime.Now;
            int trenutnaGodina = danas.Year;
            int trenutniMesec = danas.Month;
            string Sezona="";
            if (trenutniMesec >= 8)
            {
               Sezona = $"{trenutnaGodina}/{trenutnaGodina + 1}";
            }
            else
            {
                Sezona = $"{trenutnaGodina-1}/{trenutnaGodina}";
            }
            var osnova = takmicenje.Kolа.Where(x => x.TipKola < tip).ToList().Count;
             for(int i = brojPrvogKola; i<=brojPoslednjegKola;i++)
            {
                var kolo = new Kolo
                {
                    BrojKola = i + osnova,
                    PocetakKola = null,
                    KrajKola = null,
                    TipKola = tip,
                    Takmicenje = takmicenje,
                    TakmicenjeId = takmicenje.Id,
                    Sezona  = Sezona,
                    Utakmice = new List<Utakmica>()
                };
                await _context.Set<Kolo>().AddAsync(kolo);
            }
            var ostatkKolaTakmicenja =  takmicenje.Kolа.Where(x => x.TipKola > tip).ToList();
            int brojNovih = brojPoslednjegKola - brojPrvogKola  + 1;
            await AzurirajOstatakKola(ostatkKolaTakmicenja,brojNovih,true);

        }
        private async Task AzurirajOstatakKola(List<Kolo> ostatkKolaTakmicenja,int razlika, bool dodavanje)
        {
            foreach(var kolo in ostatkKolaTakmicenja)
            {
                if(dodavanje)
                {
                    kolo.BrojKola += razlika;
                }
                else
                {
                    kolo.BrojKola -= razlika;
                }
            }
            await _context.SaveChangesAsync();
           
        } 
        private async Task ObrisiKola(Takmicenje takmicenje,KoloType tip,int prvoKoloZaBrisanje, int poslednjeZaBrisanje)
        {
            for(int i = prvoKoloZaBrisanje; i >= poslednjeZaBrisanje; i--)
            {
                      var kolo = await _context.Set<Kolo>().Include(p => p.Takmicenje)
                      .Where( x => x.Takmicenje.Id == takmicenje.Id && x.BrojKola == i).FirstOrDefaultAsync();
                      if(kolo == null)
                        continue;
                      var statistike = await _context.Set<Statistika>()
                        .Include(p=>p.Utakmica)
                        .ThenInclude(p=>p.Kolo)
                        .Where(x=> x.Utakmica.Kolo.Id == kolo.Id)
                        .ToListAsync();
                        var utakmice = statistike.Select(s=>s.Utakmica).Distinct().ToList();
                        var kola = utakmice.Select(s=>s.Kolo).Distinct().ToList();
                        var keys = _server.Keys(pattern: "poruka:*");
                        var utakmiceID = utakmice.Select(s=>s.Id).ToList();
                        foreach (var key in keys)
                        {
                            var value = await _db.StringGetAsync(key);

                            if (value.IsNullOrEmpty)
                                continue;

                            var poruka = JsonConvert.DeserializeObject<Poruka>(value!);

                            if (poruka is null)
                                continue;
                            if (utakmiceID.Contains(poruka.PrimaocID))
                            { 
                                await _db.KeyDeleteAsync(key);
                            }
                        }
                        foreach(var id in utakmiceID)
                        {
                            string patternStat =  $"stat:{id}:*:{(int)takmicenje.Sport}";
                            var keysStat = _server.Keys(pattern: patternStat).ToArray();
                            foreach(var key in keysStat)
                                await _db.KeyDeleteAsync(key);
                        }
                        _context.Set<Statistika>().RemoveRange(statistike);
                        _context.Set<Utakmica>().RemoveRange(utakmice);
                        _context.Set<Kolo>().Remove(kolo);
                         takmicenje.Kolа.Remove(kolo);
            }
            var ostatkKolaTakmicenja =  takmicenje.Kolа.Where(x => x.TipKola > tip).OrderBy(x => x.BrojKola).ToList();
            var brojObrisanih = prvoKoloZaBrisanje - poslednjeZaBrisanje+1;
            await AzurirajOstatakKola(ostatkKolaTakmicenja,brojObrisanih,false);
        }
        public async  Task<AddOrEdiTakmicenjeDTO> VratiTakmicenjeAsync(int takmicenjeID)
        {
            var takmicenje =  await _context.Set<Takmicenje>().Include(p=>p.Kolа).Include(p=>p.Klubovi)
            .ThenInclude(p => p.Klub)
            .FirstOrDefaultAsync(x => x.Id == takmicenjeID);
            if(takmicenje == null)
                throw new Exception("Takmicenje koje ste prosledili se ne nalazi u bazi!");
           var recnikUCinaka = takmicenje.Klubovi
                .GroupBy(g => new { g.NazivTabele, g.Sezona }) // Prvo grupišeš
                .ToDictionary(
                    g => g.Key,
                    g => g.ToList()     
                );
            var sekcije =  new List<SekcijaDTO>();
            foreach(var key in recnikUCinaka.Keys)
            {
                var sekcija =  new SekcijaDTO
                {
                    NazivTabele = key.NazivTabele,
                    Sezona = key.Sezona
                };
                var kluboviSekcije =  new List<KlubZaUcinakDTO>();
                foreach(var ucinak in recnikUCinaka[key])
                {
                    var klub = new KlubZaUcinakDTO
                    {
                        Id = ucinak.Klub.Id,
                        Naziv = ucinak.Klub.Naziv
                    };
                    kluboviSekcije.Add(klub);
                }
                sekcija.Klubovi = kluboviSekcije;
                sekcije.Add(sekcija);
                
            } 
            var kola =  await _context.Set<Kolo>().Include(p=> p.Takmicenje)
            .Where(p => p.Takmicenje.Id == takmicenjeID).ToListAsync();
            var RegularnoBr = kola.Where(x => x.TipKola == KoloType.Regularno).ToList().Count;
            var RoundOf128Br = kola.Where(x => x.TipKola == KoloType.RoundOf128).ToList().Count;
            var RoundOf64Br = kola.Where(x => x.TipKola == KoloType.RoundOf64).ToList().Count;
            var RoundOf32Br = kola.Where(x => x.TipKola == KoloType.RoundOf32).ToList().Count;
            var RoundOf16Br = kola.Where(x => x.TipKola == KoloType.RoundOf16).ToList().Count;
            var RoundOf8Br = kola.Where(x => x.TipKola == KoloType.RoundOf8).ToList().Count;
            var RoundOf4Br = kola.Where(x => x.TipKola == KoloType.RoundOf4).ToList().Count;
            var RoundOf2Br = kola.Where(x => x.TipKola == KoloType.RoundOf2).ToList().Count;

            return new AddOrEdiTakmicenjeDTO
            { 
                Naziv = takmicenje.Naziv,
                LogoURL = takmicenje.LogoURL,
                Sport = (int)takmicenje.Sport,
                Opis = takmicenje.Opis,
                Drzava = takmicenje.Drzava,
                Sekcije = sekcije,
                RegularnoBr = (int?)RegularnoBr,
                RoundOf128Br = (int?)RoundOf128Br,
                RoundOf64Br = (int?)RoundOf64Br,
                RoundOf32Br = (int?)RoundOf32Br,
                RoundOf16Br = (int?)RoundOf16Br,
                RoundOf8Br = (int?)RoundOf8Br,
                RoundOf4Br = (int?)RoundOf4Br,
                RoundOf2Br = (int?)RoundOf2Br,
            };
        }
        public async Task<OpsteZaTakmicenjaDTO> IzmeniPostojeceTakmicenjeAsync(int takmicenjeID,AddOrEdiTakmicenjeDTO takmicenje)
        {
            var postoji = await _context.Set<Takmicenje>().Include(p=>p.Klubovi).ThenInclude(p=>p.Klub)
            .Include(p=>p.Kolа).Where(x => x.Id == takmicenjeID)
            .FirstOrDefaultAsync();
            if(postoji == null)
                throw new Exception("Takmicenje koje ste prosledili nije zapamceno u bazi");
            postoji.Naziv = takmicenje.Naziv;
            postoji.LogoURL = takmicenje.LogoURL;
            postoji.Drzava = takmicenje.Drzava;
            postoji.Opis = takmicenje.Opis;
            var ucinci = new List<TabelaDTO>();
            foreach(var sekcija in takmicenje.Sekcije)
            {
                foreach(var klub in sekcija.Klubovi)
                {
                    var ucinak =  new TabelaDTO
                    {
                        Naziv = sekcija.NazivTabele,
                        Sezona = sekcija.Sezona,
                        KlubID = klub.Id
                    };
                    ucinci.Add(ucinak);
                }
            }
            var postojeciUcinci = postoji.Klubovi.Select(x => new TabelaDTO
            {
                Naziv = x.NazivTabele,
                Sezona = x.Sezona,
                KlubID = x.Klub.Id
            }).ToList();
            var ucinciZaBrisanje = postojeciUcinci
                .Where(p => !ucinci.Any(u => 
                    u.KlubID == p.KlubID && 
                    u.Naziv == p.Naziv && 
                    u.Sezona == p.Sezona))
                .ToList();
            foreach (var ucinakDto in ucinciZaBrisanje)
            {
                // Pronalazimo originalni entitet u bazi koji se poklapa sa DTO-om
                var entitetZaBrisanje = _context.Set<Tabela>().FirstOrDefault(x => 
                    x.KlubId == ucinakDto.KlubID && 
                    x.NazivTabele == ucinakDto.Naziv && 
                    x.Sezona == ucinakDto.Sezona);

                if (entitetZaBrisanje != null)
                {
                    _context.Set<Tabela>().Remove(entitetZaBrisanje);
                }
            } 
             var ucinciZaDodavanje = ucinci
                .Where(p => !postojeciUcinci.Any(u => 
                    u.KlubID == p.KlubID && 
                    u.Naziv == p.Naziv && 
                    u.Sezona == p.Sezona))
                .ToList(); 
            foreach (var ucinakDto in ucinciZaDodavanje)
            {
                var klub = await _context.Set<Klub>().FirstOrDefaultAsync(x => x.Id == ucinakDto.KlubID);
                var entitetZaDodavanje = new Tabela
                {
                    NazivTabele = ucinakDto.Naziv,
                    Sezona = ucinakDto.Sezona,
                    Odigrane = 0,
                    Pobede = 0,
                    Izgubljene = 0,
                    Neresene = 0,
                    BrojDatihPoena = 0,
                    BrojPrimljenihPoena = 0,
                    Razlika = 0,
                    BrojBodova = 0,
                    Takmicenje = postoji,
                    TakmicenjeId = takmicenjeID,
                    Klub = klub,
                    KlubId = ucinakDto.KlubID
                };
                _context.Set<Tabela>().Add(entitetZaDodavanje);
            } 
            await _context.SaveChangesAsync();
            var kola = postoji.Kolа.ToList();
            var brojRegularnih = kola.Where(x=> x.TipKola == KoloType.Regularno).ToList().Count;
            var broj128 = kola.Where(x=> x.TipKola == KoloType.RoundOf128).ToList().Count;
            var broj64 = kola.Where(x=> x.TipKola == KoloType.RoundOf64).ToList().Count;
            var broj32 = kola.Where(x=> x.TipKola == KoloType.RoundOf32).ToList().Count;
            var broj16 = kola.Where(x=> x.TipKola == KoloType.RoundOf16).ToList().Count;
            var broj8 = kola.Where(x=> x.TipKola == KoloType.RoundOf8).ToList().Count;
            var broj4 = kola.Where(x=> x.TipKola == KoloType.RoundOf4).ToList().Count;
            var broj2 = kola.Where(x=> x.TipKola == KoloType.RoundOf2).ToList().Count;
            if(takmicenje.RegularnoBr != brojRegularnih)
            {
                await DodajBrisiKolaZaTakmicenjeAsync((int)takmicenje.RegularnoBr,KoloType.Regularno,postoji);
                await _context.SaveChangesAsync();
            }
            if(takmicenje.RoundOf128Br != broj128)
            {
                await DodajBrisiKolaZaTakmicenjeAsync((int)takmicenje.RoundOf128Br,KoloType.RoundOf128,postoji);
                await _context.SaveChangesAsync();
            }
            if(takmicenje.RoundOf64Br != broj64)
            {
                await DodajBrisiKolaZaTakmicenjeAsync((int)takmicenje.RoundOf64Br,KoloType.RoundOf64,postoji);
                await _context.SaveChangesAsync();
            }
            if(takmicenje.RoundOf32Br != broj32)
            {
                  await DodajBrisiKolaZaTakmicenjeAsync((int)takmicenje.RoundOf32Br,KoloType.RoundOf32,postoji);
                  await _context.SaveChangesAsync();
            }
            if(takmicenje.RoundOf16Br != broj16)
            {
                  await DodajBrisiKolaZaTakmicenjeAsync((int)takmicenje.RoundOf16Br,KoloType.RoundOf16,postoji);
                  await _context.SaveChangesAsync();
            }
            if(takmicenje.RoundOf8Br != broj8)
            {
                await DodajBrisiKolaZaTakmicenjeAsync((int)takmicenje.RoundOf8Br,KoloType.RoundOf8,postoji);
                await _context.SaveChangesAsync();
            }
            if(takmicenje.RoundOf4Br != broj4)
            {
                await DodajBrisiKolaZaTakmicenjeAsync((int)takmicenje.RoundOf4Br,KoloType.RoundOf4,postoji);
                await _context.SaveChangesAsync();
            }
            if(takmicenje.RoundOf2Br != broj2)
            {
                await DodajBrisiKolaZaTakmicenjeAsync((int)takmicenje.RoundOf2Br,KoloType.RoundOf2,postoji);
                await _context.SaveChangesAsync();
            }
            return new OpsteZaTakmicenjaDTO
            {
                Id = postoji.Id,
                Naziv = postoji.Naziv,
                LogoURL = postoji.LogoURL,
                Sport = postoji.Sport,
                Opis = postoji.Opis,
                Drzava = postoji.Drzava
            };
        }
        private async Task  DodajBrisiKolaZaTakmicenjeAsync(int noviBrojKolaTogTipa,KoloType tip,Takmicenje takmicenje)
        {
            var kolaTakmicenja =  await _context.Set<Kolo>().Include( x => x.Takmicenje )
                                 .Where(x => x.Takmicenje.Id == takmicenje.Id )
                                 .ToListAsync();
            var nakonOvogKolaIduKolaTipa = VratiPoslednjiBrojKolaDoTrenutnogTipa(kolaTakmicenja,tip);
            var trenutniBrojKolaTogTipa = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,tip).Count();
            bool dodajuSeKola = noviBrojKolaTogTipa > trenutniBrojKolaTogTipa;
            if(dodajuSeKola)
            {
                int startBroj = nakonOvogKolaIduKolaTipa + trenutniBrojKolaTogTipa + 1;
                int krajBroj = nakonOvogKolaIduKolaTipa + noviBrojKolaTogTipa;
                await KreirajKola(takmicenje,tip,startBroj,krajBroj);
                
            }
            else
            {
                int starBroj = nakonOvogKolaIduKolaTipa+trenutniBrojKolaTogTipa;
                int krajBroj = nakonOvogKolaIduKolaTipa+noviBrojKolaTogTipa+1;
                await ObrisiKola(takmicenje,tip,starBroj,krajBroj);
            }
        }
        private List<Kolo> VratiSvaKolaProsledjenogTipa(List<Kolo> kolaTakmicenja, KoloType tip)
        {
            return kolaTakmicenja.Where( x => x.TipKola == tip )
                                           .OrderBy(x => x.BrojKola)
                                           .ToList();
        }
        private int  VratiPoslednjiBrojKolaDoTrenutnogTipa(List<Kolo> kolaTakmicenja,KoloType trnuntiTip)
        {
            int reg,br128,br64,br32,br16,br8,br4,br2 = 0;
            switch(trnuntiTip)
            {
                case KoloType.RoundOf128:
                    return VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.Regularno).Count();
                case KoloType.RoundOf64:
                     reg = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.Regularno).Count();
                     br128 = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.RoundOf128).Count();
                    return reg+br128;
                case KoloType.RoundOf32:
                     reg = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.Regularno).Count();
                     br128 = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.RoundOf128).Count();
                     br64 = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.RoundOf64).Count();
                    return reg+br128+br64;
                case KoloType.RoundOf16:
                     reg = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.Regularno).Count();
                     br128 = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.RoundOf128).Count();
                     br64 = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.RoundOf64).Count();
                     br32 = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.RoundOf32).Count();
                    return reg+br128+br64+br32;
                case KoloType.RoundOf8:
                    reg = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.Regularno).Count();
                    br128 = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.RoundOf128).Count();
                    br64 = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.RoundOf64).Count();
                    br32 = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.RoundOf32).Count();
                    br16 = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.RoundOf16).Count();
                return reg+br128+br64+br32+br16;
                case KoloType.RoundOf4:
                    reg = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.Regularno).Count();
                    br128 = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.RoundOf128).Count();
                    br64 = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.RoundOf64).Count();
                    br32 = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.RoundOf32).Count();
                    br16 = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.RoundOf16).Count();
                    br8 = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.RoundOf8).Count();
                return reg+br128+br64+br32+br16+br8;
                case KoloType.RoundOf2:
                    reg = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.Regularno).Count();
                    br128 = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.RoundOf128).Count();
                    br64 = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.RoundOf64).Count();
                    br32 = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.RoundOf32).Count();
                    br16 = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.RoundOf16).Count();
                    br8 = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.RoundOf8).Count();
                    br4 = VratiSvaKolaProsledjenogTipa(kolaTakmicenja,KoloType.RoundOf4).Count();
                return reg+br128+br64+br32+br16+br8+br4;
                default:
                    return 0;
                
            }
        }
        public async Task<List<KlubZaUcinakDTO>> VratiPotencijalneKluboveNoveUtakmiceAsync(int takmicenjeID,int brojKola)
        {
            var postojiTakmicenje = await _context.Set<Takmicenje>().Include(x => x.Kolа).ThenInclude(x => x.Utakmice).ThenInclude(x => x.Statistika)
            .Where(x => x.Id == takmicenjeID)
            .FirstOrDefaultAsync();
            if(postojiTakmicenje == null)
                throw new Exception("Uneto takmicenje vise se ne nalazi u bazi");
            var kolaTakmicenja = postojiTakmicenje.Kolа.Select(x => x.BrojKola).ToList();
            if(!kolaTakmicenja.Contains(brojKola))
                throw new Exception("Kolo sa unetim brojem ne postoji za takmicenje");
            var klubovi = new List<KlubZaUcinakDTO>();
            var izabranoKolo = postojiTakmicenje.Kolа.Where(x => x.BrojKola == brojKola).First();
            var utakmiceZaKolo = izabranoKolo.Utakmice;
            foreach(var utakmica in utakmiceZaKolo)
            {
                var domacin = await _context.Set<Klub>()
                .Where(x => x.Naziv == utakmica.Domacin && x.Sport == utakmica.Statistika.Sport)
                .Select(x => new KlubZaUcinakDTO
                {
                    Id = x.Id,
                    Naziv = x.Naziv
                })
                .FirstOrDefaultAsync();
                if(domacin!=null && !klubovi.Any(x=> x.Id == domacin.Id))
                {
                    klubovi.Add(domacin);
                }
                 var gost = await _context.Set<Klub>()
                .Where(x => x.Naziv == utakmica.Gost && x.Sport == utakmica.Statistika.Sport)
                .Select(x => new KlubZaUcinakDTO
                {
                    Id = x.Id,
                    Naziv = x.Naziv
                })
                .FirstOrDefaultAsync();
                if(gost!=null && !klubovi.Any(x=> x.Id == gost.Id))
                {
                    klubovi.Add(gost);
                }
            }
            var sezona = VratiTrenutnuSezonu();
            var kluboviIds = klubovi.Select(x => x.Id).ToList();
            var slobodniKluboviZaKolo = await _context.Set<Tabela>()
            .Include(x => x.Klub)
            .Include(x => x.Takmicenje)
            .Where(x=> x.Sezona == sezona && x.Takmicenje.Id == takmicenjeID && !kluboviIds.Contains(x.Klub.Id))
            .Select(x => new KlubZaUcinakDTO
            {
                Id = x.Klub.Id,
                Naziv = x.Klub.Naziv
            })
            .ToListAsync();
            return slobodniKluboviZaKolo;
        }
        private string VratiTrenutnuSezonu()
        {
             DateTime danas = DateTime.Now;
            int trenutnaGodina = danas.Year;
            int trenutniMesec = danas.Month;
            string Sezona="";
            if (trenutniMesec >= 8)
            {
               return  $"{trenutnaGodina}/{trenutnaGodina + 1}";
            }
            return $"{trenutnaGodina-1}/{trenutnaGodina}";
        }
        public async  Task<NovaUtakmicaDTO> DodajNovuUtakmicuTakmicenju(DodavanjeUtakmiceDTO novaUtakmica)
        {
            var takmicenje =  await _context.Set<Takmicenje>()
            .Where(x => x.Id == novaUtakmica.TakmicenjeID)
            .FirstOrDefaultAsync();
            if(takmicenje == null)
                throw new Exception($"Prosledjeno takmicenje {novaUtakmica.TakmicenjeNaziv} ne postoji u bazi");
            var kolo = await _context.Set<Kolo>().Include(x=> x.Takmicenje)
            .Where(x => x.BrojKola == novaUtakmica.BrojKola && x.Takmicenje.Id == novaUtakmica.TakmicenjeID)
            .FirstOrDefaultAsync();
            if(kolo == null)
                throw new Exception("Zadatko kolo takmicenja ne postoji u bazi");
            var fixedDatum = DateTime.SpecifyKind(novaUtakmica.Datum, DateTimeKind.Utc);
            if(kolo.PocetakKola == null || kolo.PocetakKola > fixedDatum)
                kolo.PocetakKola =fixedDatum;
            if(kolo.KrajKola == null || kolo.KrajKola < fixedDatum)
                kolo.KrajKola = fixedDatum;
            var  sport = novaUtakmica.Sport == 1 ? SportType.Fudbal : novaUtakmica.Sport == 2 ? SportType.Kosarka : SportType.Vaterpolo;
            var klubovi = await _context.Set<Klub>()
            .Where(x => x.Sport == sport && (x.Naziv == novaUtakmica.Domacin || x.Naziv == novaUtakmica.Gost ))
            .ToListAsync();
            if(klubovi.Count != 2)
                throw new Exception("Domacin ili gost nisu pronadjeni");
            var utakmica = new Utakmica
            {
                Uzivo = false,
                Domacin = novaUtakmica.Domacin,
                DomacinLogo = klubovi.Where(x => x.Naziv == novaUtakmica.Domacin).Select(x => x.LogoURL).First(),
                GostLogo = klubovi.Where(x => x.Naziv == novaUtakmica.Gost).Select(x => x.LogoURL).First(),
                Gost = novaUtakmica.Gost,
                Lokacija = novaUtakmica.Lokacija,
                DatumPocetkaUtakmice = fixedDatum,
                Rezultat =  "0:0",
                Status = "PREDSTOJI"
            };
            utakmica.Kolo = kolo;
            utakmica.KoloId = kolo.Id;
            Statistika statistika;
        
            switch(sport)
            {
                case SportType.Fudbal:
                    statistika = new FudbalStatistika()
                    {
                        TrenutniMinut = 0,
                        AsistencijeDomacin = 0,
                        AsistencijeGost = 0,
                        ListaStrelaca = "Dom,Gos",
                        GoloviDomacin = 0,
                        GoloviGost = 0,
                        SutDomacin = 0,
                        SutGost = 0,
                        SutKaGolDomacin = 0,
                        SutKaGolGost = 0,
                        ZutiKartoniDomacin = 0,
                        ZutiKartoniGost = 0,
                        CrveniKartoniDomacin = 0,
                        CrveniKartoniGost  = 0,
                        PosedDomacin = 50,
                        PosedGost = 50,
                        PreciznostPasovaDomacin = 0,
                        PreciznostPasovaGost  = 0
                    };
                break;
                case SportType.Kosarka:
                    statistika = new KosarkaStatistika()
                    {
                        TrenutniMinut = 0,
                        AsistencijeDomacin = 0,
                        AsistencijeGost = 0,
                        ListaStrelaca = null,
                        PrvaCetDomacin = 0,
                        PrvaCetGost = 0,
                        DrugaCetDomacin = 0,
                        DrugaCetGost = 0,
                        TrecaCetDomacin = 0,
                        TrecaCetGost = 0,
                        CetvCetDomacin = 0,
                        CetvCetGost = 0,
                        TwoPointDomacin = 0,
                        TwoPointGost = 0,
                        ThreePointDomacin = 0,
                        ThreePointGost = 0,
                        FreeThrowDomacin = 0,
                        FreeThrowGost = 0,
                        ReboundsDomacin = 0,
                        ReboundsGost = 0,
                        StealsDomacin = 0,
                        StealsGost = 0,
                        BlocksDomacin = 0,
                        BlocksGost = 0,
                    };
                break;
                default:
                    statistika = new VaterpoloStatistika()
                    {
                        TrenutniMinut = 0,
                        AsistencijeDomacin = 0,
                        AsistencijeGost = 0,
                        ListaStrelaca = null,
                        VP_PrvaCetDomacin = 0,
                        VP_PrvaCetGost = 0,
                        VP_DrugaCetDomacin = 0,
                        VP_DrugaCetGost = 0,
                        VP_TrecaCetDomacin = 0,
                        VP_TrecaCetGost = 0,
                        VP_CetvCetDomacin = 0,
                        VP_CetvCetGost = 0,
                        IskljucenjaDomacin = 0,
                        IskljucenjaGost = 0,
                        PeterciDomacin = 0,
                        PeterciGost = 0,
                    };
                break;
            }
            _context.Set<Utakmica>().Add(utakmica);
            await _context.SaveChangesAsync();
            statistika.Utakmica = utakmica;
            statistika.UtakmicaId = utakmica.Id;
            _context.Set<Statistika>().Add(statistika);
            await _context.SaveChangesAsync();
            return new NovaUtakmicaDTO
            {
                Id = utakmica.Id,
                Domacin = utakmica.Domacin,
                DomacinLogo = utakmica.DomacinLogo,
                GostLogo = utakmica.GostLogo,
                Gost = utakmica.Gost,
                Datum = utakmica.DatumPocetkaUtakmice,
                Uzivo = utakmica.Uzivo,
                Rezultat = utakmica.Rezultat,
                Vreme = utakmica.Statistika.TrenutniMinut,
                ListaStrelaca = utakmica.Statistika.ListaStrelaca,
                Lokacija = utakmica.Lokacija
            };
        }
        public async Task<int> ObrisiUtakmicuKolaAsync(int utakmicaID)
        {
            var utakmica = await _context.Set<Utakmica>().Include(x => x.Statistika)
            .FirstOrDefaultAsync(x => x.Id == utakmicaID);
            if(utakmica == null)
                throw new Exception("Utakmica koju pokusavate da brisate ne postoji u bazi");
            var sezona = VratiTrenutnuSezonu();
            var domacin = await _context.Set<Tabela>().Include(x => x.Klub)
            .Where(x => x.Klub.Sport == utakmica.Statistika.Sport && x.Klub.Naziv == utakmica.Domacin
             && x.Sezona == sezona).FirstOrDefaultAsync();
             var gost = await _context.Set<Tabela>().Include(x => x.Klub)
            .Where(x => x.Klub.Sport == utakmica.Statistika.Sport && x.Klub.Naziv == utakmica.Gost
             && x.Sezona == sezona).FirstOrDefaultAsync();
             string[] delovi = utakmica.Rezultat.Split(':');
            int poeniDomacin = int.Parse(delovi[0].Trim());
            int poeniGost = int.Parse(delovi[1].Trim());
            var statistikaVaterPolo = await _context.Set<VaterpoloStatistika>()
            .Where(x => x.Id == utakmica.StatistikaId)
            .FirstOrDefaultAsync();
            if(domacin != null && utakmica.Uzivo == false && utakmica.DatumPocetkaUtakmice < DateTime.UtcNow)
            {
                domacin.Odigrane -= 1;
                if(poeniDomacin > poeniGost )
                {
                    domacin.Pobede-=1;
                    domacin.BrojBodova -= utakmica.Statistika.Sport == SportType.Kosarka ? 2 : 3;
                    if(statistikaVaterPolo != null && statistikaVaterPolo.IgraniPeterci == true)
                    {
                        domacin.BrojBodova -= 3;
                        domacin.BrojBodova +=2;
                    }  

                }
                else if(poeniDomacin < poeniGost)
                {
                    domacin.Izgubljene-=1;
                    domacin.BrojBodova -= utakmica.Statistika.Sport == SportType.Kosarka ? 1 : 0;
                    if(statistikaVaterPolo != null && statistikaVaterPolo.IgraniPeterci == true)
                    {
                        domacin.BrojBodova -=1;
                    } 
                }
                else if(utakmica.Statistika.Sport == SportType.Fudbal)
                    domacin.Neresene -= 1;
                domacin.BrojDatihPoena -= poeniDomacin;
                domacin.BrojPrimljenihPoena -= poeniGost;
                domacin.Razlika -= (domacin.BrojDatihPoena- domacin.BrojPrimljenihPoena);
            }
            if(gost != null && utakmica.Uzivo == false && utakmica.DatumPocetkaUtakmice < DateTime.UtcNow)
            {
                gost.Odigrane -= 1;
                if(poeniDomacin < poeniGost )
                {
                    gost.Pobede-=1;
                    gost.BrojBodova -= utakmica.Statistika.Sport == SportType.Kosarka ? 2 : 3;
                    if(statistikaVaterPolo != null && statistikaVaterPolo.IgraniPeterci == true)
                    {
                        gost.BrojBodova -= 3;
                        gost.BrojBodova +=2;
                    }  
                }
                else if(poeniDomacin > poeniGost)
                {
                    gost.Izgubljene-=1;
                    gost.BrojBodova -= utakmica.Statistika.Sport == SportType.Kosarka ? 1 : 0;
                    if(statistikaVaterPolo != null && statistikaVaterPolo.IgraniPeterci == true)
                    {
                        gost.BrojBodova -=1;
                    }
                    
                }
                else if(utakmica.Statistika.Sport == SportType.Fudbal)
                    gost.Neresene -= 1;
                gost.BrojDatihPoena -= poeniDomacin;
                gost.BrojPrimljenihPoena -= poeniGost;
                gost.Razlika -= (gost.BrojDatihPoena- gost.BrojPrimljenihPoena);
            }               
            string pattern =  $"stat:{utakmicaID}:*:{(int)utakmica.Statistika.Sport}";
            var keys = _server.Keys(pattern: pattern).ToArray();
            foreach(var key in keys)
                await _db.KeyDeleteAsync(key);
            _context.Set<Statistika>().Remove(utakmica.Statistika);
            _context.Set<Utakmica>().Remove(utakmica);
            await _context.SaveChangesAsync();


            return utakmicaID;
        }
        public async Task AzurirajStatistikuIgracuNaUtakmiciAsync(int utakmicaID,SportType sport,IgracUcinakDTO parametri)
        {
            var utakmica = await _context.Set<Utakmica>().Include(x => x.Kolo).ThenInclude(x => x.Takmicenje)
            .Where(x => x.Id == utakmicaID).FirstOrDefaultAsync();
            var igrac = await _context.Set<Igrac>().FirstOrDefaultAsync(x => x.Id == parametri.IgracID);
            if(utakmica == null)
                throw new Exception("Utakmica koju ste prosledili ne postoji vise u bazi");
             if(igrac == null)
                throw new Exception("Igraca kojeg ste prosledili ne postoji vise u bazi");
            if(parametri.Klub == "domacin")
                parametri.Klub = utakmica.Domacin;
            else
                parametri.Klub = utakmica.Gost;
            string statKey = $"stat:{utakmicaID}:{parametri.Klub}:{(int)sport}";
            var rezultatiRaw = await _db.ListRangeAsync(statKey, 0, -1);
            var ucinakIgraca = rezultatiRaw
                .Select(item => item.HasValue ? JsonConvert.DeserializeObject<UcinakIgracaNaUtakmici>(item.ToString()!) : null)
                .Where(x => x != null && x.IgracId == parametri.IgracID)
                .Cast<UcinakIgracaNaUtakmici>()
                .FirstOrDefault();
            if(ucinakIgraca == null)
                throw new Exception("Nije pronadjena statistika za prosledjenog igraca");
            PropertyInfo prop = typeof(UcinakIgracaNaUtakmici).GetProperty(parametri.Parametar, 
                BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
            if(prop == null)
                throw new Exception("Nevalidno polje ste prosledidli za azurianje");
            var vrednost = prop.GetValue(ucinakIgraca);
            var parsedVrednost = Convert.ToInt32(vrednost);
            if(parametri.Parametar == "zutiKartoni")
            {
                ucinakIgraca.ZutiKartoni = parametri.Promena == "dodaj" ? true : false;
                ucinakIgraca.UkupnoFaula = parametri.Promena == "dodaj" ?  ucinakIgraca.UkupnoFaula+1 :  ucinakIgraca.UkupnoFaula -1;
            }
            else if(parametri.Parametar == "crveniKartoni")
            {
                ucinakIgraca.CrveniKartoni = parametri.Promena == "dodaj" ? true : false;
                ucinakIgraca.UkupnoFaula = parametri.Promena == "dodaj" ?  ucinakIgraca.UkupnoFaula+1 :  ucinakIgraca.UkupnoFaula -1;
            }
            else
            {
                switch(parametri.Promena)
                {
                    case "dodaj":
                    prop.SetValue(ucinakIgraca,parsedVrednost+1);
                    break;
                    case "oduzmi":
                    if(parsedVrednost > 0)
                        prop.SetValue(ucinakIgraca,parsedVrednost -1 );
                    break;
                    default:
                    var igraUtakmicu = prop.GetValue(ucinakIgraca);
                    var booleanVrednost = Convert.ToBoolean(igraUtakmicu);
                    prop.SetValue(ucinakIgraca,!booleanVrednost);
                    break;
                }
                if(parametri.Parametar ==  "skokoviOF" || parametri.Parametar == "skokoviDF")
                {
                    if(parametri.Promena == "dodaj")
                    {
                        ucinakIgraca.Skokovi +=1; 
                    }
                    else
                    {
                        ucinakIgraca.Skokovi -= 1;
                    }
                }
                
            }
            RacunajIndeks(ucinakIgraca,sport);
            int index = -1;
            UcinakIgracaNaUtakmici azuriranUcinak = null;
            for (int i = 0; i < rezultatiRaw.Length; i++)
            {
                var obj = JsonConvert.DeserializeObject<UcinakIgracaNaUtakmici>(rezultatiRaw[i]!);
                if (obj != null && obj.IgracId == parametri.IgracID)
                {
                    index = i;
                    azuriranUcinak = ucinakIgraca;
                    break;
                }
            }
            if(azuriranUcinak != null && index > -1)
            {
                string jsonUpdate = JsonConvert.SerializeObject(azuriranUcinak);
                await _db.ListSetByIndexAsync(statKey, index, jsonUpdate);
                await _hubMatchContext.Clients.All.SendAsync($"PromenjenUcinakIgracuNaUtakmici{utakmicaID}",azuriranUcinak);
            }
            var trenutnaSezona = VratiTrenutnuSezonu();
            var ucinakIgracaZaTakmicenje = await _context.Set<Ucinak>().Include(x => x.Igrac).Include(x => x.Takmicenje)
            .Where(x => x.IgracId == parametri.IgracID && x.TakmicenjeId == utakmica.Kolo.TakmicenjeId && x.Sezona == trenutnaSezona).FirstOrDefaultAsync();
            if(ucinakIgracaZaTakmicenje == null)
            {
                ucinakIgracaZaTakmicenje =  new Ucinak()
                {
                    OdigraneUtakmice = 1,
                    Pogotci = 0,
                    Asistencije = 0,
                    UkupnoSuteva = 0,
                    IndeksKorisnosti = 0,
                    IzgubljeneLopte = sport != SportType.Fudbal ? 0 : null,
                    UkradeneLopte = sport == SportType.Kosarka ? 0 : null,
                    BlokiraniUdarci = 0,
                    VraceniPosedi =  sport != SportType.Kosarka ? 0 : null,
                    UkupnoDodavanja = sport == SportType.Fudbal ? 0 : null,
                    UkupnoTacnihDodavanja = sport == SportType.Fudbal ? 0 : null,
                    PredjenaDistancaKM = sport == SportType.Fudbal ? 0 : null,
                    Skokovi = sport == SportType.Kosarka ? 0 : null,
                    SkokoviOF =  sport == SportType.Kosarka ? 0 : null,
                    SkokoviDF =  sport == SportType.Kosarka ? 0 : null,
                    Iskljucenja =  sport == SportType.Vaterpolo ? 0 : null,
                    UkupnoFaula = 0,
                    CrveniKartoni = sport == SportType.Fudbal ? 0 : null,
                    ZutiKartoni = sport == SportType.Fudbal ? 0 : null,
                    IgracId = parametri.IgracID,
                    TakmicenjeId = utakmica.Kolo.TakmicenjeId,
                    Sezona = VratiTrenutnuSezonu(),
                    NazivKluba = parametri.Klub,
                };
                ucinakIgracaZaTakmicenje.Igrac = igrac;
                ucinakIgracaZaTakmicenje.Takmicenje = utakmica.Kolo.Takmicenje;
            }
            bool penali = (utakmica.Status == "PENAL SERIJA" ||  utakmica.Status == "PETERCI") ? true : false;
            await RefaktorisiUcinakIStatistiku(ucinakIgracaZaTakmicenje,utakmicaID,sport,parametri,azuriranUcinak,penali);
            await _context.SaveChangesAsync();
        }
        public async Task AzurirajStatistikuUtakmiceAsync(int utakmicaID,SportType sport,UtakmicaStatDTO parametri)
        {
            var postoji = await _context.Set<Utakmica>()
            .FirstOrDefaultAsync(x => x.Id == utakmicaID);
            if(postoji == null)
                throw new Exception("Prosledjena utakmica ne postoji u bazi");
            switch (parametri.Parametar)
            {
                case "sutKaGol":
                    FudbalStatistika statistika1 =  await _context.Set<FudbalStatistika>().Include(x => x.Utakmica)
                    .Where(x =>  x.Utakmica.Id == utakmicaID).FirstOrDefaultAsync();
                    if(parametri.Klub == "domacin")
                    {
                        if(parametri.Promena == "dodaj")
                        {
                              if(statistika1.SutKaGolDomacin +1 > statistika1.SutDomacin)
                                throw new Exception("Broj šuteva ka golu mora biti makar jednak ili manji ukupnom broju šuteva kluba");
                            statistika1.SutKaGolDomacin +=1;
                        }
                        else
                            statistika1.SutKaGolDomacin -=1;

                    }
                    else
                    {
                        if(parametri.Promena == "dodaj")
                        {
                            if(statistika1.SutKaGolGost +1 > statistika1.SutGost)
                                throw new Exception("Broj šuteva ka golu mora biti makar jednak ili manji ukupnom broju šuteva kluba");
                            statistika1.SutKaGolGost +=1;
                        }
                        else
                            statistika1.SutKaGolGost -=1;
                    }
                    await _hubMatchContext.Clients.All.SendAsync($"PromenjenaStatistikaUtakmice{utakmicaID}",statistika1);
                    await _context.SaveChangesAsync();
                break;
                case "posed":
                    FudbalStatistika statistika2 =  await _context.Set<FudbalStatistika>().Include(x => x.Utakmica)
                    .Where(x =>  x.Utakmica.Id == utakmicaID).FirstOrDefaultAsync();
                    if(parametri.Klub == "domacin")
                    {
                        if(parametri.Promena == "dodaj")
                        {
                            if(statistika2.PosedDomacin < 100 )
                            {
                                statistika2.PosedDomacin +=1;
                                statistika2.PosedGost = 100 - statistika2.PosedDomacin;
                            }
                            
                        }
                        else
                        {
                            if(statistika2.PosedDomacin > 0 )
                            {
                                statistika2.PosedDomacin -=1;
                                statistika2.PosedGost = 100 - statistika2.PosedDomacin;
                            }
                        }
                    }
                    else
                    {
                        if(parametri.Promena == "dodaj")
                        {
                            if(statistika2.PosedDomacin < 100 )
                            {
                                statistika2.PosedGost +=1;
                                statistika2.PosedDomacin = 100 - statistika2.PosedGost;
                            }
                            
                        }
                        else
                        {
                            if(statistika2.PosedDomacin > 0 )
                            {
                                statistika2.PosedGost -=1;
                                statistika2.PosedDomacin = 100 - statistika2.PosedGost;
                            }
                        }
                    }
                    await _hubMatchContext.Clients.All.SendAsync($"PromenjenaStatistikaUtakmice{utakmicaID}",statistika2);
                    await _context.SaveChangesAsync();
                break;
                case "bacanja":
                    KosarkaStatistika statistika3 =  await _context.Set<KosarkaStatistika>().Include(x => x.Utakmica)
                    .Where(x =>  x.Utakmica.Id == utakmicaID).FirstOrDefaultAsync();
                    if(parametri.Klub == "domacin")
                    {
                        if(parametri.Promena == "dodaj")
                            statistika3.FreeThrowDomacin +=1;
                        else
                            statistika3.FreeThrowDomacin -=1;

                    }
                    else
                    {
                        if(parametri.Promena == "dodaj")
                            statistika3.FreeThrowGost +=1;
                        else
                            statistika3.FreeThrowGost -=1;
                    }
                    await _hubMatchContext.Clients.All.SendAsync($"PromenjenaStatistikaUtakmice{utakmicaID}",statistika3);
                    await _context.SaveChangesAsync();
                break;
                case "dva":
                    KosarkaStatistika statistika4 =  await _context.Set<KosarkaStatistika>().Include(x => x.Utakmica)
                    .Where(x =>  x.Utakmica.Id == utakmicaID).FirstOrDefaultAsync();
                    if(parametri.Klub == "domacin")
                    {
                        if(parametri.Promena == "dodaj")
                            statistika4.TwoPointDomacin +=1;
                        else
                            statistika4.TwoPointDomacin -=1;

                    }
                    else
                    {
                        if(parametri.Promena == "dodaj")
                            statistika4.TwoPointGost +=1;
                        else
                            statistika4.TwoPointGost -=1;
                    }
                    await _hubMatchContext.Clients.All.SendAsync($"PromenjenaStatistikaUtakmice{utakmicaID}",statistika4);
                    await _context.SaveChangesAsync();
                break;
                case "tri":
                   KosarkaStatistika statistika5 =  await _context.Set<KosarkaStatistika>().Include(x => x.Utakmica)
                    .Where(x =>  x.Utakmica.Id == utakmicaID).FirstOrDefaultAsync();
                    if(parametri.Klub == "domacin")
                    {
                        if(parametri.Promena == "dodaj")
                            statistika5.ThreePointDomacin +=1;
                        else
                            statistika5.ThreePointDomacin -=1;

                    }
                    else
                    {
                        if(parametri.Promena == "dodaj")
                            statistika5.ThreePointGost +=1;
                        else
                            statistika5.ThreePointGost -=1;
                    }
                    await _hubMatchContext.Clients.All.SendAsync($"PromenjenaStatistikaUtakmice{utakmicaID}",statistika5);
                    await _context.SaveChangesAsync();
                break;
                case "peterci":
                     VaterpoloStatistika stat =  await _context.Set<VaterpoloStatistika>().Include(x => x.Utakmica)
                    .Where(x =>  x.Utakmica.Id == utakmicaID).FirstOrDefaultAsync();
                    if(parametri.Klub == "domacin")
                    {
                        if(parametri.Promena == "dodaj")
                            stat.PeterciDomacin +=1;
                        else
                            stat.PeterciDomacin -=1;
                    }
                    else
                    {
                        if(parametri.Promena == "dodaj")
                            stat.PeterciGost +=1;
                        else
                            stat.PeterciGost -=1;
                    }
                    await _hubMatchContext.Clients.All.SendAsync($"PromenjenaStatistikaUtakmice{utakmicaID}",stat);
                    await _context.SaveChangesAsync();
                break;
                default:
                    throw new Exception("Prosledili ste ne validan parametar za izmenu");
            }

        }
        private async Task RefaktorisiUcinakIStatistiku(Ucinak ucinakIgracaZaTakmicenje,int utakmicaID,SportType sport, IgracUcinakDTO parametri,UcinakIgracaNaUtakmici azur,bool penali)
        {
            switch(sport)
            {
                case SportType.Fudbal:
                    await AzurirajFudbalskuStatistiku(utakmicaID,parametri,penali);
                break;
                case SportType.Kosarka:
                 await AzurirajKosarkaskuStatistiku(utakmicaID,parametri);
                break;
                default:
                 await AzurirajVaterpoloStatistiku(utakmicaID,parametri);
                break;
            } 
            int izmena = (parametri.Promena == "dodaj" ? 1 : -1);
            switch(parametri.Parametar)
            {
                case "pogotci":
                    if(!penali)
                    {
                        ucinakIgracaZaTakmicenje.Pogotci += izmena;
                        ucinakIgracaZaTakmicenje.IndeksKorisnosti += sport == SportType.Fudbal ? izmena*2 : izmena;
                    }
                    else 
                    {
                         ucinakIgracaZaTakmicenje.IndeksKorisnosti +=  izmena;
                    }
                break;
                case "asistencije":
                    ucinakIgracaZaTakmicenje.Asistencije += izmena;
                    ucinakIgracaZaTakmicenje.IndeksKorisnosti += sport == SportType.Fudbal ? izmena*2 : izmena;
                break;
                case "ukupnoSuteva":
                    ucinakIgracaZaTakmicenje.UkupnoSuteva += izmena;
                break;
                case "izgubljeneLopte":
                    ucinakIgracaZaTakmicenje.IzgubljeneLopte += izmena;
                break;
                case "ukradeneLopte":
                    ucinakIgracaZaTakmicenje.UkradeneLopte += izmena;
                break;
                case "blokiraniUdarci":
                    ucinakIgracaZaTakmicenje.BlokiraniUdarci += izmena;
                break;
                case "vraceniPosedi":
                    ucinakIgracaZaTakmicenje.VraceniPosedi += izmena;
                    ucinakIgracaZaTakmicenje.IndeksKorisnosti += izmena;
                break;
                case "ukupnoDodavanja":
                    ucinakIgracaZaTakmicenje.UkupnoDodavanja += izmena;
                break;
                case "ukupnoTacnihDodavanja":
                    ucinakIgracaZaTakmicenje.UkupnoTacnihDodavanja += izmena;
                    ucinakIgracaZaTakmicenje.IndeksKorisnosti += izmena;
                break;
                case "predjenaDistancaKM":
                    ucinakIgracaZaTakmicenje.PredjenaDistancaKM += izmena;
                    ucinakIgracaZaTakmicenje.IndeksKorisnosti += izmena/5;
                break;
                case "skokovi":
                    ucinakIgracaZaTakmicenje.Skokovi += izmena;
                    ucinakIgracaZaTakmicenje.IndeksKorisnosti += izmena;
                break;
                case "skokoviOF":
                    ucinakIgracaZaTakmicenje.SkokoviOF += izmena;
                    ucinakIgracaZaTakmicenje.Skokovi += izmena;
                    ucinakIgracaZaTakmicenje.IndeksKorisnosti += izmena;
                break;
                case "skokoviDF":
                    ucinakIgracaZaTakmicenje.SkokoviDF += izmena;
                    ucinakIgracaZaTakmicenje.Skokovi += izmena;
                    ucinakIgracaZaTakmicenje.IndeksKorisnosti += izmena;
                break;
                case "iskljucenja":
                    ucinakIgracaZaTakmicenje.Iskljucenja += izmena;
                    ucinakIgracaZaTakmicenje.UkupnoFaula+=izmena;
                    ucinakIgracaZaTakmicenje.IndeksKorisnosti -= izmena;
                break;
                case "ukupnoFaula":
                    ucinakIgracaZaTakmicenje.UkupnoFaula += izmena;
                    ucinakIgracaZaTakmicenje.IndeksKorisnosti -= izmena;
                break;
                case "crveniKartoni":
                    ucinakIgracaZaTakmicenje.CrveniKartoni += izmena;
                    ucinakIgracaZaTakmicenje.UkupnoFaula+=izmena;
                    ucinakIgracaZaTakmicenje.IndeksKorisnosti -= izmena*3;
                break;
                case "zutiKartoni":
                    ucinakIgracaZaTakmicenje.ZutiKartoni += izmena;
                    ucinakIgracaZaTakmicenje.UkupnoFaula+=izmena;
                    ucinakIgracaZaTakmicenje.IndeksKorisnosti -= izmena*2;
                break;
                case "igraUtakmicu":
                if(azur != null)
                    ucinakIgracaZaTakmicenje.OdigraneUtakmice =  azur.IgraUtakmicu ? ucinakIgracaZaTakmicenje.OdigraneUtakmice+1 : ucinakIgracaZaTakmicenje.OdigraneUtakmice-1 ;
                break;
                default:
                break;
            }
            await _context.SaveChangesAsync();
           
        }
        private async Task AzurirajFudbalskuStatistiku(int utakmicaID,IgracUcinakDTO parametri,bool penali)
        {
            var statistika =  await _context.Set<FudbalStatistika>().Include(x => x.Utakmica)
                    .Where(x => x.UtakmicaId == utakmicaID).FirstOrDefaultAsync();
            if(statistika == null)
                throw new Exception("Nije pronadadjena statistika za prosledjenu utakmicu");
            statistika.AsistencijeDomacin = statistika.Utakmica.Domacin == parametri.Klub && parametri.Parametar == "asistencije" ?
            parametri.Promena == "dodaj" ? statistika.AsistencijeDomacin+1 : statistika.AsistencijeDomacin-1 : statistika.AsistencijeDomacin;
            statistika.AsistencijeGost =  statistika.Utakmica.Gost == parametri.Klub && parametri.Parametar == "asistencije" ?
            parametri.Promena == "dodaj" ? statistika.AsistencijeGost+1 : statistika.AsistencijeGost-1 : statistika.AsistencijeGost;
            if(statistika.ListaStrelaca == null || statistika.ListaStrelaca == "")
            {
                if(statistika.Utakmica.Domacin == parametri.Klub)
                {
                    statistika.ListaStrelaca = "Dom";
                }
                else if(statistika.Utakmica.Gost == parametri.Klub)
                {
                    statistika.ListaStrelaca  = ",Gos";
                }
            }
            if(statistika.ListaStrelaca != null && parametri.Parametar == "pogotci")
            {
                var igrac = await _context.Set<Igrac>().FirstOrDefaultAsync(x => x.Id == parametri.IgracID);
                if(igrac == null)
                    throw new Exception("Igrac ne postoji u bazi");
                string[] delovi = statistika.ListaStrelaca.Split(',');
                string[] rezultat = statistika.Utakmica.Rezultat.Split(':');
                int domacin = int.Parse(rezultat[0]);
                int gost = int.Parse(rezultat[1]);
               
                if (delovi.Length == 2)
                {
                    if(statistika.Utakmica.Domacin == parametri.Klub)
                    {
                        statistika.GoloviDomacin = parametri.Promena == "dodaj" ? statistika.GoloviDomacin+1 : statistika.GoloviDomacin-1;
                        domacin = parametri.Promena == "dodaj" ? domacin+1 : domacin-1;
                        if(!penali)
                        {
                            statistika.SutDomacin =  parametri.Promena == "dodaj" ? statistika.SutDomacin+1 : statistika.SutDomacin-1;
                            statistika.SutKaGolDomacin = parametri.Promena == "dodaj" ? statistika.SutKaGolDomacin+1 : statistika.SutKaGolDomacin-1;
                            
                        }
                        if(parametri.Promena == "dodaj" && !penali)
                            delovi[0] += "-" + igrac.Prezime;
                        else if(!penali)
                        {
                            var strelci = delovi[0].Split('-').ToList();
                            strelci.Remove(igrac.Prezime); 
                            delovi[0] = string.Join("-", strelci);
                        }
                    }
                   else  if(statistika.Utakmica.Gost == parametri.Klub)
                    {
                        statistika.GoloviGost = parametri.Promena == "dodaj" ? statistika.GoloviGost+1 : statistika.GoloviGost-1;
                        gost = parametri.Promena == "dodaj" ? gost+1 : gost-1;
                        if(!penali)
                        {
                            statistika.SutGost =  parametri.Promena == "dodaj" ? statistika.SutGost+1 : statistika.SutGost-1;
                            statistika.SutKaGolGost = parametri.Promena == "dodaj" ? statistika.SutKaGolGost+1 : statistika.SutKaGolGost-1;
                        }
                        if(parametri.Promena == "dodaj" && !penali)
                            delovi[1] += "-" + igrac.Prezime;
                        else
                        {
                            var strelci = delovi[1].Split('-').ToList();
                            strelci.Remove(igrac.Prezime); 
                            delovi[1] = string.Join("-", strelci);
                        }
                    }
                    statistika.ListaStrelaca = string.Join(",", delovi);
                    statistika.Utakmica.Rezultat = $"{domacin}:{gost}";
                    var kolo = await _context.Set<Kolo>().Include(x => x.Utakmice).Include(x => x.Takmicenje)
                    .FirstAsync(x => x.Utakmice.Contains(statistika.Utakmica));
                    var res = new
                    {
                        UtakmicaID = utakmicaID,
                        Rezultat = $"{domacin}:{gost}",
                        ListaStrelaca = statistika.ListaStrelaca
                    };
                    await _hubMatchContext.Clients.All.SendAsync($"PromenjenRezultatUtkamice:Kolo:{kolo.BrojKola}|Takmicenje:{kolo.Takmicenje.Id}",res);
                }
            }
            statistika.SutDomacin = statistika.Utakmica.Domacin == parametri.Klub && parametri.Parametar == "ukupnoSuteva" ?
            parametri.Promena == "dodaj" ? statistika.SutDomacin+1 : statistika.SutDomacin-1 : statistika.SutDomacin;
            statistika.SutGost = statistika.Utakmica.Gost == parametri.Klub && parametri.Parametar == "ukupnoSuteva" ?
            parametri.Promena == "dodaj" ? statistika.SutGost+1 : statistika.SutGost-1 : statistika.SutGost;
            statistika.ZutiKartoniDomacin = statistika.Utakmica.Domacin == parametri.Klub && parametri.Parametar == "zutiKartoni" ?
            parametri.Promena == "dodaj" ? statistika.ZutiKartoniDomacin+1 : statistika.ZutiKartoniDomacin-1 : statistika.ZutiKartoniDomacin;
            statistika.ZutiKartoniGost = statistika.Utakmica.Gost == parametri.Klub && parametri.Parametar == "zutiKartoni" ?
            parametri.Promena == "dodaj" ? statistika.ZutiKartoniGost+1 : statistika.ZutiKartoniGost-1 : statistika.ZutiKartoniGost;
            statistika.CrveniKartoniDomacin = statistika.Utakmica.Domacin == parametri.Klub && parametri.Parametar == "crveniKartoni" ?
            parametri.Promena == "dodaj" ? statistika.CrveniKartoniDomacin+1 : statistika.CrveniKartoniDomacin-1 : statistika.CrveniKartoniDomacin;
            statistika.CrveniKartoniGost = statistika.Utakmica.Gost == parametri.Klub && parametri.Parametar == "crveniKartoni" ?
            parametri.Promena == "dodaj" ? statistika.CrveniKartoniGost+1 : statistika.CrveniKartoniGost-1 : statistika.CrveniKartoniGost;
            string statKey = $"stat:{utakmicaID}:{parametri.Klub}:{(int)SportType.Fudbal}";
            var rezultatiRaw = await _db.ListRangeAsync(statKey, 0, -1);
            var ukupnoPaseva = rezultatiRaw
            .Select(item => item.HasValue ? JsonConvert.DeserializeObject<UcinakIgracaNaUtakmici>(item.ToString()!) : null)
            .Where(x => x != null && x.UkupnoDodavanja != null )
            .Sum(u => u.UkupnoDodavanja);
             var preciznoPaseva = rezultatiRaw
            .Select(item => item.HasValue ? JsonConvert.DeserializeObject<UcinakIgracaNaUtakmici>(item.ToString()!) : null)
            .Where(x => x != null && x.UkupnoTacnihDodavanja != null )
            .Sum(u => u.UkupnoTacnihDodavanja);
            if(parametri.Klub == statistika.Utakmica.Domacin )
            {
               if(ukupnoPaseva > 0 && preciznoPaseva > 0)
                statistika.PreciznostPasovaDomacin = (int)(((double)preciznoPaseva/(double)ukupnoPaseva)*100);
                
            }
            else
            {
                if(ukupnoPaseva > 0 && preciznoPaseva > 0)
                    statistika.PreciznostPasovaGost = (int)(((double)preciznoPaseva/(double)ukupnoPaseva)*100);
            }
            await _hubMatchContext.Clients.All.SendAsync($"PromenjenaStatistikaUtakmice{utakmicaID}",statistika);
         }
        private async Task AzurirajKosarkaskuStatistiku(int utakmicaID,IgracUcinakDTO parametri)
        {
            var statistika =  await _context.Set<KosarkaStatistika>().Include(x => x.Utakmica)
                    .Where(x => x.UtakmicaId == utakmicaID).FirstOrDefaultAsync();
            if(statistika == null)
                throw new Exception("Nije pronadadjena statistika za prosledjenu utakmicu");
            statistika.AsistencijeDomacin = statistika.Utakmica.Domacin == parametri.Klub && parametri.Parametar == "asistencije" ?
            parametri.Promena == "dodaj" ? statistika.AsistencijeDomacin+1 : statistika.AsistencijeDomacin-1 : statistika.AsistencijeDomacin;
            statistika.AsistencijeGost =  statistika.Utakmica.Gost == parametri.Klub && parametri.Parametar == "asistencije" ?
            parametri.Promena == "dodaj" ? statistika.AsistencijeGost+1 : statistika.AsistencijeGost-1 : statistika.AsistencijeGost;
            //////////////////prva////////////////////////
            statistika.PrvaCetDomacin = statistika.Utakmica.Domacin == parametri.Klub && parametri.Parametar == "pogotci" && statistika.TrenutniMinut <= 10 ?
            parametri.Promena == "dodaj" ? statistika.PrvaCetDomacin+1 : statistika.PrvaCetDomacin-1 : statistika.PrvaCetDomacin;
            statistika.PrvaCetDomacin = statistika.Utakmica.Domacin == parametri.Klub && parametri.Parametar == "pogotci" && statistika.TrenutniMinut <= 10 ?
            parametri.Promena == "dodaj" ? statistika.PrvaCetDomacin+1 : statistika.PrvaCetDomacin-1 : statistika.PrvaCetDomacin;
            statistika.PrvaCetGost = statistika.Utakmica.Gost == parametri.Klub && parametri.Parametar == "pogotci" && statistika.TrenutniMinut <= 10 ?
            parametri.Promena == "dodaj" ? statistika.PrvaCetGost+1 : statistika.PrvaCetGost-1 : statistika.PrvaCetGost;
            ///druga
            statistika.DrugaCetDomacin = statistika.Utakmica.Domacin == parametri.Klub && parametri.Parametar == "pogotci" &&
            statistika.TrenutniMinut > 10 && statistika.TrenutniMinut <= 20 ?
            parametri.Promena == "dodaj" ? statistika.DrugaCetDomacin+1 : statistika.DrugaCetDomacin-1 : statistika.DrugaCetDomacin;
            statistika.DrugaCetGost = statistika.Utakmica.Gost == parametri.Klub && parametri.Parametar == "pogotci" &&
            statistika.TrenutniMinut > 10 && statistika.TrenutniMinut <= 20 ?
            parametri.Promena == "dodaj" ? statistika.DrugaCetGost+1 : statistika.DrugaCetGost-1 : statistika.DrugaCetGost;
            ///////////////////////treca////////////////////////////////////////////
            statistika.TrecaCetDomacin = statistika.Utakmica.Domacin == parametri.Klub && parametri.Parametar == "pogotci" &&
            statistika.TrenutniMinut > 20 && statistika.TrenutniMinut <= 30 ?
            parametri.Promena == "dodaj" ? statistika.TrecaCetDomacin+1 : statistika.TrecaCetDomacin-1 : statistika.TrecaCetDomacin;
            statistika.TrecaCetGost = statistika.Utakmica.Gost == parametri.Klub && parametri.Parametar == "pogotci" &&
            statistika.TrenutniMinut > 20 && statistika.TrenutniMinut <= 30 ?
            parametri.Promena == "dodaj" ? statistika.TrecaCetGost+1 : statistika.TrecaCetGost-1 : statistika.TrecaCetGost;
            //////////////////////////////ctvrta cetvrtina////////////////////////////////
            statistika.CetvCetDomacin = statistika.Utakmica.Domacin == parametri.Klub && parametri.Parametar == "pogotci" &&
            statistika.TrenutniMinut > 30 && statistika.TrenutniMinut <= 40 ?
            parametri.Promena == "dodaj" ? statistika.CetvCetDomacin+1 : statistika.CetvCetDomacin-1 : statistika.CetvCetDomacin;
            statistika.CetvCetGost = statistika.Utakmica.Gost == parametri.Klub && parametri.Parametar == "pogotci" &&
            statistika.TrenutniMinut > 30 && statistika.TrenutniMinut <= 40 ?
            parametri.Promena == "dodaj" ? statistika.CetvCetGost+1 : statistika.CetvCetGost-1 : statistika.CetvCetGost;
            ///////////////////////////// rezultat ///////////////////////////
            string[] rezultat = statistika.Utakmica.Rezultat.Split(':');
            int domacin = int.Parse(rezultat[0]);
            int gost = int.Parse(rezultat[1]);
            domacin = statistika.Utakmica.Domacin == parametri.Klub && parametri.Parametar == "pogotci" ?
            parametri.Promena == "dodaj" ? domacin+1 : domacin-1 : domacin;
            gost = statistika.Utakmica.Gost == parametri.Klub && parametri.Parametar == "pogotci" ?
            parametri.Promena == "dodaj" ? gost+1 : gost-1 : gost;
            statistika.Utakmica.Rezultat = $"{domacin}:{gost}";
             var kolo = await _context.Set<Kolo>().Include(x => x.Utakmice).Include(x => x.Takmicenje)
                    .FirstAsync(x => x.Utakmice.Contains(statistika.Utakmica));
            var res = new
            {
                UtakmicaID = utakmicaID,
                Rezultat = $"{domacin}:{gost}"
            };
            await _hubMatchContext.Clients.All.SendAsync($"PromenjenRezultatUtkamice:Kolo:{kolo.BrojKola}|Takmicenje:{kolo.Takmicenje.Id}",res);
            if(parametri.Parametar == "skokoviOF" || parametri.Parametar == "skokoviDF")
            {
                statistika.ReboundsDomacin = statistika.Utakmica.Domacin == parametri.Klub ?
                parametri.Promena == "dodaj" ? statistika.ReboundsDomacin+1 : statistika.ReboundsDomacin-1 : statistika.ReboundsDomacin;
                statistika.ReboundsGost = statistika.Utakmica.Gost == parametri.Klub ?
                parametri.Promena == "dodaj" ? statistika.ReboundsGost+1 : statistika.ReboundsGost-1 : statistika.ReboundsGost;
            }
            statistika.BlocksDomacin =  statistika.Utakmica.Domacin == parametri.Klub && parametri.Parametar == "blokiraniUdarci" ?
            parametri.Promena == "dodaj" ?  statistika.BlocksDomacin+1 :  statistika.BlocksDomacin-1 :  statistika.BlocksDomacin;
            statistika.BlocksGost =  statistika.Utakmica.Gost == parametri.Klub && parametri.Parametar == "blokiraniUdarci" ?
            parametri.Promena == "dodaj" ?  statistika.BlocksGost+1 :  statistika.BlocksGost-1 :  statistika.BlocksGost;
            statistika.StealsDomacin = statistika.Utakmica.Domacin == parametri.Klub && parametri.Parametar == "ukradeneLopte" ?
            parametri.Promena == "dodaj" ?  statistika.StealsDomacin+1 :  statistika.StealsDomacin-1 :  statistika.StealsDomacin;
            statistika.StealsGost =  statistika.Utakmica.Gost == parametri.Klub && parametri.Parametar == "ukradeneLopte" ?
            parametri.Promena == "dodaj" ?  statistika.StealsGost+1 :  statistika.StealsGost-1 :  statistika.StealsGost;
            await _hubMatchContext.Clients.All.SendAsync($"PromenjenaStatistikaUtakmice{utakmicaID}",statistika);
        }
        private async Task AzurirajVaterpoloStatistiku(int utakmicaID,IgracUcinakDTO parametri)
        {
            var statistika =  await _context.Set<VaterpoloStatistika>().Include(x => x.Utakmica)
                    .Where(x => x.UtakmicaId == utakmicaID).FirstOrDefaultAsync();
            if(statistika == null)
                throw new Exception("Nije pronadadjena statistika za prosledjenu utakmicu");
            statistika.AsistencijeDomacin = statistika.Utakmica.Domacin == parametri.Klub && parametri.Parametar == "asistencije" ?
            parametri.Promena == "dodaj" ? statistika.AsistencijeDomacin+1 : statistika.AsistencijeDomacin-1 : statistika.AsistencijeDomacin;
            statistika.AsistencijeGost =  statistika.Utakmica.Gost == parametri.Klub && parametri.Parametar == "asistencije" ?
            parametri.Promena == "dodaj" ? statistika.AsistencijeGost+1 : statistika.AsistencijeGost-1 : statistika.AsistencijeGost;
            string[] rezultat = statistika.Utakmica.Rezultat.Split(':');
            int domacin = int.Parse(rezultat[0]);
            int gost = int.Parse(rezultat[1]);
            domacin = statistika.Utakmica.Domacin == parametri.Klub && parametri.Parametar == "pogotci" ?
            parametri.Promena == "dodaj" ? domacin+1 : domacin-1 : domacin;
            gost = statistika.Utakmica.Gost == parametri.Klub && parametri.Parametar == "pogotci" ?
            parametri.Promena == "dodaj" ? gost+1 : gost-1 : gost;
            statistika.Utakmica.Rezultat = $"{domacin}:{gost}";
            var kolo = await _context.Set<Kolo>().Include(x => x.Utakmice).Include(x => x.Takmicenje)
                    .FirstAsync(x => x.Utakmice.Contains(statistika.Utakmica));
            var res = new
            {
                UtakmicaID = utakmicaID,
                Rezultat = $"{domacin}:{gost}"
            };
            await _hubMatchContext.Clients.All.SendAsync($"PromenjenRezultatUtkamice:Kolo:{kolo.BrojKola}|Takmicenje:{kolo.Takmicenje.Id}",res);
            //////////////////prva////////////////////////
            statistika.VP_PrvaCetDomacin = statistika.Utakmica.Domacin == parametri.Klub && parametri.Parametar == "pogotci" && statistika.TrenutniMinut <= 8 ?
            parametri.Promena == "dodaj" ? statistika.VP_PrvaCetDomacin+1 : statistika.VP_PrvaCetDomacin-1 : statistika.VP_PrvaCetDomacin;
            statistika.VP_PrvaCetDomacin = statistika.Utakmica.Domacin == parametri.Klub && parametri.Parametar == "pogotci" && statistika.TrenutniMinut <= 8 ?
            parametri.Promena == "dodaj" ? statistika.VP_PrvaCetDomacin+1 : statistika.VP_PrvaCetDomacin-1 : statistika.VP_PrvaCetDomacin;
            statistika.VP_PrvaCetGost = statistika.Utakmica.Gost == parametri.Klub && parametri.Parametar == "pogotci" && statistika.TrenutniMinut <= 8 ?
            parametri.Promena == "dodaj" ? statistika.VP_PrvaCetGost+1 : statistika.VP_PrvaCetGost-1 : statistika.VP_PrvaCetGost;
            ///druga
            statistika.VP_DrugaCetDomacin = statistika.Utakmica.Domacin == parametri.Klub && parametri.Parametar == "pogotci" &&
            statistika.TrenutniMinut > 8 && statistika.TrenutniMinut <= 16 ?
            parametri.Promena == "dodaj" ? statistika.VP_DrugaCetDomacin+1 : statistika.VP_DrugaCetDomacin-1 : statistika.VP_DrugaCetDomacin;
            statistika.VP_DrugaCetGost = statistika.Utakmica.Gost == parametri.Klub && parametri.Parametar == "pogotci" &&
            statistika.TrenutniMinut > 8 && statistika.TrenutniMinut <= 16 ?
            parametri.Promena == "dodaj" ? statistika.VP_DrugaCetGost+1 : statistika.VP_DrugaCetGost-1 : statistika.VP_DrugaCetGost;
            ///////////////////////treca////////////////////////////////////////////
            statistika.VP_TrecaCetDomacin = statistika.Utakmica.Domacin == parametri.Klub && parametri.Parametar == "pogotci" &&
            statistika.TrenutniMinut > 16 && statistika.TrenutniMinut <= 24 ?
            parametri.Promena == "dodaj" ? statistika.VP_TrecaCetDomacin+1 : statistika.VP_TrecaCetDomacin-1 : statistika.VP_TrecaCetDomacin;
            statistika.VP_TrecaCetGost = statistika.Utakmica.Gost == parametri.Klub && parametri.Parametar == "pogotci" &&
            statistika.TrenutniMinut > 16 && statistika.TrenutniMinut <= 24 ?
            parametri.Promena == "dodaj" ? statistika.VP_TrecaCetGost+1 : statistika.VP_TrecaCetGost-1 : statistika.VP_TrecaCetGost;
            //////////////////////////////ctvrta cetvrtina////////////////////////////////
            statistika.VP_CetvCetDomacin = statistika.Utakmica.Domacin == parametri.Klub && parametri.Parametar == "pogotci" &&
            statistika.TrenutniMinut > 24 && statistika.TrenutniMinut <= 32 ?
            parametri.Promena == "dodaj" ? statistika.VP_CetvCetDomacin+1 : statistika.VP_CetvCetDomacin-1 : statistika.VP_CetvCetDomacin;
            statistika.VP_CetvCetGost = statistika.Utakmica.Gost == parametri.Klub && parametri.Parametar == "pogotci" &&
            statistika.TrenutniMinut > 24 && statistika.TrenutniMinut <= 32 ?
            parametri.Promena == "dodaj" ? statistika.VP_CetvCetGost+1 : statistika.VP_CetvCetGost-1 : statistika.VP_CetvCetGost;
            statistika.IskljucenjaDomacin =  statistika.Utakmica.Domacin == parametri.Klub && parametri.Parametar == "iskljucenja" ?
            parametri.Promena == "dodaj" ?  statistika.IskljucenjaDomacin+1 :  statistika.IskljucenjaDomacin-1 :  statistika.IskljucenjaDomacin;
            statistika.IskljucenjaGost =  statistika.Utakmica.Gost == parametri.Klub && parametri.Parametar == "iskljucenja" ?
            parametri.Promena == "dodaj" ?  statistika.IskljucenjaGost+1 :  statistika.IskljucenjaGost-1 :  statistika.IskljucenjaGost;
            await _hubMatchContext.Clients.All.SendAsync($"PromenjenaStatistikaUtakmice{utakmicaID}",statistika);
        }
        private void RacunajIndeks(UcinakIgracaNaUtakmici ucinakIgraca,SportType sport)
        {
            int index = 0;
            switch(sport)
            {
                case SportType.Fudbal:
                index = ucinakIgraca.Pogotci*2+ucinakIgraca.Asistencije*2+(int)ucinakIgraca.BlokiraniUdarci
                +(int)ucinakIgraca.VraceniPosedi
                +(int)ucinakIgraca.UkupnoTacnihDodavanja
                +(int)ucinakIgraca.PredjenaDistancaKM/5;
                index-=((int)ucinakIgraca.UkupnoDodavanja-(int)ucinakIgraca.UkupnoTacnihDodavanja);
                index-=(int)ucinakIgraca.UkupnoFaula;
                index-= ucinakIgraca.ZutiKartoni != null && ucinakIgraca.ZutiKartoni == true ? 2 : 0;
                index-= ucinakIgraca.CrveniKartoni != null && ucinakIgraca.CrveniKartoni == true ? 3 : 0;
                break;
                case SportType.Kosarka:
                index = (int)ucinakIgraca.Pogotci + (int)ucinakIgraca.Asistencije
                 + (int)ucinakIgraca.UkradeneLopte + (int)ucinakIgraca.Skokovi
                 +(int)ucinakIgraca.BlokiraniUdarci;
                 index -= (int)ucinakIgraca.UkupnoFaula;
                 index-= (int)ucinakIgraca.IzgubljeneLopte;
                break;
                default:
                index = (int)ucinakIgraca.Pogotci+(int)ucinakIgraca.Asistencije
                +(int)ucinakIgraca.VraceniPosedi;
                index-= (int)ucinakIgraca.Iskljucenja;
                index-= (int)ucinakIgraca.IzgubljeneLopte;
                break;
            }
            ucinakIgraca.IndeksKorisnosti = index;
            
        }
        public async Task UpravljanjeStatusomTokomUtakmiceAsync(int utakmicaID,string status)
        {
            if(status ==  "PREDSTOJI")
                throw new Exception("Ne možete ponovo proglasiti utakmicu da predstoji ali je možete obristati i ponovo kreirati");
            var utakmica = await _context.Set<Utakmica>()
            .Include(x => x.Statistika)
            .Include(x => x.Kolo)
            .ThenInclude(x => x.Takmicenje)
            .FirstOrDefaultAsync(x => x.Id == utakmicaID);
            if(utakmica == null)
                throw new Exception("Prosledjena utakmica nije pronadjena u bazi");
            var kolo = utakmica.Kolo;
            if(utakmica.Status != null && utakmica.Status  != status )
            {
                var prethodniStatus = utakmica.Status;
                 var sport = utakmica?.Statistika?.Sport;
                utakmica.Status = status;
                if(prethodniStatus == "PREDSTOJI")
                {
                    
                    utakmica.Uzivo = true;
                }
                if(status != "TRENUTNI MINUT")
                {
                    ZaustaviBrojacUtakmice(utakmicaID);
                    
                    if(status == "ODIGRANO")
                    {
                        bool peterci = prethodniStatus == "PETERCI" ? true : false;
                        await AzurirajTabeluAsync(utakmicaID,utakmica.Kolo.TakmicenjeId,peterci);
                        utakmica.Uzivo = false;
                    }
                    else if(status == "PETERCI")
                    {
                        var stat = await _context.Set<VaterpoloStatistika>()
                        .FirstAsync(x => x.Id == utakmica.StatistikaId);
                        stat.IgraniPeterci = true;
                    }
                    await _hubMatchContext.Clients.All.SendAsync(
                        $"Azuriran status utakmice kola:{kolo.BrojKola} takmicenja:{utakmica.Kolo.TakmicenjeId}",
                        utakmica
                    );
                }
                else
                {
                    await _hubMatchContext.Clients.All.SendAsync(
                    $"Azuriran status utakmice kola:{kolo.BrojKola} takmicenja:{utakmica.Kolo.TakmicenjeId}",
                    utakmica
                    );
                    var minut = AzurirajMinutPrekoStatusa(prethodniStatus,sport);
                    if(minut > 0)
                        utakmica.Statistika.TrenutniMinut = minut +1;
                    await _hubMatchContext.Clients.All.SendAsync($"Utakmica:{utakmica.Id} azuriran minut",  utakmica.Statistika.TrenutniMinut);
                    await _context.SaveChangesAsync();
                    PokreniBrojac(utakmica);
                }
                await _context.SaveChangesAsync();
            }
        }
        public void PokreniBrojac(Utakmica utakmica)
        {
            Console.WriteLine($"[BROJAC] Aktivni taskovi pre zaustavljanja: {_tokens.Count}");
            ZaustaviBrojacUtakmice(utakmica.Id);
            Console.WriteLine($"[BROJAC] Aktivni taskovi nakon zaustavljanja: {_tokens.Count}");
            var cts = new CancellationTokenSource();
            var task = Task.Run(async () =>
            {
                var token = cts.Token;
                try
                {
                    while (!token.IsCancellationRequested)
                    {
                        await Task.Delay(TimeSpan.FromMinutes(1), token);
                        using (var scope = _scopeFactory.CreateScope())
                        {
                            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                            var utakmicaIzBaze = await db.Set<Utakmica>()
                            .Include(x => x.Statistika)
                            .FirstOrDefaultAsync(x => x.Id == utakmica.Id);
                            if (utakmicaIzBaze != null && utakmicaIzBaze.Statistika != null)
                            {
                                utakmicaIzBaze.Statistika.TrenutniMinut =  utakmicaIzBaze.Statistika.TrenutniMinut+1;
                                await _hubMatchContext.Clients.All.SendAsync($"Utakmica:{utakmicaIzBaze.Id} azuriran minut",  utakmicaIzBaze.Statistika.TrenutniMinut);
                                await db.SaveChangesAsync();
                                
                            }
                            else
                                break;
                        }
                      
                    }
                }
                catch (OperationCanceledException) 
                {
                }
            }, cts.Token);
            _tokens[utakmica.Id] = (cts, task);
        }

        private void ZaustaviBrojacUtakmice(int utakmicaId)
        {
            if (_tokens.TryRemove(utakmicaId, out var cts))
            {
                cts.Cts.Cancel();
                cts.Task.Wait(TimeSpan.FromSeconds(10));
                cts.Cts.Dispose();
            }
        }
        private int  AzurirajMinutPrekoStatusa(string status,SportType? sport)
        {
            switch(status)
            {
                case "KRAJ I POLUVREMENA":
                    return 45;
                case "KRAJ II POLUVREMENA":
                    return 90;
                case "KRAJ I PRODUZETKA":
                    return sport == SportType.Fudbal ? 105 : 45;
                case "KRAJ II PRODUZETKA":
                    return sport == SportType.Fudbal ? 120 : 45;
                case "PENAL SERIJA":
                    return 120;
                case "KRAJ I CETVRTINE":
                    return sport == SportType.Kosarka ? 10 : 8;
                case "KRAJ II CETVRTINE":
                    return sport == SportType.Kosarka ? 20 : 16;
                case "KRAJ III CETVRTINE":
                    return sport == SportType.Kosarka ? 32 : 24;
                case "KRAJ IV CETVRTINE":
                    return sport == SportType.Kosarka ? 40 : 32;
                case "TAJM AUT":
                    return -1;
                case "KRAJ III PRODUZETKA":
                    return 50;
                case "KRAJ IV PRODUZETKA":
                    return 55;
                case "KRAJ V PRODUZETKA":
                    return 60;
                case "KRAJ VI PRODUZETKA":
                    return 65;
                case "KRAJ VII PRODUZETKA":
                    return 70;
                case "KRAJ VIII PRODUZETKA":
                    return 75;
                case "KRAJ IX PRODUZETKA":
                    return 80;
                case "KRAJ X PRODUZETKA":
                    return 85;
                case "PETERCI":
                    return 32;
                case "ODIGRANO":
                    return sport == SportType.Fudbal ? 90 : sport == SportType.Kosarka ? 40 : 32;
                case "PREDSTOJI":
                    return  0;
                default:
                    throw new Exception("Izabrali ste nevalidan status uktamice");
            }
        }
        private async Task AzurirajTabeluAsync(int utakmicaID,int takmicenjeID,bool peterci)
        {
            var utakmica = await _context.Set<Utakmica>()
            .Include(x => x.Statistika)
            .FirstAsync(x => x.Id == utakmicaID);
            var statistika = utakmica.Statistika;
            var sport = utakmica?.Statistika?.Sport;
            var rezultat = utakmica.Rezultat.Split(":");
            int dom = int.Parse(rezultat[0]);
            int gos = int.Parse(rezultat[1]);
            var sezona = VratiTrenutnuSezonu();
            var ucinakKlubova = await _context.Set<Tabela>()
            .Include(x => x.Takmicenje)
            .Include(x => x.Klub)
            .Where(x => x.TakmicenjeId == takmicenjeID
            && x.Sezona == sezona
            && (x.Klub.Naziv==utakmica.Domacin || x.Klub.Naziv==utakmica.Gost))
            .ToListAsync();
             var domacin = ucinakKlubova.Where(x => x.Klub.Naziv == utakmica.Domacin).First();
             var gost = ucinakKlubova.Where(x => x.Klub.Naziv == utakmica.Gost).First();
             domacin.Odigrane+=1;
             domacin.BrojDatihPoena+=dom;
             domacin.BrojPrimljenihPoena+=gos;
             domacin.Razlika = domacin.BrojDatihPoena - domacin.BrojPrimljenihPoena;
             gost.Odigrane+=1;
             gost.BrojDatihPoena+=gos;
             gost.BrojPrimljenihPoena+=dom;
             gost.Razlika = gost.BrojDatihPoena - gost.BrojPrimljenihPoena;
             switch(sport)
             {
                case SportType.Fudbal:
                    if(dom > gos)
                    {
                        domacin.BrojBodova+=3;
                        domacin.Pobede+=1;
                        gost.Izgubljene+=1;
                    }
                    else if (dom < gos)
                    {
                        gost.BrojBodova+=3;
                        domacin.Izgubljene+=1;
                        gost.Pobede+=1;
                    }
                    else
                    {
                        domacin.BrojBodova+=1;
                        gost.BrojBodova+=1;
                        domacin.Neresene+=1;
                        gost.Neresene+=1;
                    }
                break;
                case SportType.Kosarka:
                    if(dom > gos)
                    {
                        domacin.BrojBodova+=2;
                        gost.BrojBodova+=1;
                        domacin.Pobede+=1;
                        gost.Izgubljene+=1;
                    }
                    else if(dom < gos)
                    {
                        gost.BrojBodova+=2;
                        gost.BrojBodova+=1;
                        gost.Pobede+=1;
                        domacin.Izgubljene+=1;
                    }
                    else
                        throw new Exception("Kosarkaska utakmica ne sme biti neresena");
                break;
                default:
                    if(dom > gos && !peterci)
                    {
                        domacin.BrojBodova+=3;
                        domacin.Pobede+=1;
                        gost.Izgubljene+=1;
                        
                    }
                    else if (dom < gos && !peterci)
                    {
                        gost.BrojBodova+=3;
                        gost.Pobede+=1;
                        domacin.Izgubljene+=1;
                    }
                    else if( dom > gos && peterci)
                    {
                        domacin.BrojBodova+=2;
                        gost.BrojBodova+=1;
                        domacin.Pobede+=1;
                        gost.Izgubljene+=1;
                    }
                    else if( dom < gos && peterci)
                    {
                        domacin.BrojBodova+=1;
                        gost.BrojBodova+=2;
                        gost.Pobede+=1;
                        domacin.Izgubljene+=1;
                    }
                    else
                        throw new Exception("Vaterpolo utakmica ne sme biti neresena");
                break;
             }
             


        }
    }
}