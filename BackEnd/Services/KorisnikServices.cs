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
namespace Services
{
    public class KorisnikService : IKorisnikService
    {
        private readonly ApplicationDbContext _context;
        private readonly IDatabase _db;
        private readonly IServer _server;
         private readonly IHubContext<ChatHub> _hubContext;
        public KorisnikService(ApplicationDbContext context,IConnectionMultiplexer redis,IHubContext<ChatHub>hubContext)
        {
            _context = context;
            _db=redis.GetDatabase();
             var endpoint = redis.GetEndPoints().First();
            _server = redis.GetServer(endpoint);
            _hubContext=hubContext;
        }

        public async Task RegistracijaAsync(RegistracijaKorisnika dto)
        {
                
            var korisnik = new Korisnik
            {
                Ime = dto.Ime,
                Prezime = dto.Prezime,
                Username = dto.Username,
                Lozinka = dto.Lozinka,
                Telefon = dto.Telefon
            };

        
                var username=_context.Set<Korisnik>().Where(k => k.Username == dto.Username).FirstOrDefault();
                var number=_context.Set<Korisnik>().Where(k => k.Telefon == dto.Telefon).FirstOrDefault();
                
                if(username != null)
                {
                    throw new InvalidOperationException("Korisnicko ime vec postoji.");
                }
                else if(number != null)
                {
                    throw new Exception("Broj telefona je vec registrovan.");
                }
            _context.Set<Korisnik>().Add(korisnik);
            await _context.SaveChangesAsync();
          
           
         
           
        }

        public async Task<OdgovorPrijave> PrijavaAsync(PrijavaKorisnika dto)
        {
            if( dto.Username.Contains(".") && dto.Username.Contains("@") )
            {
                var klub=await _context.Set<Klub>()
                    .Where(k=>k.Email==dto.Username&&k.Password==dto.Lozinka)
                    .Select(k => new OdgovorPrijaveKluba
                    {
                        Id = k.Id,
                        Username = k.Email,
                        Sport = (int)k.Sport,
                        Naziv = k.Naziv,
                        Logo = k.LogoURL,
                        ListaTrofeja = k.Trofeji,
                        Istorija = k.Istorija,
                        Prihodi = k.Prihodi,
                        Rashodi = k.Rashodi,
                        ListaSponzora=k.Sponzori,
                        Adresa=k.Adresa
                    })
                    .FirstOrDefaultAsync();

                    if (klub == null)
                    {
                        throw new InvalidOperationException("Pogresan email ili lozinka.");
                    }
 
            }
            else
            {
                var korisnik = await _context.Set<Korisnik>()
                    .Where(k => k.Username == dto.Username && k.Lozinka == dto.Lozinka)
                    .Select(k => new OdgovorPrijaveKorisnika
                    {
                        Id = k.Id,
                        Ime = k.Ime,
                        Prezime = k.Prezime,
                        Username = k.Username,
                        Telefon = k.Telefon
                    })
                    .FirstOrDefaultAsync();

                if (korisnik == null)
                {
                    throw new InvalidOperationException("Pogresan username ili lozinka.");
                }

                return korisnik;
            }
                
                
         
        }
        public async Task<IActionResult> VratiTakmicenjaAsync(SportType sport)
        {
            var takmicenja = await _context.Set<Takmicenje>()
                .Select(t => new 
                {
                    Id = t.Id,
                    Sport = t.Sport,
                    Naziv = t.Naziv,
                    LogoURL = t.LogoURL,
                    Opis = t.Opis,
                    Drzava = t.Drzava
                })
                .Where(t => t.Sport == sport)
                .ToListAsync();
            if(takmicenja.Count == 0)
            {
                throw  new Exception("Nema takmicenja za izabrani sport.");
            }
            return new OkObjectResult(takmicenja);
            
        }
        
       public async Task<IActionResult> VratiUtakmiceKolaAsync(int takmicenjeId,int brojKola)
        {
           var koliko = await _context.Set<Kolo>()
        .Where(t => t.TakmicenjeId == takmicenjeId)
        .CountAsync();

    // jedno konkretno kolo + utakmice
    var now=DateTime.UtcNow;
    var kolo = await _context.Set<Kolo>()
        .Where(k => k.TakmicenjeId == takmicenjeId && k.BrojKola == brojKola)
        .Select(k => new
        {
            Id = k.Id,
            Broj = k.BrojKola,
            Koliko = koliko,
            Tip=k.TipKola,
           
            Utakmice = k.Utakmice.Select(u => new
            {
                Id = u.Id,
                Domacin = u.Domacin,
                Datum=u.DatumPocetkaUtakmice,
                Gost = u.Gost,
                Uzivo = u.Uzivo,
                
                Rezultat = u.Rezultat,
                Vreme=u.Statistika.TrenutniMinut,
                ListaStrelaca=u.Statistika.ListaStrelaca,
                Lokacija=u.Lokacija
            }).ToList()
        })
        .FirstOrDefaultAsync();

        if (kolo == null)
            throw new Exception("Ne postoji kolo sa tim brojem u izabranom takmicenju.");

            return new OkObjectResult(kolo);
        }
 public async Task<object?> VratiStatistikuUtakmiceAsync(int utakmicaID, SportType sportType)
{
    if (sportType == SportType.Fudbal)
    { 
      
        var res = await _context.Set<FudbalStatistika>()
            .Where(s => s.UtakmicaId==utakmicaID)
            .Select(s => new
            {
                DomGolovi       = s.GoloviDomacin,
                DomAsistencije=s.AsistencijeDomacin,
                GosAsistencije=s.AsistencijeGost,
                GosGolovi       = s.GoloviGost,
                DomSutevi       = s.SutDomacin,
                GosSutevi       = s.SutGost,
                DomSutGol       = s.SutKaGolDomacin,
                GosSutGol       = s.SutKaGolGost,
                DomPosed        = s.PosedDomacin,
                GosPosed        = s.PosedGost,
                DomPreciznost   = s.PreciznostPasovaDomacin,
                GosPreciznost   = s.PreciznostPasovaGost,
                DomZuti         = s.ZutiKartoniDomacin,
                GosZuti         = s.ZutiKartoniGost,
                DomCrveni       = s.CrveniKartoniDomacin,
                GosCrveni       = s.CrveniKartoniGost
            })
            .FirstOrDefaultAsync();

        return res;
    }
    if (sportType == SportType.Kosarka)
    { 
      
        var res = await _context.Set<KosarkaStatistika>()
            .Where(s => s.UtakmicaId==utakmicaID)
            .Select(s => new
            {
                DomPrva       = s.PrvaCetDomacin,
                GosPrva       = s.PrvaCetGost,
                DomDruga       = s.DrugaCetDomacin,
                GosDruga       = s.DrugaCetGost,
                DomTreca       = s.TrecaCetDomacin,
                GosTreca       = s.TrecaCetGost,
                DomCetvrta        = s.CetvCetDomacin,
                GosCetvrta        = s.CetvCetGost,
                DomAsistencije=s.AsistencijeDomacin,
                GosAsistencije=s.AsistencijeGost,
                DomDva   = s.TwoPointDomacin,
                GosDva   = s.TwoPointGost,
                DomTri         = s.ThreePointDomacin,
                GosTri         = s.ThreePointGost,
                DomPenali       = s.FreeThrowDomacin,
                GosPenali       = s.FreeThrowGost,
                DomSkok=s.ReboundsDomacin,
                GosSkok=s.ReboundsGost,
                DomUkradene=s.StealsDomacin,
                GosUkradene=s.StealsGost,
                DomBlok=s.BlocksDomacin,
                GosBlok=s.BlocksGost,
                
            })
            .FirstOrDefaultAsync();

        return res;
    }
 if (sportType == SportType.Vaterpolo)
    { 
      
        var res = await _context.Set<VaterpoloStatistika>()
            .Where(s => s.UtakmicaId==utakmicaID)
            .Select(s => new
            {
                DomGolovi =s.VP_PrvaCetDomacin+s.VP_DrugaCetDomacin+s.VP_TrecaCetDomacin+s.VP_CetvCetDomacin,
                GosGolovi =s.VP_PrvaCetGost+s.VP_DrugaCetGost+s.VP_TrecaCetGost+s.VP_CetvCetGost,
                DomPrva       = s.VP_PrvaCetDomacin,
                GosPrva       = s.VP_PrvaCetGost,
                DomDruga       = s.VP_DrugaCetDomacin,
                GosDruga       = s.VP_DrugaCetGost,
                DomTreca       = s.VP_TrecaCetDomacin,
                GosTreca       = s.VP_TrecaCetGost,
                DomCetvrta        = s.VP_CetvCetDomacin,
                GosCetvrta        = s.VP_CetvCetGost,
                DomAsistencije=s.AsistencijeDomacin,
                GosAsistencije=s.AsistencijeGost,
                DomIskljucenja   = s.IskljucenjaDomacin,
                GosIskljucenja   = s.IskljucenjaGost,
                DomPet         = s.PeterciDomacin,
                GosPet         = s.PeterciGost
            })
            .FirstOrDefaultAsync();

        return res;
    }

    
    throw new Exception("Niste izabrali validan sport");
}
    public async Task KorisnikSaljePorukuZaUtakmicuAsync(int korisnikID,int utakmicaID,PorukaSadrzaj sadrzaj)
        {
            var postoji=await _context.Set<Korisnik>().FirstOrDefaultAsync(k=>k.Id==korisnikID);
            if(postoji==null)
                throw new Exception("ID korisnika nije pronadjen");
             var utakmica=await _context.Set<Utakmica>().FirstOrDefaultAsync(k=>k.Id==utakmicaID);
            if(utakmica==null)
                throw new Exception("ID utakmice nije pronadjen");
            var poruka=new Poruka
            {
                Id=Guid.NewGuid().ToString(),
                PosiljaocID=korisnikID,
                PrimaocID=utakmicaID,
                Sadrzaj=sadrzaj.Sadrzaj,
                PosiljaocUsername=postoji.Username,
                Dan=DateTime.Now.ToString("dddd", System.Globalization.CultureInfo.InvariantCulture),
                VremeSlanjaPoruke=DateTime.Now.ToString("hh:mmtt", System.Globalization.CultureInfo.InvariantCulture),
                TacnoVreme=DateTime.Now


            };
            var key = $"poruka:{poruka.Id}";

            var json = JsonConvert.SerializeObject(poruka);
            await _db.StringSetAsync(key, json);

            var dto= new porukaDTO
            {
                Id=poruka.Id,
                Utakmica=utakmicaID,
                Username=poruka.PosiljaocUsername,
                Text=poruka.Sadrzaj,
                Time=poruka.VremeSlanjaPoruke,
                Day=poruka.Dan
            };
            await _hubContext.Clients.All.SendAsync($"DodataPorukaUtakmici{utakmicaID}",dto);
                        
            
        }
    public async Task<List<Poruka>> VratiPorukeKorisnikUtakmicaAsync(int utakmicaID) 
        {
            
               

                // 1) nadjemo sve kljuceve za poruke
                var keys = _server.Keys(pattern: "poruka:*");
                if(keys==null)
                    throw new Exception("Nema chatova u bazi");
                var rezultat = new List<Poruka>();

                foreach (var key in keys)
                {
                    var value = await _db.StringGetAsync(key);

                    if (value.IsNullOrEmpty)
                        continue;

                    var poruka = JsonConvert.DeserializeObject<Poruka>(value!);

                    if (poruka is null)
                        continue;

                   
                    if (poruka.PrimaocID == utakmicaID)
                        rezultat.Add(poruka);
                }
                if(rezultat.Count == 0)
                    throw new Exception("Ne postoji chat za datu utakmicu");
               var sortirane = rezultat
                            .OrderBy(p => p.TacnoVreme)            
                            .ToList();

                return sortirane;
        }

