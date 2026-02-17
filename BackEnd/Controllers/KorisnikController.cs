using Models;
using DTO;
using Services;
using Microsoft.AspNetCore.Mvc;
using Strukture;
namespace Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class KorisnikController: ControllerBase
    {
        private readonly IKorisnikService _korisnikService;

        public KorisnikController(IKorisnikService korisnikService)
        {
            _korisnikService = korisnikService;
        }
        [HttpPost]
        [Route("RegistracijaKorisnika")]
        public async Task<IActionResult> Registracija([FromBody]RegistracijaKorisnika dto)
        {
            try
            {
            await _korisnikService.RegistracijaAsync(dto);
                return Ok("Korisnik uspesno registrovan");
            
                
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }   
        }
        [HttpPost]
        [Route("PrijavaKorisnika")]
        public async Task<IActionResult> Prijava(PrijavaKorisnika dto)
        {
            try
            {
           var result = await _korisnikService.PrijavaAsync(dto);
            return Ok(result);
                
            }
            catch
            {
                return Unauthorized(new { message = "Pogresan username ili lozinka" });
                
            } 
        }
         [HttpGet]
        [Route("PribaviTakmicenja/{sport}")]
        public async Task<IActionResult> VratiTakmicenja(int sport)
        {
            try
            {
                SportType s;
                switch(sport)
                {
                    case 1:
                        s= SportType.Fudbal;
                        break;
                    case 2:
                        s= SportType.Kosarka;
                        break;
                    default:
                        s= SportType.Vaterpolo;
                        break;
                }
           var result = await _korisnikService.VratiTakmicenjaAsync(s);
            return Ok(result);
                
            }
            catch
            {
                return BadRequest(new { message = "Nema takmicenja za izabrani sport." });
                
            } 
        }
        [HttpGet]
        [Route("PribaviKolo/{takmicenjeId}/{brojKola}")]
        public async Task<IActionResult> VratiKolo(int takmicenjeId,int brojKola)
        {
            try
            {
                var result = await _korisnikService.VratiUtakmiceKolaAsync(takmicenjeId,brojKola);
                return Ok(result);        
            }
            catch
            {
                return BadRequest(new { message = "Nema takmicenja za izabrani sport." });
                
            } 
        }
        [HttpGet]
        [Route("GetStatistika/{utakmicaID}/{Sport}")]
       public async Task<IActionResult> VratiStatistikuUtakmice(int utakmicaID,int Sport)
        {
            try
            {
                SportType s;
                switch(Sport)
                {
                    case 1:
                        s= SportType.Fudbal;
                        break;
                    case 2:
                        s= SportType.Kosarka;
                        break;
                    default:
                        s= SportType.Vaterpolo;
                        break;
                }
                var result = await _korisnikService.VratiStatistikuUtakmiceAsync(utakmicaID,s);
              if(result==null)
                throw new Exception("Nije pronadjena statistika za datu utakmicu");
            return Ok(result);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
                
            } 
        }
        [HttpPost]
        [Route("PosaljiPoruku/{korisnikID}/{utakmicaID}")]
       public async Task<IActionResult> KorisnikSaljePorukuZaUtakmicuAsync([FromRoute]int korisnikID,[FromRoute]int utakmicaID,[FromBody]PorukaSadrzaj sadrzaj)
        {
            try
            {
                await _korisnikService.KorisnikSaljePorukuZaUtakmicuAsync(korisnikID,utakmicaID,sadrzaj);
               return Ok(new {message="Uspeh"});
               
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
                
            } 
        }
         [HttpGet]
        [Route("VratiChat/{utakmicaID}")]
       public async Task<IActionResult> VratiPorukeKorisnikUtakmicaAsync([FromRoute]int utakmicaID)
        {
            try
            {
               var result=await _korisnikService.VratiPorukeKorisnikUtakmicaAsync(utakmicaID);
              var res=new List<object>();
              foreach(var item in result)
                {
                    res.Add(
                        new
                        {
                            Id=item.Id,
                            
                            Username=item.PosiljaocUsername,
                            Text=item.Sadrzaj,
                            Time=item.VremeSlanjaPoruke,
                            Day=item.Dan
                            
                        }
                    );
                }
               return Ok(res);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
                
            } 
        }
    
         [HttpDelete]
        [Route("ObrisiPoruku/{porukaId}/{utakmicaId}")]
        public async Task<IActionResult> ObrisiPoruku([FromRoute]string porukaId,[FromRoute]int utakmicaId)
        {
            try
            {
                await _korisnikService.ObrisiPorukuUtakmciAsync(porukaId,utakmicaId);
                return Ok("Uspesno obrisana poruka");
                
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
[Route("PribaviTabeluTakmicenjaUSezoni/{takmicenjeId}/{sezona}/{nazivTabele}")]
        public async Task<IActionResult> PribaviTabeluKlubTakmicnje([FromRoute] int takmicenjeId,
    [FromRoute] string sezona,[FromRoute]string nazivTabele)
        {
            try
            {
                var result=await _korisnikService.VratiTabeluTakmicenjaAsync(takmicenjeId,sezona,nazivTabele);
                return  Ok(result);
                
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
        [Route("PribaviKriterijumeTakmicenja/{takmicenjeID}")]
        public async Task<IActionResult> PribaviKriterijumeTakmicenja([FromRoute]int takmicenjeID)
        {
            try
            {
                
                var result= await _korisnikService.VratiKriterijumePretrageTakmicenjaAsync(takmicenjeID);
                return Ok(result);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
            
        }
         [HttpGet]
        [Route("PribaviUcinakIgraca/{takmicenjeID}/{kriterijum}/{sezona}")]
        public async Task<IActionResult> PribaviUcinakIgraca([FromRoute]int takmicenjeID,[FromRoute]int kriterijum,[FromRoute]string sezona)
        {
              try
            {
                
                var result= await _korisnikService.VratiIgracePoKriterijumuAsync(takmicenjeID,kriterijum,sezona);
                return Ok(result);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
        [Route("VratiKluboveSporta/{sport}/{korisnikID}")]
        public async Task<IActionResult> VratiKluboveAsync([FromRoute]int  sport,[FromRoute]int korisnikID)
        {
            try
            {
                int?kor;
                if(korisnikID==0)
                    kor=null;
                else
                    kor=korisnikID;
                SportType s;
                switch(sport)
                {
                    case 1:
                        s=SportType.Fudbal;
                        break;
                    case 2:
                        s=SportType.Kosarka;
                        break;
                    default:
                        s=SportType.Vaterpolo;
                        break;
                        
                }
                var lista=await _korisnikService.VratiKluboveAsync(s,kor);
                return Ok(lista);
                
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
        [Route("VratiKlubSporta/{sport}/{nazivKluba}/{korisnikID}")]
        public async Task<IActionResult> VratiKlubAsync([FromRoute]int  sport,[FromRoute]string nazivKluba,[FromRoute]int korisnikID)
        {
            try
            {
                int?kor;
                if(korisnikID==0)
                    kor=null;
                else
                    kor=korisnikID;
                SportType s;
                switch(sport)
                {
                    case 1:
                        s=SportType.Fudbal;
                        break;
                    case 2:
                        s=SportType.Kosarka;
                        break;
                    default:
                        s=SportType.Vaterpolo;
                        break;
                        
                }
                var naziv=Uri.UnescapeDataString(nazivKluba);
                var lista=await _korisnikService.VratiKlubAsync(s,naziv,kor);
                return Ok(lista);
                
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost]
        [Route("ZapratiKlub/{korisnikID}/{klubID}")]
        public async Task<IActionResult> ZapratiKlubAsync([FromRoute]int korisnikID,[FromRoute]int klubID)
        {
            try
            {
                await _korisnikService.ZapratiKlubAsync(korisnikID,klubID);
                return Ok(new { message = "Uspesno zapracen klub", ID=klubID });

            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
            
        }
         [HttpPost]
        [Route("OtpratiKlub/{korisnikID}/{klubID}")]
        public async Task<IActionResult> OtpratiKlubAsync([FromRoute]int korisnikID,[FromRoute]int klubID)
        {
            try
            {
                await _korisnikService.OtpratiKlubAsync(korisnikID,klubID);
                return Ok(new { message = "Uspesno otpracen klub", ID=klubID });

            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
            
        }
         [HttpPost]
        [Route("PosaljiPorukuKlubKorisnik/{korisnikID}/{klubID}/{sport}/{korisnik}")]
       public async Task<IActionResult> PorukaKorisnikKlub([FromRoute]int korisnikID,[FromRoute]int klubID,[FromRoute]int sport,[FromRoute]bool korisnik, [FromBody]PorukaSadrzaj sadrzaj)
        {
            try
            {
                
                await _korisnikService.KorisnikKlubPorukaAsync( korisnikID, klubID, sadrzaj,sport,korisnik);
               return Ok(new {message="Uspeh"});
               
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
                
            } 
        }
          [HttpGet]
        [Route("VratiChatKorKlub/{korisnikID}/{klubID}/{sport}")]
       public async Task<IActionResult> VratiChatKorKlubAsync([FromRoute]int korisnikID,[FromRoute]int klubID,[FromRoute] int sport)
        {
            try
            {
               var result=await _korisnikService.VratiChatKlubKorisnikAsync(korisnikID,klubID,sport);
              var res=new List<object>();
              foreach(var item in result)
                {
                    res.Add(
                        new
                        {
                            Id=item.Id,
                            
                            Username=item.PosiljaocUsername,
                            Text=item.Sadrzaj,
                            Time=item.VremeSlanjaPoruke,
                            Day=item.Dan
                            
                        }
                    );
                }
               return Ok(res);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
                
            } 
        }
      [HttpGet]
        [Route("VratiInbox/{ID}/{sport}/{korisnik}")]
       public async Task<IActionResult> VratiInboxAsync([FromRoute]int ID,[FromRoute] int sport, [FromRoute] bool korisnik)
        {
            try
            {
               var result=await _korisnikService.VratiInboxAsync(ID,korisnik,sport);
               return Ok(result);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
                
            } 
        }
        [HttpDelete]
        [Route("ObrisiPorukuKlubKorsinsik/{korisnikID}/{klubID}/{sport}/{ID}")]
        public async Task<IActionResult> ObrisiPorukuKlubKorisnikAsync([FromRoute]int korisnikID,[FromRoute]int klubID,[FromRoute]int sport,[FromRoute]string ID)
        {
            try
            {
                await _korisnikService.ObrisiPorukuKlubKorisnikAsync(ID,korisnikID,klubID,sport);
                return Ok(new {message="Poruka obrisana"});
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
        [Route("VratiPocetnuStranicu/{korisnikID}/{prijavljen}/{sport}")]
         public async Task<IActionResult> VratiNajskorijeRezultateKlubovaSvimTakmicenjimaAsync([FromRoute]int korisnikID,[FromRoute]bool prijavljen,[FromRoute] int sport)
        {
            try
            {
                SportType s;
                switch(sport)
                {
                    case 1:
                        s=SportType.Fudbal;
                        break;
                    case 2:
                        s=SportType.Kosarka;
                        break;
                     case 3:
                        s=SportType.Vaterpolo;
                        break;
                    default:
                        s=SportType.Vaterpolo;
                        break;
                   
                        
                }
                var result = await _korisnikService.VratiNajskorijeRezultateKlubovaSvimTakmicenjimaAsync(korisnikID, prijavljen, s);
                return Ok(result);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost]
        [Route("LajkujILIDislajkujNovost/{korisnikID}/{vestID}/{lajk}")]
        public async Task<IActionResult> LajkDislajkAsync([FromRoute]int korisnikID,[FromRoute]int vestID,[FromRoute]bool lajk)
        {
            try
            {
                var result = await _korisnikService.LajkujIliDislajkujVestAsync(korisnikID,vestID,lajk);
                return Ok(result);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}