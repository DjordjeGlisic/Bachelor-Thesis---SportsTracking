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
    public class KlubService : IKlubService
    {
        private readonly ApplicationDbContext _context;
        private readonly IDatabase _db;
        private readonly IServer _server;
         private readonly IHubContext<ChatHub> _hubContext;
          public KlubService(ApplicationDbContext context,IConnectionMultiplexer redis,IHubContext<ChatHub>hubContext)
        {
            _context = context;
            _db=redis.GetDatabase();
             var endpoint = redis.GetEndPoints().First();
            _server = redis.GetServer(endpoint);
            _hubContext=hubContext;
        }
        public async Task<List<object>> VratiFormuAsync(int klubId)
        {
            var klub=await _context.Klubovi.FindAsync(klubId);
            var now=DateTime.UtcNow;
            if(klub==null)
                throw new Exception("Klub nije pronadjen");
          var utakmice=await _context.Set<Utakmica>()
          .Where(u=>u.Kolo.Takmicenje.Sport==klub.Sport
           && (u.Domacin==klub.Naziv || u.Gost==klub.Naziv)
           && u.Status=="ODIGRANO")
          .OrderByDescending(p=>p.DatumPocetkaUtakmice)
          .Take(5)
          .Select(p => new
          {
            Id=p.Id,
            Ishod=p.Rezultat,
            Domacin=p.Domacin,
            Gost=p.Gost,
            Rezultat=p.Rezultat,
            Datum=p.DatumPocetkaUtakmice,
            Takmicenje=p.Kolo.Takmicenje.Naziv
              
          })
          .ToListAsync();
          
          var result = utakmice.Select(p =>
            {
                var parts = p.Rezultat.Split(':');

                int levi = int.Parse(parts[0]);
                int desni = int.Parse(parts[1]);

                bool klubJeDomacin = p.Domacin == klub.Naziv;

                int ishod =
                    levi == desni ? 2 :
                    (klubJeDomacin
                        ? (levi > desni ? 1 : 3)
                        : (desni > levi ? 1 : 3));

                return new 
                {
                       Id=p.Id,
                    Ishod=ishod,
                    Domacin=p.Domacin,
                    Gost=p.Gost,
                    Rezultat=p.Rezultat,
                    Datum=p.Datum,
                    Takmicenje=p.Takmicenje
                };
            })
            .ToList();
            List<object> res = result.Cast<object>().ToList();
            return res;
        }
        public async Task<List<NovostZaKorisnika>> VratiNovostiAsync(int klubId,int? korisnikID)
        {
            var klub=await _context.Klubovi.FindAsync(klubId);
            if(klub==null)
                throw new Exception("Klub nije pronadjen");
            List<NovostZaKorisnika>res=new List<NovostZaKorisnika>();
            var novosti=await _context.Set<Novosti>().Where(n=>n.KlubID==klubId).ToListAsync();

              var keys = _server.Keys(pattern: "vest:*");
                if(keys==null)
                   return res;
            foreach(var n in novosti)
            {
                 NovostZaKorisnika o = new NovostZaKorisnika
                    {
                         Id=n.Id,
        
                    Slika=n.Slika, 
       
                    Naslov = n.Naslov,
        
                Sazetak = n.Sazetak,
                
                        Vest = n.Vest,
                    Autor=n.Autor,

                
                    Datum = n.Datum,
            
                    BrojLajkova = n.BrojLajkova,
                    BrojDislajkova = n.BrojDislajkova,
                    KlubID=n.KlubID,
                    LikedByMe=false,
                    DislikedByMe=false
                    };
               
                foreach (var key in keys)
                {
                    var value = await _db.StringGetAsync(key);

                    if (value.IsNullOrEmpty)
                        continue;

                    var novost = JsonConvert.DeserializeObject<StatistikaNovosti>(value!);

                    if (novost is null )
                    {
                        continue;
                        
                    }
                    
                    if(n.Id!=novost.Id)
                        continue;
                    var lajkovaoKorisnik=korisnikID==null?false:novost.IdKorisnikaKojiLajkuju.Contains((int)korisnikID)==true?true:false;
                    var dislajkovaoKorisnik=korisnikID==null?false:novost.IdKorisnikaKojiDislajkuju.Contains((int)korisnikID)==true?true:false;
                   o.LikedByMe=lajkovaoKorisnik;
                   o.DislikedByMe=dislajkovaoKorisnik;
                   
                break;
                }
                res.Add(o);
             
            }
               if(res.Count == 0)
                    throw new Exception("Ne postoji chat za datu utakmicu");
               var sortirane = res
                            .OrderByDescending(p => p.Datum)            
                            .ToList();
            return sortirane;
        }
    public async Task<List<SastavKluba>> VratiSastavAsync(int klubId)
        {
            var klub=await _context.Klubovi.FindAsync(klubId);
            if(klub==null)
                throw new Exception("Klub nije pronadjen");
            var sastav=await _context.Set<Igrac>()
            .Include(x => x.Ucinci)
            .Where(s=>s.KlubID==klubId).ToListAsync();
            var res=new List<SastavKluba>();
            foreach(var s in sastav)
            {
                
                res.Add(new SastavKluba
                {
                    Id=s.Id,
                    Ime=s.Ime,
                    Prezime=s.Prezime,
                    DatumPocetkaUgovora=s.DatumPocetkaUgovora,
                    DatumKrajaUgovora=s.DatumKrajaUgovora,
                    Pozicija=s.Pozicija,
                    Visina=s.Visina,
                    Tezina=s.Tezina,
                    DatumRodjenja=s.DatumRodjenja,
                    ListaKlubova=s.ListaKlubova,
                    BrojGodina=DateTime.Now.Year-s.DatumRodjenja.Year,
                    KlubID=klubId,
                    IndeksniRejting=s.Ucinci.Where(p=>p.IgracId==s.Id).OrderByDescending(p=>p.Sezona).Select(p=>p.IndeksKorisnosti).FirstOrDefault()
                });
            }
            return res;
        }
    public async  Task<ParametriDTO> VratiParametreIgracaAsync(int igracID)
    {
        var igrac=await _context.Set<Igrac>().FirstOrDefaultAsync(p=>p.Id==igracID);
        if(igrac==null)
            throw new Exception("Igrac ne postoji u bazi");
        var sezone=await _context.Set<Ucinak>().Where(p=>p.IgracId==igracID).Select(p=>p.Sezona).Distinct().ToListAsync();
        var takmicenja=await _context.Set<Ucinak>().Where(p=>p.IgracId==igracID).Select(p=>p.Takmicenje).ToListAsync();
        return new ParametriDTO
        {
            Takmicenja=takmicenja,
            Sezone=sezone
        };
            
    }
    public async Task<object> VratiStatistikuIgracaAsync(int igracID,string sezona,int takmicenjeID)
        {
             var igrac=await _context.Set<Igrac>().FirstOrDefaultAsync(p=>p.Id==igracID);
        if(igrac==null)
            throw new Exception("Igrac ne postoji u bazi");
             var takmicenje=await _context.Set<Takmicenje>().FirstOrDefaultAsync(p=>p.Id==takmicenjeID);
        if(takmicenje==null)
            throw new Exception("Takmicenje ne postoji u bazi");
            object res;
            var ucinak=await _context.Set<Ucinak>().Where(p=>p.IgracId==igracID&&p.TakmicenjeId==takmicenjeID&&p.Sezona==sezona).FirstOrDefaultAsync();
            switch(takmicenje.Sport)
            {
                case SportType.Fudbal:
                
                
                        res = new
                        {
                            odigrane=ucinak==null?0:ucinak.OdigraneUtakmice,
                            golovi=ucinak==null?0:ucinak.Pogotci,
                            asistencije=ucinak==null?0:ucinak.Asistencije,
                            sutevi=ucinak==null?0:ucinak.UkupnoSuteva,
                            fauli=ucinak==null?0:ucinak.UkupnoFaula,
                            blokirani=ucinak==null?0:ucinak.BlokiraniUdarci,
                            vraceniPosedi=ucinak==null?0:ucinak.VraceniPosedi,
                            dodavanja=ucinak==null?0:ucinak.UkupnoDodavanja,
                            tacna=ucinak==null?0:ucinak.UkupnoTacnihDodavanja,
                            uspesnostDodavanja=ucinak==null||ucinak.UkupnoDodavanja==0?0:(ucinak.UkupnoTacnihDodavanja/(double)ucinak.UkupnoDodavanja)*100,
                            predjeno=ucinak==null?0:ucinak.PredjenaDistancaKM,
                            indeks=ucinak==null?0:ucinak.IndeksKorisnosti,

                        };
                    
                    break;

                case SportType.Kosarka:
                 res = new
                        {
                            odigrane=ucinak==null?0:ucinak.OdigraneUtakmice,
                            pts=ucinak==null||ucinak.OdigraneUtakmice==0?0:ucinak.Pogotci/(double)ucinak.OdigraneUtakmice,
                            ast=ucinak==null||ucinak.OdigraneUtakmice==0?0:ucinak.Asistencije/(double)ucinak.OdigraneUtakmice,
                            reb=ucinak==null||ucinak.OdigraneUtakmice==0?0:ucinak.Skokovi/(double)ucinak.OdigraneUtakmice,
                            off=ucinak==null||ucinak.OdigraneUtakmice==0?0:ucinak.SkokoviOF/(double)ucinak.OdigraneUtakmice,
                            dff=ucinak==null||ucinak.OdigraneUtakmice==0?0:ucinak.SkokoviDF/(double)ucinak.OdigraneUtakmice,
                            stl=ucinak==null||ucinak.OdigraneUtakmice==0?0:ucinak.UkradeneLopte/(double)ucinak.OdigraneUtakmice,
                            blk=ucinak==null||ucinak.OdigraneUtakmice==0?0:ucinak.BlokiraniUdarci/(double)ucinak.OdigraneUtakmice,
                            trn=ucinak==null||ucinak.OdigraneUtakmice==0?0:ucinak.IzgubljeneLopte/(double)ucinak.OdigraneUtakmice,
                            fls=ucinak==null||ucinak.OdigraneUtakmice==0?0:ucinak.UkupnoFaula/(double)ucinak.OdigraneUtakmice,
                            proc=ucinak==null||ucinak.UkupnoSuteva==0?0:(ucinak.Pogotci/(double)ucinak.UkupnoSuteva)*100,
                            indeks=ucinak==null?0:ucinak.OdigraneUtakmice==0?0:ucinak.IndeksKorisnosti/(double)ucinak.OdigraneUtakmice
                        };
                    break;

                case SportType.Vaterpolo:
                 res = new
                        {
                             odigrane=ucinak==null?0:ucinak.OdigraneUtakmice,
                            golovi=ucinak==null?0:ucinak.Pogotci,
                            asistencije=ucinak==null?0:ucinak.Asistencije,
                            sutevi=ucinak==null?0:ucinak.UkupnoSuteva,
                            fauli=ucinak==null?0:ucinak.UkupnoFaula,
                            blokirani=ucinak==null?0:ucinak.BlokiraniUdarci,
                            izgubljene=ucinak==null?0:ucinak.IzgubljeneLopte,
                            iskljucenja=ucinak==null?0:ucinak.Iskljucenja,
                            vraceni=ucinak==null?0:ucinak.VraceniPosedi,
                            indeks=ucinak==null?0:ucinak.IndeksKorisnosti,
                        };
                    break;
                default:
                    throw new Exception("Takmicenje ne pripada nijednom sportu");
                    
                    
            }
            return res;

        }
        public async Task<List<Takmicenje>> VratiTakmicenjaKlubaAsync(int klubID )
        {
              var klub=await _context.Set<Klub>().FirstOrDefaultAsync(p=>p.Id==klubID);
            if(klub==null)
                throw new Exception("Klub ne postoji u bazi");
            var takmicenja=await _context.Set<Tabela>().Where(p=>p.KlubId==klubID).Select(p=>p.Takmicenje).ToListAsync();
            return takmicenja;

        }
    
    public async Task<UcinakKluba> VratiUtakmiceTakmicenjaAsync(int klubID,int takmicenjeID)
        {
            var klub=await _context.Set<Klub>().FirstOrDefaultAsync(p=>p.Id==klubID);
            if(klub==null)
                throw new Exception("Nema datog kluba u bazi");
            var utakmice=await _context.Set<Utakmica>()
            .Include(p=>p.Kolo)
            .ThenInclude(p=>p.Takmicenje)
            .Where(p=>p.Kolo.TakmicenjeId==takmicenjeID&&(klub.Naziv==p.Domacin||klub.Naziv==p.Gost))
            .OrderBy(p=>p.Kolo.PocetakKola)
            .ToListAsync();
            var now=DateTime.UtcNow;
            int pobede=0;
            int neresene=0;
            int porazi=0;
            double asistencije=0.0f;
            //FUDBAL
            double prosecnoSuteva=0;
            double prosecnoOkvir=0;
            double prosecnoGolova=0;
            double prosecnoZuti=0;
            double prosecnoCrveni=0;
            double prosecnoPosed=0;
            double prosecnoPreciznost=0;
            //KOSARKA I VATERPOLO
            double prosecnoPrva=0;
            double prosecnoDruga=0;
            double prosecnoTreca=0;
            double prosecnoCetvrta=0;
            double prosecnoPoena=0;
            //KOSARKA
            double prosecnoSkokova=0;
          
            
            double prosecnoUkradenih=0;
            double prosecnoBlokada=0;
            double prosecnoFT=0;
            double prosecnoTwo=0;
            double prosecnoThree=0;
            ///VATERPOLO
            double prosecnoIskljucenja=0;
            double prosecnoPeteraca=0;
            double br=0;
            foreach(var u in utakmice)
            {
                if(u.DatumPocetkaUtakmice>now||u.Uzivo==true)
                    continue;
               
                if(klub.Sport==SportType.Fudbal)
                {
                   var fs=await _context.Set<FudbalStatistika>().FirstOrDefaultAsync(p=>p.Id==u.StatistikaId);
                   if(fs==null)
                    continue;
                    asistencije+=klub.Naziv==u.Domacin?(double)fs.AsistencijeDomacin:(double)fs.AsistencijeGost;
                    
                    pobede+=klub.Naziv==u.Domacin&&fs.GoloviDomacin>fs.GoloviGost?1:0;
                    pobede+=klub.Naziv==u.Gost&&fs.GoloviGost>fs.GoloviDomacin?1:0;
                    porazi+=klub.Naziv==u.Domacin&&fs.GoloviDomacin<fs.GoloviGost?1:0;
                    porazi+=klub.Naziv==u.Gost&&fs.GoloviGost<fs.GoloviDomacin?1:0;
                    neresene+=(klub.Naziv==u.Gost||klub.Naziv==u.Domacin)&&fs.GoloviGost==fs.GoloviDomacin?1:0;

                    
                    
                    
                    prosecnoSuteva+=klub.Naziv==u.Domacin?fs.SutDomacin:fs.SutGost;
                    prosecnoOkvir+=klub.Naziv==u.Domacin?fs.SutKaGolDomacin:fs.SutKaGolGost;
                    prosecnoGolova+=klub.Naziv==u.Domacin?fs.GoloviDomacin:fs.GoloviGost;
                    prosecnoZuti+=klub.Naziv==u.Domacin?fs.ZutiKartoniDomacin:fs.ZutiKartoniGost;;
                    prosecnoCrveni+=klub.Naziv==u.Domacin?fs.CrveniKartoniDomacin:fs.CrveniKartoniGost;;
                    prosecnoPosed+=klub.Naziv==u.Domacin?fs.PosedDomacin:fs.PosedGost;
                    prosecnoPreciznost+=klub.Naziv==u.Domacin?fs.PreciznostPasovaDomacin:fs.PreciznostPasovaGost;
                            
                }
                else if (klub.Sport==SportType.Kosarka)
                {
                     var ks=await _context.Set<KosarkaStatistika>().FirstOrDefaultAsync(p=>p.Id==u.StatistikaId);
                   if(ks==null)
                    continue;
                    var skorDomacin=ks.PrvaCetDomacin+ks.DrugaCetDomacin+ks.TrecaCetDomacin+ks.CetvCetDomacin;
                    var skorGost=ks.PrvaCetGost+ks.DrugaCetGost+ks.TrecaCetGost+ks.CetvCetGost;
                    
                    pobede+=klub.Naziv==u.Domacin&&skorDomacin>skorGost?1:0;
                    pobede+=klub.Naziv==u.Gost&&skorGost>skorDomacin?1:0;
                   porazi+=klub.Naziv==u.Domacin&&skorDomacin<skorGost?1:0;
                    porazi+=klub.Naziv==u.Gost&&skorGost<skorDomacin?1:0; 
                     asistencije+=klub.Naziv==u.Domacin?(double)ks.AsistencijeDomacin:(double)ks.AsistencijeGost;
                     var prva=klub.Naziv==u.Domacin?ks.PrvaCetDomacin:ks.PrvaCetGost;
                     var druga=klub.Naziv==u.Domacin?ks.DrugaCetDomacin:ks.DrugaCetGost;
                     var treca=klub.Naziv==u.Domacin?ks.TrecaCetDomacin:ks.TrecaCetGost;
                     var cetvrta=klub.Naziv==u.Domacin?ks.CetvCetDomacin:ks.CetvCetGost;
                    prosecnoPrva+=prva;
                    prosecnoDruga+=druga;
                    prosecnoTreca+=treca;
                    prosecnoCetvrta+=cetvrta;
                    prosecnoPoena+=prva+druga+treca+cetvrta;
                    prosecnoSkokova+=klub.Naziv==u.Domacin?ks.ReboundsDomacin:ks.ReboundsGost;
                    prosecnoBlokada+=klub.Naziv==u.Domacin?ks.BlocksDomacin:ks.BlocksGost;
                    prosecnoUkradenih+=klub.Naziv==u.Domacin?ks.StealsDomacin:ks.StealsGost;
                    prosecnoFT+=klub.Naziv==u.Domacin?ks.FreeThrowDomacin:ks.FreeThrowGost;
                    prosecnoTwo+=klub.Naziv==u.Domacin?ks.TwoPointDomacin:ks.TwoPointGost;
                    prosecnoThree+=klub.Naziv==u.Domacin?ks.ThreePointDomacin:ks.ThreePointGost;
                   
                }
                else
                {
                      var vs=await _context.Set<VaterpoloStatistika>().FirstOrDefaultAsync(p=>p.Id==u.StatistikaId);
                   if(vs==null)
                    continue;
                     var skorDomacin=vs.VP_PrvaCetDomacin+vs.VP_DrugaCetDomacin+vs.VP_TrecaCetDomacin+vs.VP_CetvCetDomacin;
                     var skorGost=vs.VP_PrvaCetGost+vs.VP_DrugaCetGost+vs.VP_TrecaCetGost+vs.VP_CetvCetGost;
                    pobede+=klub.Naziv==u.Domacin&&skorDomacin>skorGost?1:0;
                    pobede+=klub.Naziv==u.Gost&&skorGost>skorDomacin?1:0;
                   porazi+=klub.Naziv==u.Domacin&&skorDomacin<skorGost?1:0;
                    porazi+=klub.Naziv==u.Gost&&skorGost<skorDomacin?1:0; 
                     asistencije+=klub.Naziv==u.Domacin?(double)vs.AsistencijeDomacin:(double)vs.AsistencijeGost;
                    prosecnoPrva+=klub.Naziv==u.Domacin?vs.VP_PrvaCetDomacin:vs.VP_PrvaCetGost;
                    prosecnoDruga+=klub.Naziv==u.Domacin?vs.VP_DrugaCetDomacin:vs.VP_DrugaCetGost;
                    prosecnoTreca+=klub.Naziv==u.Domacin?vs.VP_TrecaCetDomacin:vs.VP_TrecaCetGost;
                    prosecnoCetvrta+=klub.Naziv==u.Domacin?vs.VP_CetvCetDomacin:vs.VP_CetvCetGost;
                      var prva=klub.Naziv==u.Domacin?vs.VP_PrvaCetDomacin:vs.VP_PrvaCetGost;
                     var druga=klub.Naziv==u.Domacin?vs.VP_DrugaCetDomacin:vs.VP_DrugaCetGost;
                     var treca=klub.Naziv==u.Domacin?vs.VP_TrecaCetDomacin:vs.VP_TrecaCetGost;
                     var cetvrta=klub.Naziv==u.Domacin?vs.VP_CetvCetDomacin:vs.VP_CetvCetGost;
                    prosecnoPoena+=prva+druga+treca+cetvrta;
                      prosecnoIskljucenja+=klub.Naziv==u.Domacin?vs.IskljucenjaDomacin:vs.IskljucenjaGost;
                      prosecnoPeteraca+=klub.Naziv==u.Domacin?vs.PeterciDomacin:vs.PeterciGost;
                      
                    
                }
                
                br++;
            }
            object o;
            if(klub.Sport==SportType.Fudbal)
                o=new
                {
                    odigrane=br,
                    pobede=pobede,
                    neresene=neresene,
                    porazi=porazi,
                    prosecnoAsistencia=br==0?0:asistencije/br,
                     prosecnoSuteva=br==0?0:prosecnoSuteva/br,
                    prosecnoOkvir=br==0?0:prosecnoOkvir/br,
                    prosecnoGolova=br==0?0:prosecnoGolova/br,
                    prosecnoZuti=br==0?0:prosecnoZuti/br,
                    prosecnoCrveni=br==0?0:prosecnoCrveni/br,
                    prosecnoPosed=br==0?0:prosecnoPosed/br,
                    prosecnoPreciznost=br==0?0:prosecnoPreciznost/br
                    
                };
            else if(klub.Sport==SportType.Kosarka)
            {
                o = new
                {
                    odigrane=br,
                    pobede=pobede,
                    neresene=neresene,
                    porazi=porazi,
                     prosecnoPrva=br==0?0:prosecnoPrva/br,
                      prosecnoAsistencia=br==0?0:asistencije/br,
                    prosecnoDruga=br==0?0:prosecnoDruga/br,
                    prosecnoTreca=br==0?0:prosecnoTreca/br,
                    prosecnoCetvrta=br==0?0:prosecnoCetvrta/br,
                    prosecnoPoena=br==0?0:prosecnoPoena/br,
                    prosecnoSkokova=br==0?0:prosecnoSkokova/br,
                    prosecnoBlokada=br==0?0:prosecnoBlokada/br,
                    prosecnoUkradenih=br==0?0:prosecnoUkradenih/br,
                    prosecnoFT=br==0?0:prosecnoFT/br,
                    prosecnoTwo=br==0?0:prosecnoTwo/br,
                    prosecnoThree=br==0?0:prosecnoThree/br
                    
                };
            }
            else
            {
                o = new
                {
                    odigrane=br,
                    pobede=pobede,
                    porazi=porazi,
                   neresene=neresene,
                     prosecnoAsistencia=br==0?0:asistencije/br,
                    prosecnoPrva=br==0?0: prosecnoPrva/br,
                    prosecnoDruga=br==0?0: prosecnoDruga/br,
                    prosecnoTreca=br==0?0: prosecnoTreca/br,
                    prosecnoCetvrta=br==0?0: prosecnoCetvrta/br,
                    
                    prosecnoPoena=br==0?0:(double)prosecnoPoena/br,
                      prosecnoIskljucenja=br==0?0:prosecnoIskljucenja/br,
                      prosecnoPeteraca=br==0?0:prosecnoPeteraca/br
                      
                };
            }
            return new UcinakKluba
            {
                Utakmice=utakmice,
                Statistika=o
            };

        }
    
    public async Task<List<TabelaKluba>> VratiTabeluKlubaZaTakmicenjeAsync(int takmicenjeID,string sezona,int klubID)
        {
             var s=Uri.UnescapeDataString(sezona);
   var nazivTabele=await _context.Set<Tabela>().Where(p=>p.TakmicenjeId==takmicenjeID&&p.KlubId==klubID&&p.Sezona==sezona).Select(p=>p.NazivTabele).FirstOrDefaultAsync();
    var tabela = await _context.Set<Tabela>()
        .Where(t => t.TakmicenjeId == takmicenjeID && t.Sezona == s&&t.NazivTabele==nazivTabele)
        .Select(obj => new TabelaKluba
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
            NazivTabele   =nazivTabele
        })
        .OrderByDescending(p=>p.Bodovi)
        .ToListAsync();

   

    return tabela;
        }
    public async Task<NovostZaKorisnika> DodajNovuVest(int klubID,NovostZaDodavanje novost)
    {
        var klub= await _context.Set<Klub>().FirstOrDefaultAsync(p => p.Id == klubID);
        if(klub == null)
            throw new Exception("Mije pronadjen klub u bazi");
        if(novost == null)
            throw new Exception("Nije poslata vest za dodavanje");
        var dodavanje= new Novosti()
        {
            Slika = novost.Slika,
            Naslov= novost.Naslov,
            Sazetak = novost.Sazetak,
            Vest = novost.Vest,
            Autor = novost.Autor,
            Datum = DateTime.UtcNow,
            BrojLajkova = 0,
            BrojDislajkova = 0,
            KlubID = klubID,
            Klub = klub
        };
        await _context.AddAsync(dodavanje);
        await _context.SaveChangesAsync();
        var novaStatistika = new StatistikaNovosti
        {
            Id = dodavanje.Id,
            IdKorisnikaKojiLajkuju = new List<int>(),
            IdKorisnikaKojiDislajkuju = new List<int>(),
         
        };
        string redisKey = $"vest:{dodavanje.Id}";
        string jsonValue = JsonConvert.SerializeObject(novaStatistika);
        await _db.StringSetAsync(redisKey, jsonValue);
        return new NovostZaKorisnika()
        {
            Id=dodavanje.Id,
            Slika=dodavanje.Slika, 
            Naslov = dodavanje.Naslov,
            Sazetak = dodavanje.Sazetak,
            Vest = dodavanje.Vest,
            Autor=dodavanje.Autor,
            Datum = dodavanje.Datum,
            BrojLajkova = dodavanje.BrojLajkova,
            BrojDislajkova = dodavanje.BrojDislajkova,
            KlubID=dodavanje.KlubID,
            LikedByMe=false,
            DislikedByMe=false
        };
        
    }
     public async  Task<NovostZaKorisnika> PromeniPostojecuVest(int klubID,NovostZaKorisnika novost)
        {
        var klub= await _context.Set<Klub>().FirstOrDefaultAsync(p => p.Id == klubID);
        if(klub == null)
            throw new Exception("Nije pronadjen klub u bazi");
        var postoji= await _context.Set<Novosti>().FirstOrDefaultAsync(p => p.Id == novost.Id);
        if(postoji == null)
            throw new Exception("Nije poslata vest za dodavanje");
        postoji.Slika=novost.Slika;
        postoji.Autor=novost.Autor;
        postoji.Vest=novost.Vest;
        postoji.Naslov=novost.Naslov;
        postoji.Sazetak=novost.Sazetak;
       await _context.SaveChangesAsync();
       return novost;
            
        }
        public async Task<int> ObrisiPostojecuVestAsync(int klubID,int vestID)
        {
             var klub= await _context.Set<Klub>().FirstOrDefaultAsync(p => p.Id == klubID);
            if(klub == null)
                throw new Exception("Nije pronadjen klub u bazi");
            var vest= await _context.Set<Novosti>().FirstOrDefaultAsync(p => p.Id == vestID);
            if(vest == null)
                throw new Exception("Mije pronadjena vest u bazi");
           _context.Set<Novosti>().Remove(vest);
           await _context.SaveChangesAsync();
           string redisKljuc = $"vest:{vestID}";
        await _db.KeyDeleteAsync(redisKljuc);
        return vestID;

            
        }
        public async Task<SastavKluba> DodajIgracaTimuAsync(int klubID,IgracDTO igrac)
        {
            var postojiKlub = await _context.Set<Klub>().FirstOrDefaultAsync(p => p.Id == klubID);
            if(postojiKlub == null)
                throw new Exception("Nije pronadjen klub u bazi");
            var postojiIgrac = await _context.Set<Igrac>().FirstOrDefaultAsync(p => p.Ime == igrac.Ime && p.Prezime==igrac.Prezime && p.DatumRodjenja==igrac.DatmRodjenja);
            if(postojiIgrac != null)
                throw new Exception("Dati igrac koga pokusavate da kreirate vec postoji u bazi");
            var takmicenja= await _context.Set<Takmicenje>().Where(p=>igrac.Takmicenja.Contains(p.Naziv)).ToListAsync();
            var ucinci=new List<Ucinak>();
            DateTime danas = DateTime.Now;
            int trenutnaGodina = danas.Year;
            int trenutniMesec = danas.Month;
            string sezona="";
            if (trenutniMesec >= 8)
            {
               sezona = $"{trenutnaGodina}/{trenutnaGodina + 1}";
            }
            else
            {
                sezona = $"{trenutnaGodina-1}/{trenutnaGodina}";
            }
            var godine = IzracunajGodine(igrac.DatmRodjenja);
            var toAddIgrac =  new Igrac
            {
                Ime = igrac.Ime,
                Prezime=igrac.Prezime,
                DatumRodjenja=igrac.DatmRodjenja,
                DatumKrajaUgovora=igrac.DatumKrajaUgovora,
                DatumPocetkaUgovora=igrac.DatumPocetkaUgovora,
                Pozicija=igrac.Pozicija,
                Visina=igrac.Visina,
                Tezina=igrac.Tezina,
                ListaKlubova=igrac.ListaKlubova,
                BrojGodina = godine,
                Klub  = postojiKlub,
                Sport = postojiKlub.Sport,
                KlubID = postojiKlub.Id, 

            };
            await _context.Set<Igrac>().AddAsync(toAddIgrac);
            await _context.SaveChangesAsync();
            if(takmicenja!=null)
            {
                foreach(var x in takmicenja)
                {
                    var ucinak=new Ucinak
                    {
                        Pogotci=0,
                        Asistencije=0,
                        UkupnoSuteva=0,
                        IndeksKorisnosti=0,
                        OdigraneUtakmice=0,
                        IzgubljeneLopte= postojiKlub.Sport == SportType.Fudbal ? null : 0,
                        UkradeneLopte = postojiKlub.Sport == SportType.Kosarka ? 0 : null,
                        BlokiraniUdarci = 0,
                        VraceniPosedi = postojiKlub.Sport == SportType.Kosarka ? null : 0,
                        UkupnoDodavanja = postojiKlub.Sport == SportType.Fudbal ? 0 : null,
                        UkupnoTacnihDodavanja = postojiKlub.Sport == SportType.Fudbal ? 0 : null,
                        PredjenaDistancaKM = postojiKlub.Sport == SportType.Fudbal ? 0 : null,
                        Sezona = sezona,
                        NazivKluba = postojiKlub.Naziv,
                        Skokovi = postojiKlub.Sport == SportType.Kosarka ? 0 : null,
                        SkokoviOF = postojiKlub.Sport == SportType.Kosarka ? 0 : null,
                        SkokoviDF = postojiKlub.Sport == SportType.Kosarka ? 0 : null,
                        Iskljucenja = postojiKlub.Sport == SportType.Vaterpolo ? 0 : null,
                        UkupnoFaula = 0,
                        CrveniKartoni = postojiKlub.Sport == SportType.Fudbal ? 0 : null,
                        ZutiKartoni =  postojiKlub.Sport == SportType.Fudbal ? 0 : null,
                        Takmicenje = x,
                        TakmicenjeId = x.Id,
                        IgracId =toAddIgrac.Id,
                        Igrac = toAddIgrac                        
                    };
                    await _context.Set<Ucinak>().AddAsync(ucinak);
                    await _context.SaveChangesAsync();
                    
                }
            }
            return new SastavKluba
            {
                Id=toAddIgrac.Id,
                Ime = toAddIgrac.Ime,
                Prezime =  toAddIgrac.Prezime,
                DatumPocetkaUgovora= toAddIgrac.DatumPocetkaUgovora,
                DatumKrajaUgovora = toAddIgrac.DatumKrajaUgovora,
                Pozicija = toAddIgrac.Pozicija,
                Visina = toAddIgrac.Visina,
                Tezina = toAddIgrac.Tezina,
                DatumRodjenja = toAddIgrac.DatumRodjenja,
                ListaKlubova =  toAddIgrac.ListaKlubova,
                BrojGodina = toAddIgrac.BrojGodina,
                KlubID = (int)toAddIgrac.KlubID,
                IndeksniRejting=toAddIgrac.Ucinci.Where(p=>p.IgracId==toAddIgrac.Id).OrderByDescending(p=>p.Sezona).Select(p=>p.IndeksKorisnosti).FirstOrDefault()


            };
        }
        public async Task<SastavKluba> IzmeniIgracaKlubaAsync(int igracID,SastavKluba igrac)
        {
            var postojiIgrac = await _context.Set<Igrac>().FirstOrDefaultAsync(p => p.Id==igracID);
            if(postojiIgrac == null)
                throw new Exception("Dati igrac koga pokusavate da modifikujete ne postoji u bazi");
            postojiIgrac.Ime = igrac.Ime;
            postojiIgrac.Prezime=igrac.Prezime;
            postojiIgrac.DatumRodjenja=igrac.DatumRodjenja;
            postojiIgrac.DatumKrajaUgovora=igrac.DatumKrajaUgovora;
            postojiIgrac.DatumPocetkaUgovora=igrac.DatumPocetkaUgovora;
            postojiIgrac.Pozicija=igrac.Pozicija;
            postojiIgrac.Visina=igrac.Visina;
            postojiIgrac.Tezina=igrac.Tezina;
            postojiIgrac.ListaKlubova=igrac.ListaKlubova;
            var godine = IzracunajGodine(igrac.DatumRodjenja);
            postojiIgrac.BrojGodina = godine;
            await _context.SaveChangesAsync();
              return new SastavKluba
            {
                Id=postojiIgrac.Id,
                Ime = postojiIgrac.Ime,
                Prezime =  postojiIgrac.Prezime,
                DatumPocetkaUgovora= postojiIgrac.DatumPocetkaUgovora,
                DatumKrajaUgovora = postojiIgrac.DatumKrajaUgovora,
                Pozicija = postojiIgrac.Pozicija,
                Visina = postojiIgrac.Visina,
                Tezina = postojiIgrac.Tezina,
                DatumRodjenja = postojiIgrac.DatumRodjenja,
                ListaKlubova =  postojiIgrac.ListaKlubova,
                BrojGodina = postojiIgrac.BrojGodina,
                KlubID =(int) postojiIgrac.KlubID,
                IndeksniRejting=postojiIgrac.Ucinci.Where(p=>p.IgracId==postojiIgrac.Id).OrderByDescending(p=>p.Sezona).Select(p=>p.IndeksKorisnosti).FirstOrDefault()


            };
        }
        public int IzracunajGodine(DateOnly datumRodjenja)
        {
            var danas = DateOnly.FromDateTime(DateTime.Now);
            int godine = danas.Year - datumRodjenja.Year;

            // Ako rođendan ove godine još nije bio, oduzmi jednu godinu
            if (danas < datumRodjenja.AddYears(godine))
            {
                godine--;
            }

            return godine;
        }
        public async Task<int> ObrisiPostojecegIgracaAsync(int klubID,int igracID)
        {
             var klub= await _context.Set<Klub>().FirstOrDefaultAsync(p => p.Id == klubID);
            if(klub == null)
                throw new Exception("Nije pronadjen klub u bazi");
            var igrac= await _context.Set<Igrac>().FirstOrDefaultAsync(p => p.Id == igracID);
            if(igrac == null)
                throw new Exception("Mije pronadjena vest u bazi");
           _context.Set<Igrac>().Remove(igrac);
           await _context.SaveChangesAsync();
            return igracID;

            
        }
        public async Task<OdgovorPrijave> ImeniInformacijeKlubaAsync(int klubID,KlubDTO klub)
        {
            var postoji = await _context.Set<Klub>().FirstOrDefaultAsync(p => p.Id == klubID);
            if(postoji == null)
                throw new Exception("Prosledjeni klub ne postoji u bazi");
            postoji.Adresa = klub.Adresa;
            postoji.Istorija=klub.Istorija;
            postoji.Prihodi = klub.Prihodi;
            postoji.Rashodi = klub.Rashodi;
            postoji.Sponzori = klub.Sponzori;
            postoji.Trofeji = klub.Trofeji;
            postoji.Email = klub.Username;
            await _context.SaveChangesAsync();
            return new OdgovorPrijaveKluba
            {
                Id = postoji.Id,
                Username = postoji.Email,
                Sport = (int)postoji.Sport,
                Naziv = postoji.Naziv,
                Takicenja=postoji.Takmicenja.Select(s=>s.Takmicenje.Naziv).ToList(),
                Logo = postoji.LogoURL,
                Trofeji = postoji.Trofeji,
                Istorija = postoji.Istorija,
                Prihodi = postoji.Prihodi,
                Rashodi = postoji.Rashodi,
                Sponzori=postoji.Sponzori,
                Adresa=postoji.Adresa,
                BrojPratioca=postoji.Pratioci.Count
            };

        }
    }
   

}
                  