     public async Task ObrisiPorukuUtakmciAsync(string porukaId,int utakmicaId)
        {
             var key = $"poruka:{porukaId}";
            await _db.KeyDeleteAsync(key);
            await _hubContext.Clients.All.SendAsync($"ObrisanaPoruka{utakmicaId}",porukaId);
        }
  public async Task<List<KlubTakmicenje>> VratiTabeluTakmicenjaAsync(int takmicenjeID, string sezona,string nazivTabele)
{
    var s=Uri.UnescapeDataString(sezona);
    var n=Uri.UnescapeDataString(nazivTabele);
    
    var tabela = await _context.Set<Tabela>()
        .Where(t => t.TakmicenjeId == takmicenjeID && t.Sezona == s&&t.NazivTabele==n)
        .Select(obj => new KlubTakmicenje
        {
            KlubId          = obj.KlubId,
            Logo             =obj.Klub.LogoURL,
            Klub            = obj.Klub.Naziv,
            Odigrane        = obj.Odigrane,
            Pobeda          = obj.Pobede,
            Neresene        = obj.Neresene,
            Porazi          = obj.Izgubljene,
            Bodovi          = obj.BrojBodova,
            DatiPoeni       = obj.BrojDatihPoena,
            PrimljeniPoeni  = obj.BrojPrimljenihPoena,
            Razlika         = obj.Razlika,
            PoslednjihPet   = new List<int>()
        })
        .OrderByDescending(p=>p.Bodovi)
        .ToListAsync();

    var kola = await _context.Set<Kolo>()
        .Where(p => p.TakmicenjeId == takmicenjeID && p.Sezona == s)
        .Include(k => k.Utakmice)
        .OrderBy(p => p.PocetakKola)
        .ToListAsync();

    foreach (var red in tabela)
    {
        int i = 0;

        foreach (var kolo in kola)
        {
            if (i == 4) break;

            var utakmica = kolo.Utakmice
                .FirstOrDefault(p => p.Domacin == red.Klub || p.Gost == red.Klub);

            if (utakmica == null || string.IsNullOrWhiteSpace(utakmica.Rezultat))
                continue;

            var delovi = utakmica.Rezultat.Split(':');
            if (delovi.Length != 2) continue;

            if (!int.TryParse(delovi[0], out var pogotciDomacin)) continue;
            if (!int.TryParse(delovi[1], out var pogotciGost)) continue;

            if (utakmica.Domacin == red.Klub && pogotciDomacin > pogotciGost ||
                utakmica.Gost == red.Klub && pogotciGost > pogotciDomacin)
            {
                red.PoslednjihPet.Add(3);
            }
            else if (pogotciDomacin == pogotciGost)
            {
                red.PoslednjihPet.Add(1);
            }
            else
            {
                red.PoslednjihPet.Add(0);
            }

            i++;
        }
    }

    return tabela;
}

public async Task<object?> VratiKriterijumePretrageTakmicenjaAsync(int takmicenjeId)
        {
           
            List<string> result=await _context.Set<Tabela>()
            .Where(p=>p.TakmicenjeId==takmicenjeId)
            .Select(p=>p.Sezona)
            .Distinct()
            .ToListAsync();
            List<string> nazivi=await _context.Set<Tabela>()
            .Where(p=>p.TakmicenjeId==takmicenjeId)
            .Select(p=>p.NazivTabele)
            .Distinct()
            .ToListAsync();
            SportType sport=await _context.Set<Takmicenje>().Where(p=>p.Id==takmicenjeId).Select(p=>p.Sport).FirstOrDefaultAsync();
            List<string>ListaKriterijuma=new List<string>();
            switch(sport)
            {
                case SportType.Fudbal:
                
                   
                    ListaKriterijuma.Add("Indeks korisnosti");
                    ListaKriterijuma.Add("Lista strelaca");
                      ListaKriterijuma.Add("Lista asistenata");
                       ListaKriterijuma.Add("Najefikasniji igrači");
                       ListaKriterijuma.Add("Najprecizniji igrači");
                       ListaKriterijuma.Add("Najgrublji igrači");
                       

                    
                    return new
                    {
                        ListaKriterijuma=ListaKriterijuma,
                        Sezone=result,
                        Nazivi=nazivi

                        
                    };
                    
                case SportType.Kosarka:
                  
                    ListaKriterijuma.Add("Indeks korisnosti");
                    ListaKriterijuma.Add("Najbolji strelci");
                      ListaKriterijuma.Add("Najbolji asistenti");
                       ListaKriterijuma.Add("Najbolji skakači");
                       ListaKriterijuma.Add("Najbolji kradljivci");
                       ListaKriterijuma.Add("Najbolji blokeri");
                       ListaKriterijuma.Add("Najagresvniji igrači");
                       
                         
                    return new
                    {
                        ListaKriterijuma=ListaKriterijuma,
                        Sezone=result,
                        Nazivi=nazivi

                        
                    };
                   
                default:
                 ListaKriterijuma.Add("Indeks korisnosti");
                    ListaKriterijuma.Add("Najbolji strelci");
                      ListaKriterijuma.Add("Najbolji asistenti");;
                       ListaKriterijuma.Add("Najbolji blokeri");
                       ListaKriterijuma.Add("Najagresvniji igrači");
                       
                         
                    return new
                    {
                        ListaKriterijuma=ListaKriterijuma,
                        Sezone=result,
                        Nazivi=nazivi

                        
                    };
                   
            }
            throw new Exception("Izabran je nevalidan sport");
            
        }
public async Task<List<object>> VratiIgracePoKriterijumuAsync(int takmicenjeId,int kriterijum,string sezona)
        {
            var koliko = await _context.Set<Kolo>()
        .Where(t => t.TakmicenjeId == takmicenjeId)
        .CountAsync();
          var sport=await _context.Set<Takmicenje>().Where(p=>p.Id==takmicenjeId).Select(p=>p.Sport).FirstOrDefaultAsync();
           var sez=Uri.UnescapeDataString(sezona);
          if(sport==SportType.Fudbal)
            {
                if(kriterijum==-1)
                {
                       var fudbal= await _context.Set<Ucinak>()
                                    .Include(p=>p.Igrac)
                                    .ThenInclude(p=>p.Klub)
                                    .Where(p=>p.TakmicenjeId==takmicenjeId&&p.Sezona==sez)
                                    .Select(p=>new
                                    {
                                        UcinakId=p.Id,
                                        IgracId=p.IgracId,
                                        Igrac=$"{p.Igrac.Ime} {p.Igrac.Prezime}",
                                          Klub=p.NazivKluba,
                                        Golovi=p.Pogotci,
                                        Asistencije=p.Asistencije,
                                        Odigrane=p.OdigraneUtakmice,
                                        PredjenaDistanca=p.PredjenaDistancaKM,
                                        IagubljeneLopte=p.IzgubljeneLopte,
                                        IzblokiranihUdaraca=p.BlokiraniUdarci,
                                        UkupnoSuteva=p.UkupnoSuteva,
                                        UkupnoDodavanja=p.UkupnoDodavanja,
                                        UkupnoTacnih=p.UkupnoTacnihDodavanja,
                                        UkupnoFaula=p.UkupnoFaula,
                                        Zuti=p.ZutiKartoni,
                                        Crveni=p.CrveniKartoni,
                                        IndeksKorisnosti=p.IndeksKorisnosti

                                    })
                                    .OrderBy(p=>p.Klub)
                                    .ToListAsync();
                                    // List<Ucinak> result = fudbal.Cast<Ucinak>().ToList();
                                    List<object> res=fudbal.Cast<object>().ToList();
                                  return  res;
                    
                }
                else if(kriterijum==0)
                {
                    
                        var fudbal= await _context.Set<Ucinak>()
                                    .Where(p=>p.TakmicenjeId==takmicenjeId&&p.Sezona==sez)
                                    .Select(p => new 
                                    {
                                        Igrac=$"{p.Igrac.Ime} {p.Igrac.Prezime}",
                                         Klub=p.NazivKluba,
                                        Odigrane=p.OdigraneUtakmice,
                                        UkupnoUtakmica=koliko,
                                        PasIndeks=p.UkupnoTacnihDodavanja-(p.UkupnoDodavanja-p.UkupnoTacnihDodavanja),
                                        SutIndeks=p.Pogotci*3-(p.UkupnoSuteva*0.5+p.BlokiraniUdarci),
                                        FerPlej=((int)p.CrveniKartoni*(-1)+(int)p.ZutiKartoni*(-1)+(int)p.UkupnoFaula*(-1)),
                                        IndeksKorisnosti=p.IndeksKorisnosti



                                        
                                    })
                                    .OrderByDescending(p=>p.IndeksKorisnosti)
                                    .Take(20)
                                    .ToListAsync();
                                    //List<Indeks> result = fudbal.Cast<Indeks>().ToList();
                                    List<object> res=fudbal.Cast<object>().ToList();
                                  return  res;
                        
                }
                else if(kriterijum==1)
                {
                    
                        var fudbal= await _context.Set<Ucinak>()
                                    .Where(p=>p.TakmicenjeId==takmicenjeId&&p.Sezona==sez)
                                    .Select(p => new
                                    {
                                        Igrac=$"{p.Igrac.Ime} {p.Igrac.Prezime}",
                                         Klub=p.NazivKluba,
                                        Odigrane=p.OdigraneUtakmice,
                                        UkupnoUtakmica=koliko,
                                        Golovi=p.Pogotci
                                    })
                                    .OrderByDescending(p=>p.Golovi)
                                    .Take(20)
                                    .ToListAsync();
                                    List<object> res=fudbal.Cast<object>().ToList();
                                    return res;
                    
                }
                else if(kriterijum==2)
                {
                    var fudbal= await _context.Set<Ucinak>()
                                   .Where(p=>p.TakmicenjeId==takmicenjeId&&p.Sezona==sez)
                                    .Select(p => new
                                    {
                                        Igrac=$"{p.Igrac.Ime} {p.Igrac.Prezime}",
                                          Klub=p.NazivKluba,
                                        Odigrane=p.OdigraneUtakmice,
                                        UkupnoUtakmica=koliko,
                                        Asistencije=p.Asistencije
                                    })
                                    .OrderByDescending(p=>p.Asistencije)
                                    .Take(20)
                                    .ToListAsync();
                                    List<object> res=fudbal.Cast<object>().ToList();
                                    return res;
                }
                else if(kriterijum==3)
                {
                       var fudbal= await _context.Set<Ucinak>()
                                    .Where(p=>p.TakmicenjeId==takmicenjeId&&p.Sezona==sez)
                                    .Select(p => new
                                    {
                                        Igrac=$"{p.Igrac.Ime} {p.Igrac.Prezime}",
                                         Klub=p.NazivKluba,
                                        Odigrane=p.OdigraneUtakmice,
                                        UkupnoUtakmica=koliko,
                                        Golovi=p.Pogotci,
                                        Sutevi=p.UkupnoSuteva,
                                        Procenat=p.UkupnoSuteva!=0?(p.Pogotci/p.UkupnoSuteva)*100:0
                                    })
                                    .OrderByDescending(p=>p.Golovi)
                                    .Take(20)
                                    .ToListAsync();
                                    List<object> res=fudbal.Cast<object>().ToList();
                                    return res;
                }
                  else if(kriterijum==4)
                {
                       var fudbal= await _context.Set<Ucinak>()
                                    .Where(p=>p.TakmicenjeId==takmicenjeId&&p.Sezona==sez)
                                    .Select(p => new
                                    {
                                         Igrac=$"{p.Igrac.Ime} {p.Igrac.Prezime}",
                                         Klub=p.NazivKluba,
                                        Odigrane=p.OdigraneUtakmice,
                                        UkupnoUtakmica=koliko,
                                        Tacni=p.UkupnoTacnihDodavanja,
                                        UkupnoDod=p.UkupnoDodavanja,
                                        Procenat=p.UkupnoDodavanja!=0?(p.UkupnoTacnihDodavanja/p.UkupnoDodavanja)*100:0
                                    })
                                    .OrderByDescending(p=>p.UkupnoDod)
                                    .Take(20)
                                    .ToListAsync();
                                    List<object> res=fudbal.Cast<object>().ToList();
                                    return res;
                }
                else
                {
                       var fudbal= await _context.Set<Ucinak>()
                                   .Where(p=>p.TakmicenjeId==takmicenjeId&&p.Sezona==sez)
                                    .Select(p => new
                                    {
                                         Igrac=$"{p.Igrac.Ime} {p.Igrac.Prezime}",
                                         Klub=p.NazivKluba,
                                        Odigrane=p.OdigraneUtakmice,
                                        UkupnoUtakmica=koliko,
                                        Fauli=p.UkupnoFaula,
                                        Zuti=p.ZutiKartoni,
                                        Crveni=p.CrveniKartoni                                    })
                                    .OrderByDescending(p=>p.Fauli)
                                    .Take(20)
                                    .ToListAsync();
                                    List<object> res=fudbal.Cast<object>().ToList();
                                    return res;
                    
                }
                throw new Exception("Greska");
            }
          else if(sport==SportType.Kosarka)
            {
                if(kriterijum==-1)
                {
                       var kosarka= await _context.Set<Ucinak>()
                                    .Include(p=>p.Igrac)
                                    .ThenInclude(p=>p.Klub)
                                    .Where(p=>p.TakmicenjeId==takmicenjeId&&p.Sezona==sez)
                                    .Select(p=>new
                                    {
                                        UcinakId=p.Id,
                                        IgracId=p.IgracId,
                                        Igrac=$"{p.Igrac.Ime} {p.Igrac.Prezime}",
                                        Klub=p.NazivKluba,
                                        PoenaPoMecu=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.Pogotci/p.OdigraneUtakmice,2),
                                        AsistencijaPoMecu=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.Asistencije/p.OdigraneUtakmice,2),
                                        Odigrane=p.OdigraneUtakmice,
                                        SkokovaPoMecu=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.Skokovi/p.OdigraneUtakmice,2),
                                        OfanzivniPoMecu=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.SkokoviOF/p.OdigraneUtakmice,2),
                                        Defanzivni=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.SkokoviDF/p.OdigraneUtakmice,2),
                                        UkupnoSuteva=p.UkupnoSuteva,
                                        ProcenatSuteva=p.UkupnoSuteva==0?0:Math.Round((((decimal)p.Pogotci/2)/p.UkupnoSuteva)*100,2),
                                        Fauli=p.UkupnoFaula,
                                        Blokade=p.BlokiraniUdarci,
                                        Izgubljene=p.IzgubljeneLopte,
                                        Ukradene=p.UkradeneLopte,
                                        IndeksKorisnosti=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.IndeksKorisnosti/p.OdigraneUtakmice,2)

                                    })
                                    .OrderBy(p=>p.Klub)
                                    .ToListAsync();
                                  
                                    List<object> res=kosarka.Cast<object>().ToList();
                                  return  res;
                    
                }
                else if(kriterijum==0)
                {
                      var kosarka= await _context.Set<Ucinak>()
                                    .Include(p=>p.Igrac)
                                    .ThenInclude(p=>p.Klub)
                                    .Where(p=>p.TakmicenjeId==takmicenjeId&&p.Sezona==sez)
                                    .Select(p => new 
                                    {
                                        Igrac=p.Igrac.Ime,
                                        Klub=p.NazivKluba,
                                        Odigrane=p.OdigraneUtakmice,
                                        UkupnoUtakmica=koliko,
                                        AsistencijeIndeks=p.Asistencije,
                                        BlokadeIndeks=p.BlokiraniUdarci,
                                        SkokoviIndeks=p.Skokovi==null?0:(int)p.Skokovi,
                                        UkradeneLopteIndeks=p.UkradeneLopte,
                                        PromasajiIndeks=0-(p.UkupnoSuteva-p.Pogotci/2),
                                        IzgubljeneLopteIndeks=0-p.IzgubljeneLopte,
                                        FerPlejIndeks=p.UkupnoFaula==null?0:(int)(0-p.UkupnoFaula),
                                        IndeksKorisnostiPoMecu=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.IndeksKorisnosti/p.OdigraneUtakmice,2)



                                        
                                    })
                                    .OrderByDescending(p=>p.IndeksKorisnostiPoMecu)
                                    .Take(20)
                                    .ToListAsync();
                                   // List<Indeks> result = kosarka.Cast<Indeks>().ToList();
                                    List<object> res=kosarka.Cast<object>().ToList();
                                  return  res;
                }
                else if (kriterijum==1)
                {
                      var kosarka= await _context.Set<Ucinak>()
                                    .Include(p=>p.Igrac)
                                    .ThenInclude(p=>p.Klub)
                                    .Where(p=>p.TakmicenjeId==takmicenjeId&&p.Sezona==sez)
                                    .Select(p => new 
                                    {
                                         Igrac=$"{p.Igrac.Ime} {p.Igrac.Prezime}",
                                        Klub=p.NazivKluba,
                                        Odigrane=p.OdigraneUtakmice,
                                        UkupnoUtakmica=koliko,
                                        UkupnoPoena=p.Pogotci,
                                        UkupnoSuteva=p.UkupnoSuteva,
                                        ProcenatSuta=p.UkupnoSuteva==0?0:Math.Round(( ((decimal)p.Pogotci/2)/p.UkupnoSuteva)*100,2),
                                        ProsecnoPoena=p.OdigraneUtakmice==0?0:Math.Round(((decimal)p.Pogotci/p.OdigraneUtakmice),2)





                                        
                                    })
                                    .OrderByDescending(p=>p.ProsecnoPoena)
                                    .Take(20)
                                    .ToListAsync();
                                  
                                    List<object> res=kosarka.Cast<object>().ToList();
                                  return  res;
                    
                }
                 else if (kriterijum==2)
                {
                      var kosarka= await _context.Set<Ucinak>()
                                    .Where(p=>p.TakmicenjeId==takmicenjeId&&p.Sezona==sez)
                                    .Select(p => new 
                                    {
                                         Igrac=$"{p.Igrac.Ime} {p.Igrac.Prezime}",
                                        Klub=p.NazivKluba,
                                        Odigrane=p.OdigraneUtakmice,
                                        UkupnoUtakmica=koliko,
                                        UkupnoAsistencija=p.Asistencije,
                                        ProsecnoAsistencija=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.Asistencije/p.OdigraneUtakmice,2)





                                        
                                    })
                                    .OrderByDescending(p=>p.ProsecnoAsistencija)
                                    .Take(20)
                                    .ToListAsync();
                                  
                                    List<object> res=kosarka.Cast<object>().ToList();
                                  return  res;
                    
                }
                else if(kriterijum==3)
                {
                      var kosarka= await _context.Set<Ucinak>()
                                    .Where(p=>p.TakmicenjeId==takmicenjeId&&p.Sezona==sez)
                                    .Select(p => new 
                                    {
                                         Igrac=$"{p.Igrac.Ime} {p.Igrac.Prezime}",
                                       Klub=p.NazivKluba,
                                        Odigrane=p.OdigraneUtakmice,
                                        UkupnoUtakmica=koliko,
                                        UkupnoSkokovaOF=p.SkokoviOF,
                                        UkupnoSkokovaDF=p.SkokoviDF,
                                        UkupnoSkokova=p.Skokovi,
                                        ProsecnoOF=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.SkokoviOF/p.OdigraneUtakmice,2),
                                        ProsecnoDF=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.SkokoviDF/p.OdigraneUtakmice,2),
                                        ProsecnoSkokova=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.Skokovi/p.OdigraneUtakmice,2)
                                        





                                        
                                    })
                                    .OrderByDescending(p=>p.ProsecnoSkokova)
                                    .Take(20)
                                    .ToListAsync();
                                  
                                    List<object> res=kosarka.Cast<object>().ToList();
                                  return  res;
                    
                }
                else if(kriterijum==4)
                {
                     var kosarka= await _context.Set<Ucinak>()
                                    .Where(p=>p.TakmicenjeId==takmicenjeId&&p.Sezona==sez)
                                    .Select(p => new 
                                    {
                                         Igrac=$"{p.Igrac.Ime} {p.Igrac.Prezime}",
                                          Klub=p.NazivKluba,
                                        Odigrane=p.OdigraneUtakmice,
                                        UkupnoUtakmica=koliko,
                                        UkupnoUkradenihLopti=p.UkradeneLopte,
                                        UkupnoIzgubljenihLopti=p.IzgubljeneLopte,
                                        UkupanBilans=p.UkradeneLopte-p.IzgubljeneLopte,
                                        ProsecnoUkradenihLopti=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.UkradeneLopte/p.OdigraneUtakmice,2),
                                        ProsecnoIzgubljenihLopti=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.IzgubljeneLopte/p.OdigraneUtakmice,2),
                                        ProsecanBilans=Math.Round((p.OdigraneUtakmice==0?0:(decimal)p.UkradeneLopte/p.OdigraneUtakmice)-(p.OdigraneUtakmice==0?0:(decimal)p.IzgubljeneLopte/p.OdigraneUtakmice),2)
                                        
                                        





                                        
                                    })
                                    .OrderByDescending(p=>p.ProsecnoUkradenihLopti)
                                    .Take(20)
                                    .ToListAsync();
                                  
                                    List<object> res=kosarka.Cast<object>().ToList();
                                  return  res;
                }
                else if (kriterijum==5)
                {
                                  var kosarka= await _context.Set<Ucinak>()
                                    .Where(p=>p.TakmicenjeId==takmicenjeId&&p.Sezona==sez)
                                    .Select(p => new 
                                    {
                                         Igrac=$"{p.Igrac.Ime} {p.Igrac.Prezime}",
                                          Klub=p.NazivKluba,
                                        Odigrane=p.OdigraneUtakmice,
                                        UkupnoUtakmica=koliko,
                                       
                                        UkupnoBlokada=p.BlokiraniUdarci,
                                       
                                        ProsecnoBlokada=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.BlokiraniUdarci/p.OdigraneUtakmice,2)
                                        
                                        





                                        
                                    })
                                    .OrderByDescending(p=>p.ProsecnoBlokada)
                                    .Take(20)
                                    .ToListAsync();
                                  
                                    List<object> res=kosarka.Cast<object>().ToList();
                                  return  res;
                    
                }
                else
                {
                       var kosarka= await _context.Set<Ucinak>()
                                    .Where(p=>p.TakmicenjeId==takmicenjeId&&p.Sezona==sez)
                                    .Select(p => new 
                                    {
                                        Igrac=$"{p.Igrac.Ime} {p.Igrac.Prezime}",
                                         Klub=p.NazivKluba,
                                        Odigrane=p.OdigraneUtakmice,
                                        UkupnoUtakmica=koliko,
                                       
                                        UkupnoFaula=p.UkupnoFaula,
                                       
                                        ProsecnoFaula=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.UkupnoFaula/p.OdigraneUtakmice,2)
                                        
                                        





                                        
                                    })
                                    .OrderByDescending(p=>p.ProsecnoFaula)
                                    .Take(20)
                                    .ToListAsync();
                                  
                                    List<object> res=kosarka.Cast<object>().ToList();
                                  return  res;
                    
                }
            
            }
            else
            {
                if(kriterijum==-1)
                {
                       var vaterpolo= await _context.Set<Ucinak>()
                                    .Include(p=>p.Igrac)
                                    .ThenInclude(p=>p.Klub)
                                    .Where(p=>p.TakmicenjeId==takmicenjeId&&p.Sezona==sez)
                                    .Select(p=>new
                                    {
                                        UcinakId=p.Id,
                                        IgracId=p.IgracId,
                                        Igrac=$"{p.Igrac.Ime} {p.Igrac.Prezime}",
                                        Klub=p.NazivKluba,
                                        GolovaPoMecu=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.Pogotci/p.OdigraneUtakmice,2),
                                        AsistencijaPoMecu=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.Asistencije/p.OdigraneUtakmice,2),
                                        Odigrane=p.OdigraneUtakmice,
                                        IzgubljenePoMecu=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.IzgubljeneLopte/p.OdigraneUtakmice,2),
                                        BlokadePoMecu=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.BlokiraniUdarci/p.OdigraneUtakmice,2),
                                        VraceniPosediPoMecu=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.VraceniPosedi/p.OdigraneUtakmice,2),
                                        IskljucenjaPoMecu=p.OdigraneUtakmice==0?0:Math.Round((decimal)(p.Iskljucenja*1.5)/p.OdigraneUtakmice,2),
                                        FauliPoMecu=p.OdigraneUtakmice==0?0:Math.Round((decimal)(p.UkupnoFaula*0.8)/p.OdigraneUtakmice,2),
                                        Blokade=p.BlokiraniUdarci,
                                        IndeksKorisnosti=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.IndeksKorisnosti/p.OdigraneUtakmice,2)

                                    })
                                    .OrderBy(p=>p.Klub)
                                    .ToListAsync();
                                  
                                    List<object> res=vaterpolo.Cast<object>().ToList();
                                  return  res;
                    
                }
                else if (kriterijum==0)
                {
                     var vaterpolo= await _context.Set<Ucinak>()
                                    .Include(p=>p.Igrac)
                                    .ThenInclude(p=>p.Klub)
                                    .Where(p=>p.TakmicenjeId==takmicenjeId&&p.Sezona==sez)
                                    .Select(p => new 
                                    {
                                        Igrac=p.Igrac.Ime,
                                        Klub=p.NazivKluba,
                                        Odigrane=p.OdigraneUtakmice,
                                        UkupnoUtakmica=koliko,
                                        AsistencijeIndeks=p.Asistencije,
                                        BlokadeIndeks=p.BlokiraniUdarci,
                                        VraceniPosediIndeks=p.VraceniPosedi,
                                        IzgubljeneLopteIndeks=0-p.IzgubljeneLopte,
                                        FerPlejIndeks=p.UkupnoFaula==null?0:(int)(0-p.UkupnoFaula),
                                        IndeksKorisnostiPoMecu=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.IndeksKorisnosti/p.OdigraneUtakmice,2)



                                        
                                    })
                                    .OrderByDescending(p=>p.IndeksKorisnostiPoMecu)
                                    .Take(20)
                                    .ToListAsync();
                                   // List<Indeks> result = kosarka.Cast<Indeks>().ToList();
                                    List<object> res=vaterpolo.Cast<object>().ToList();
                                  return  res;

                }
                else if (kriterijum==1)
                {
                      var vaterpolo= await _context.Set<Ucinak>()
                                    .Include(p=>p.Igrac)
                                    .ThenInclude(p=>p.Klub)
                                    .Where(p=>p.TakmicenjeId==takmicenjeId&&p.Sezona==sez)
                                    .Select(p => new 
                                    {
                                         Igrac=$"{p.Igrac.Ime} {p.Igrac.Prezime}",
                                        Klub=p.NazivKluba,
                                        Odigrane=p.OdigraneUtakmice,
                                        UkupnoUtakmica=koliko,
                                        UkupnoGolova=p.Pogotci,
                                        ProsecnoGolova=p.OdigraneUtakmice==0?0:Math.Round(((decimal)p.Pogotci/p.OdigraneUtakmice),2)





                                        
                                    })
                                    .OrderByDescending(p=>p.ProsecnoGolova)
                                    .Take(20)
                                    .ToListAsync();
                                  
                                    List<object> res=vaterpolo.Cast<object>().ToList();
                                  return  res;
                }
                else if (kriterijum==2)
                {
                    var vaterpolo= await _context.Set<Ucinak>()
                                    .Where(p=>p.TakmicenjeId==takmicenjeId&&p.Sezona==sez)
                                    .Select(p => new 
                                    {
                                         Igrac=$"{p.Igrac.Ime} {p.Igrac.Prezime}",
                                        Klub=p.NazivKluba,
                                        Odigrane=p.OdigraneUtakmice,
                                        UkupnoUtakmica=koliko,
                                        UkupnoAsistencija=p.Asistencije,
                                        ProsecnoAsistencija=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.Asistencije/p.OdigraneUtakmice,2)





                                        
                                    })
                                    .OrderByDescending(p=>p.ProsecnoAsistencija)
                                    .Take(20)
                                    .ToListAsync();
                                  
                                    List<object> res=vaterpolo.Cast<object>().ToList();
                                  return  res;
                    
                }
                else if (kriterijum==5)
                {
                      var vaterpolo= await _context.Set<Ucinak>()
                                    .Where(p=>p.TakmicenjeId==takmicenjeId&&p.Sezona==sez)
                                    .Select(p => new 
                                    {
                                         Igrac=$"{p.Igrac.Ime} {p.Igrac.Prezime}",
                                          Klub=p.NazivKluba,
                                        Odigrane=p.OdigraneUtakmice,
                                        UkupnoUtakmica=koliko,
                                       
                                        UkupnoBlokada=p.BlokiraniUdarci,
                                       
                                        ProsecnoBlokada=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.BlokiraniUdarci/p.OdigraneUtakmice,2)
                                        
                                        





                                        
                                    })
                                    .OrderByDescending(p=>p.ProsecnoBlokada)
                                    .Take(20)
                                    .ToListAsync();
                                  
                                    List<object> res=vaterpolo.Cast<object>().ToList();
                                  return  res;
                }
                else
                {
                    var vaterpolo= await _context.Set<Ucinak>()
                                    .Where(p=>p.TakmicenjeId==takmicenjeId&&p.Sezona==sez)
                                    .Select(p => new 
                                    {
                                        Igrac=$"{p.Igrac.Ime} {p.Igrac.Prezime}",
                                         Klub=p.NazivKluba,
                                        Odigrane=p.OdigraneUtakmice,
                                        UkupnoUtakmica=koliko,
                                       
                                        UkupnoFaula=p.UkupnoFaula,
                                        UkupnoIskljucenja=p.Iskljucenja,
                                       
                                        ProsecnoIskljucenja=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.Iskljucenja/p.OdigraneUtakmice,2),
                                        ProsecnoFaula=p.OdigraneUtakmice==0?0:Math.Round((decimal)p.UkupnoFaula/p.OdigraneUtakmice,2)
                                        
                                        





                                        
                                    })
                                    .OrderByDescending(p=>p.ProsecnoFaula)
                                    .Take(20)
                                    .ToListAsync();
                                  
                                    List<object> res=vaterpolo.Cast<object>().ToList();
                                  return  res;
                }
            }
        }
public async Task<List<object>> VratiKluboveAsync(SportType sport,int? korisnikID)
        {
            var result=await _context.Set<Klub>()
                        .Where(p=>p.Sport==sport)
                        .Select(p=>new
                        {
                            Id=p.Id,
                            Naziv=p.Naziv,
                            Logo=p.LogoURL,
                            Takicenja=p.Takmicenja.Select(s=>s.Takmicenje.Naziv).ToList(),
                            Sponzori=p.Sponzori,
                            BrojPratioca=p.Pratioci.Count,
                            KorisnikPrati=korisnikID==null||p.Pratioci.FirstOrDefault(z=>z.Id==korisnikID)==null?false:true,
                            Prihodi=p.Prihodi,
                            Rashodi=p.Rashodi,
                            Istorija=p.Istorija,
                            Trofeiji=p.Trofeji,
                            Adresa=p.Adresa,
                            Email=p.Email
                        })
                        .OrderBy(p=>p.Naziv)
                        .ToListAsync();
                if(result.Count==0)
                    throw new Exception("Nema klubova tog sporta u bazi");
            List<object> res=result.Cast<object>().ToList();
                                  
            return res;
        }
public async Task<object>VratiKlubAsync(SportType sport,string nazivKluba,int? korisnikID)
{
        var result=await _context.Set<Klub>()
                .Where(p=>p.Sport==sport&&p.Naziv==nazivKluba)
                .Select(p=>new
                {
                    Id=p.Id,
                    Naziv=p.Naziv,
                    Logo=p.LogoURL,
                    Takicenja=p.Takmicenja.Select(s=>s.Takmicenje.Naziv).ToList(),
                    Sponzori=p.Sponzori,
                    BrojPratioca=p.Pratioci.Count,
                    KorisnikPrati=korisnikID==null||p.Pratioci.FirstOrDefault(z=>z.Id==korisnikID)==null?false:true,
                    Prihodi=p.Prihodi,
                    Rashodi=p.Rashodi,
                    Istorija=p.Istorija,
                    Trofeiji=p.Trofeji,
                    Adresa=p.Adresa,
                    Email=p.Email
                })
                .FirstOrDefaultAsync();
        if(result==null)
            throw new Exception("Nema klub tog sporta u bazi");
    return result;
}
public async Task ZapratiKlubAsync(int korisnikID,int klubID)
{
    var postojiKorisnik=await _context.Set<Korisnik>().Include(p=>p.PraceniKlubovi).FirstOrDefaultAsync(p=>p.Id==korisnikID);
    if(postojiKorisnik==null)
        throw new Exception("Nije pronadjen korisnik u bazi");
    var postojiKlub=await _context.Set<Klub>().Include(p=>p.Pratioci).FirstOrDefaultAsync(p=>p.Id==klubID);
    if(postojiKlub==null)
        throw new Exception("Nije pronadjen klub u bazi");
    if (!postojiKorisnik.PraceniKlubovi.Any(k => k.Id == klubID))
    {
            postojiKorisnik.PraceniKlubovi.Add(postojiKlub);
    }

    if (!postojiKlub.Pratioci.Any(k => k.Id == korisnikID))
    {
        postojiKlub.Pratioci.Add(postojiKorisnik);
    }
  
    await _context.SaveChangesAsync();
    
}
    public async Task OtpratiKlubAsync(int korisnikID,int klubID)
    {
    var postojiKorisnik=await _context.Set<Korisnik>().Include(p=>p.PraceniKlubovi).FirstOrDefaultAsync(p=>p.Id==korisnikID);
    if(postojiKorisnik==null)
        throw new Exception("Nije pronadjen korisnik u bazi");
    var postojiKlub=await _context.Set<Klub>().Include(p=>p.Pratioci).FirstOrDefaultAsync(p=>p.Id==klubID);
    if(postojiKlub==null)
        throw new Exception("Nije pronadjen klub u bazi");
    if (postojiKorisnik.PraceniKlubovi.Any(k => k.Id == klubID))
    {
            postojiKorisnik.PraceniKlubovi.Remove(postojiKlub);
    }

    if (postojiKlub.Pratioci.Any(k => k.Id == korisnikID))
    {
        postojiKlub.Pratioci.Remove(postojiKorisnik);
    }
    await _context.SaveChangesAsync();
    
            
    }
   public async Task<List<PorukaKlubKorisnik>> VratiChatKlubKorisnikAsync(int korisnikID,int klubID,int sport)
        {
            
               

                
                string chatKey = $"chat:{korisnikID}:{klubID}:{sport}";

    var values = await _db.ListRangeAsync(chatKey, 0, -1); // sve poruke

    if (values is null)
        throw new Exception("Ne postoji chat korisnika i kluba");

    var rezultat = values
        .Select(v => JsonConvert.DeserializeObject<PorukaKlubKorisnik>(v!)!)
        .Where(p => p != null)
        .OrderBy(p => p.TacnoVreme)   // možeš i da preskočiš ako ih guraš redom
        .ToList();

    return rezultat;
        }
    public async Task KorisnikKlubPorukaAsync(int korisnikID,int klubID,PorukaSadrzaj sadrzaj,int sport,bool korisnik)
        {
              var postoji=await _context.Set<Korisnik>().FirstOrDefaultAsync(k=>k.Id==korisnikID);
            if(postoji==null)
                throw new Exception("ID korisnika nije pronadjen");
             var klub=await _context.Set<Klub>().FirstOrDefaultAsync(k=>k.Id==klubID);
            if(klub==null)
                throw new Exception("ID utakmice nije pronadjen");
            PorukaKlubKorisnik poruka;
                poruka=new PorukaKlubKorisnik
                {
                    Id=Guid.NewGuid().ToString(),
                    KorisnikID=korisnikID,
                    KlubID=klubID,
                    Sadrzaj=sadrzaj.Sadrzaj,
                   UsernameKor=postoji.Username,
                   NazivKlub=klub.Naziv,
                  
                   PosiljaocUsername=postoji.Username,
                    Dan=DateTime.Now.ToString("dddd", System.Globalization.CultureInfo.InvariantCulture),
                    VremeSlanjaPoruke=DateTime.Now.ToString("hh:mmtt", System.Globalization.CultureInfo.InvariantCulture),
                    TacnoVreme=DateTime.Now


                };
            if(korisnik==false)
            {
                poruka.PosiljaocUsername=klub.Email;
            }
                
            
            
         string chatKey = $"chat:{korisnikID}:{klubID}:{sport}";
            bool vecPostoji = await _db.KeyExistsAsync(chatKey);
            var json = JsonConvert.SerializeObject(poruka);
            await _db.ListRightPushAsync(chatKey, json);

            var dto= new porukaDTO
            {
                Id=poruka.Id,
                Klub=klubID,
                Username=poruka.PosiljaocUsername,
                Text=poruka.Sadrzaj,
                Time=poruka.VremeSlanjaPoruke,
                Day=poruka.Dan
            };
            await _hubContext.Clients.All.SendAsync($"Stigla nova poruka korID={korisnikID} klubID={klubID}",dto);
            var id=korisnik==true?korisnikID:klubID;
            if(vecPostoji==false)
            {
                
                object klubKor=korisnik==true?await _context.Set<Klub>().FirstOrDefaultAsync(p=>p.Id==poruka.KlubID):await _context.Set<Korisnik>().FirstOrDefaultAsync(p=>p.Id==poruka.KorisnikID);
             
                 await _hubContext.Clients.All.SendAsync($"Dodaj novi chat:{id}",new
                    {
                            korId=poruka.KorisnikID,
                            klubId=poruka.KlubID,
                           Naziv=korisnik==true?poruka.NazivKlub:poruka.UsernameKor,
                            Text=poruka.Sadrzaj,
                            Time=poruka.VremeSlanjaPoruke,
                            Day=poruka.Dan,
                            KlubKor=klubKor
                    });
                    
               
            }
         
        }

    public async  Task<List<object>> VratiInboxAsync(int ID,bool korisnik,int sport)
        {
               string pattern = korisnik
        ? $"chat:{ID}:*:{sport}"   // korisnik – svi klubovi
        : $"chat:*:{ID}:{sport}";  // klub – svi korisnici

    // 2) Nadji sve ključeve koji odgovaraju patternu
    var keys = _server.Keys(pattern: pattern).ToArray();

    if (keys == null || keys.Length == 0)
        throw new Exception("Ne postoji nijedan chat za dati ID");

    var rezultat = new List<object>();

    // 3) Za svaki chat ključ uzmi samo poslednju poruku
    foreach (var key in keys)
    {
        // poslednji element u listi
        var lastValue = await _db.ListGetByIndexAsync(key, -1);
        if (lastValue.IsNullOrEmpty) 
            continue;

        var poruka = JsonConvert.DeserializeObject<PorukaKlubKorisnik>(lastValue!);
        object klubKor=korisnik==true?await _context.Set<Klub>().FirstOrDefaultAsync(p=>p.Id==poruka.KlubID):await _context.Set<Korisnik>().FirstOrDefaultAsync(p=>p.Id==poruka.KorisnikID);
        if (poruka != null)
                    rezultat.Add(new
                    {
                            korId=poruka.KorisnikID,
                            klubId=poruka.KlubID,
                           Naziv=korisnik==true?poruka.NazivKlub:poruka.UsernameKor,
                            Text=poruka.Sadrzaj,
                            Time=poruka.VremeSlanjaPoruke,
                            Day=poruka.Dan,
                            KlubKor=klubKor
                    });
    }

    if (rezultat.Count == 0)
        throw new Exception("Ne postoji nijedna poruka za dati ID i sport");

      return rezultat;
      }
    public async Task ObrisiPorukuKlubKorisnikAsync(string ID,int korisnikID,int klubID,int sport )
        {
               var postoji=await _context.Set<Korisnik>().FirstOrDefaultAsync(k=>k.Id==korisnikID);
            if(postoji==null)
                throw new Exception("ID korisnika nije pronadjen");
             var klub=await _context.Set<Klub>().FirstOrDefaultAsync(k=>k.Id==klubID);
            if(klub==null)
                throw new Exception("ID utakmice nije pronadjen");
             string chatKey = $"chat:{korisnikID}:{klubID}:{sport}";
            var messages = await _db.ListRangeAsync(chatKey);
            var obrisana=false;
            foreach (var m in messages)
            {
                var p = JsonConvert.DeserializeObject<PorukaKlubKorisnik>(m);

                if (p.Id == ID)
                {
                    await _db.ListRemoveAsync(chatKey, m, 1);
                    await _hubContext.Clients.All.SendAsync($"Obrisana poruka:{korisnikID}:{klubID}:{sport}", ID);

                    obrisana=true;
                }
                if(obrisana==true)
                    break;

            }
            if(obrisana==false)
                throw new Exception("Poruka nije pronadjena");
        }
    public async Task<List<KluboviZaPocetnu>> VratiNajskorijeRezultateKlubovaSvimTakmicenjimaAsync(int korisnikID,bool prijavljen,SportType sport)
        {
            var now=DateTime.UtcNow;

            KluboviZaPocetnu obj;
            var lista=new List<KluboviZaPocetnu>();
            var postoji=await _context.Set<Korisnik>().FirstOrDefaultAsync(k=>k.Id==korisnikID);
            List<Klub>klubovi=new List<Klub>();
            if(postoji==null||prijavljen==false)
            {
                 klubovi =await _context.Set<Klub>()
                .Include(k=>k.Takmicenja)
                  .ThenInclude(kt => kt.Takmicenje)  
                .Include(k=>k.Pratioci)
                .Where(k=>k.Takmicenja.Any(kt => kt.Takmicenje.Sport == sport))
                .OrderByDescending(k=>k.Pratioci.Count)
                .Take(10)
                .ToListAsync();
              
            }
            else
            {
                 klubovi =await _context.Set<Klub>()
                .Include(k=>k.Takmicenja)
                .ThenInclude(kt => kt.Takmicenje)  
                .Include(k=>k.Pratioci)
                 .Where(k=>k.Takmicenja.Any(kt => kt.Takmicenje.Sport == sport))
                .Where(k=>k.Pratioci.Contains(postoji))
                .OrderByDescending(k=>k.Pratioci.Count)
                .Take(10)
                .ToListAsync();
            }
            foreach(var klub in klubovi)
            {
                obj=new KluboviZaPocetnu();
                obj.Id=klub.Id;
                obj.Logo=klub.LogoURL;
                obj.Naziv=klub.Naziv;
                var novosti=await _context.Set<Novosti>()
                .Where(p=>p.KlubID==klub.Id)
                .OrderByDescending(n=>n.Datum)
                .Take(3)
                .ToListAsync();
                List<object> listaSvezihVesti = new List<object>();
                foreach(var novost in novosti)
                {
                     var key = (RedisKey)$"vest:{novost.Id}";
                     var current = await _db.StringGetAsync(key);
                     StatistikaNovosti stat;
                    
                     bool lajkovao=false;
                     bool dislajkovao=false;
                      if (!current.IsNullOrEmpty)
                        {
                            stat = JsonConvert.DeserializeObject<StatistikaNovosti>(current!) ?? new StatistikaNovosti();
                             lajkovao= stat.IdKorisnikaKojiLajkuju.Contains(korisnikID);
                             dislajkovao= stat.IdKorisnikaKojiDislajkuju.Contains(korisnikID);
                        }
                         object o = new
                     {
                      Id=novost.Id,
        
                    Slika=novost.Slika, 
       
                    Naslov = novost.Naslov,
        
                Sazetak = novost.Sazetak,
                
                        Vest = novost.Vest,
                    Autor=novost.Autor,

                
                    Datum = novost.Datum,
            
                    BrojLajkova = novost.BrojLajkova,
                    BrojDislajkova = novost.BrojDislajkova,
                    KlubID=novost.KlubID,
                    LikedByMe=lajkovao,
                    DislikedByMe=dislajkovao
        
                     };
                     listaSvezihVesti.Add(o);
                

                }
                obj.ListaSvezihVesti=listaSvezihVesti;
              var clubName = klub.Naziv.Trim();
                foreach(var takmicenje in klub.Takmicenja)
                {
                   var q = _context.Set<Utakmica>()
                        .Include(k=>k.Kolo)
                        .Include(k=>k.Statistika)
                        .Where(u =>
                            u.Kolo.TakmicenjeId == takmicenje.TakmicenjeId &&
                            (u.Domacin.Trim() == clubName || u.Gost.Trim() == clubName)
                        );
                  var prethodna = await q
                            .Where(u => u.DatumPocetkaUtakmice < now && u.Uzivo==false)
                            .OrderByDescending(u => u.DatumPocetkaUtakmice)
                            .Select(u => new
                            {
                              Id = u.Id,
                                Domacin = u.Domacin,
                                Datum=u.DatumPocetkaUtakmice,
                                Gost = u.Gost,
                                Uzivo = u.Uzivo,
                                Rezultat = u.Rezultat,
                                Vreme=u.Statistika.TrenutniMinut,
                                ListaStrelaca=u.Statistika.ListaStrelaca,
                                Lokacija=u.Lokacija
                            })
                            .FirstOrDefaultAsync();

                        var trenutna = await q
                            .Where(u => u.Uzivo == true) // ili neki drugi kriterijum za "trenutno"
                            .OrderByDescending(u => u.DatumPocetkaUtakmice)
                            .Select(u => new
                            {
                                 Id = u.Id,
                                Domacin = u.Domacin,
                                Datum=u.DatumPocetkaUtakmice,
                                Gost = u.Gost,
                                Uzivo = u.Uzivo,
                                Rezultat = u.Rezultat,
                                Vreme=u.Statistika.TrenutniMinut,
                                ListaStrelaca=u.Statistika.ListaStrelaca,
                                Lokacija=u.Lokacija
                            })
                            .FirstOrDefaultAsync();


                        var sledeca = await q
                            .Where(u => u.DatumPocetkaUtakmice> now&& u.Uzivo==false)
                            .OrderBy(u => u.DatumPocetkaUtakmice)
                            .Select(u => new
                            {
                               Id = u.Id,
                                Domacin = u.Domacin,
                                Datum=u.DatumPocetkaUtakmice,
                                Gost = u.Gost,
                                Uzivo = u.Uzivo,
                                Rezultat = u.Rezultat,
                                Vreme=u.Statistika.TrenutniMinut,
                                ListaStrelaca=u.Statistika.ListaStrelaca,
                                Lokacija=u.Lokacija
                            })
                            .FirstOrDefaultAsync();
                    obj.ListaTakmicenja.Add(new
                    {
                        Takmicenje=takmicenje.Takmicenje.Naziv,
                        Poslednja=prethodna,
                        Trenutna=trenutna,
                        Sledeca=sledeca
                    });


                }
                lista.Add(obj);
            }
            return lista;
        }

   public async Task<ReactionResult> LajkujIliDislajkujVestAsync(int korisnikID, int vestID, bool lajk)
{
   
    var postoji = await _context.Set<Korisnik>().AnyAsync(k => k.Id == korisnikID);
    if (!postoji) throw new Exception("ID korisnika nije pronadjen");

    var vestPostoji = await _context.Set<Novosti>().AnyAsync(v => v.Id == vestID);
    if (!vestPostoji) throw new Exception("ID vesti nije pronadjen");

    var key = (RedisKey)$"vest:{vestID}";

    for (int attempt = 0; attempt < 5; attempt++)
    {
        
        var tran = _db.CreateTransaction();
      
        var current = await _db.StringGetAsync(key);

        tran.AddCondition(Condition.StringEqual(key, current));

        StatistikaNovosti stat;
        if (!current.IsNullOrEmpty)
        {
            stat = JsonConvert.DeserializeObject<StatistikaNovosti>(current!) ?? new StatistikaNovosti();
        }
        else
        {
            stat = new StatistikaNovosti
            {
                Id = vestID,
                IdKorisnikaKojiLajkuju = new List<int>(),
                IdKorisnikaKojiDislajkuju = new List<int>()
            };
        }

        stat.IdKorisnikaKojiLajkuju ??= new List<int>();
        stat.IdKorisnikaKojiDislajkuju ??= new List<int>();

        // (2) toggle + uklanjanje iz suprotne liste
        if (lajk)
        {
            stat.IdKorisnikaKojiDislajkuju.Remove(korisnikID);

            if (stat.IdKorisnikaKojiLajkuju.Contains(korisnikID))
                stat.IdKorisnikaKojiLajkuju.Remove(korisnikID); // toggle off
            else
                stat.IdKorisnikaKojiLajkuju.Add(korisnikID);
        }
        else
        {
            stat.IdKorisnikaKojiLajkuju.Remove(korisnikID);

            if (stat.IdKorisnikaKojiDislajkuju.Contains(korisnikID))
                stat.IdKorisnikaKojiDislajkuju.Remove(korisnikID); // toggle off
            else
                stat.IdKorisnikaKojiDislajkuju.Add(korisnikID);
        }

        // (3) upis kroz transakciju
        var json = JsonConvert.SerializeObject(stat);
        _ = tran.StringSetAsync(key, json);

        bool ok = await tran.ExecuteAsync();
        if (ok)
        {
            var novost=await _context.Set<Novosti>().FirstOrDefaultAsync(n => n.Id == vestID);
            novost.BrojDislajkova = stat.IdKorisnikaKojiDislajkuju.Count;
            novost.BrojLajkova = stat.IdKorisnikaKojiLajkuju.Count;
            
             await _context.SaveChangesAsync();
            return new ReactionResult
            {
                VestId = vestID,
                Likes = stat.IdKorisnikaKojiLajkuju.Count,
                Dislikes = stat.IdKorisnikaKojiDislajkuju.Count,
               
                LikedByMe = stat.IdKorisnikaKojiLajkuju.Contains(korisnikID),
                DislikedByMe = stat.IdKorisnikaKojiDislajkuju.Contains(korisnikID),
            };
        }

        
    }

    throw new Exception("Previše paralelnih izmena, pokušaj ponovo.");
}
}



    
}