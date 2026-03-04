using Models;
using DTO;
using Services;
using Microsoft.AspNetCore.Mvc;
using Strukture;
namespace Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class KlubController: ControllerBase
    {
        private readonly IKlubService _klubService;

        public KlubController(IKlubService klubService)
        {
            _klubService = klubService;
        }
        [HttpGet]
        [Route("VratiFormuTima/{klubId}")]
        public async Task<IActionResult> VratiFormuTima(int klubId)
        {
            try
            {
               var res= await _klubService.VratiFormuAsync(klubId);
                return Ok(res);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
        [Route("VratiNovostiKluba/{klubId}/{korisnikID}")]
        public async Task<IActionResult> VratiNovostiKluba([FromRoute]int klubId,[FromRoute] int korisnikID)
        {
            try
            {
                int?kor=null;
                if(korisnikID>0)
                    kor=korisnikID;
                var res = await _klubService.VratiNovostiAsync(klubId, kor);
                return Ok(res);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
        [Route("VratiSastavKluba/{klubId}")]
        public async Task<IActionResult> VratiSastavKluba([FromRoute]int klubId)
        {
            try
            {
                
                var res = await _klubService.VratiSastavAsync(klubId);
                return Ok(res);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
        [Route("VratiParametreIgraca/{igracID}")]
        public async Task<IActionResult> VratiParametre([FromRoute]int igracID)
        {
            try
            {
                var res=await _klubService.VratiParametreIgracaAsync(igracID);
                return Ok(res);
                
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
        [Route("VratiStatistikuIgraca/{igracID}/{sezona}/{takmicenjeID}")]
        public async Task<IActionResult> VratiStatistiku([FromRoute]int igracID,[FromRoute]string sezona,[FromRoute]int takmicenjeID)
        {
            try
            {
                var sez=Uri.UnescapeDataString(sezona);
            var res=await _klubService.VratiStatistikuIgracaAsync(igracID,sez,takmicenjeID);
            return Ok(res); 
                
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
            
        }
        [HttpGet]
        [Route("VratiTakmicenjaKluba/{klubID}")]
        public async Task<IActionResult> VratiTakmicenjaKluba([FromRoute]int klubID)
        {
            try
            {
                
            var res=await _klubService.VratiTakmicenjaKlubaAsync(klubID);
            return Ok(res); 
                
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
            
        }
        [HttpGet]
        [Route("VratiRezultateKlubaZaTakmicenje/{klubID}/{takmicenjeID}")]
        public async Task<IActionResult> VratiRezultateKlubaZaTakmicenje([FromRoute]int klubID,[FromRoute]int takmicenjeID)
        {
            try
            {
                var result=await _klubService.VratiUtakmiceTakmicenjaAsync(klubID,takmicenjeID);
                return Ok(result);
                
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
         [HttpGet]
        [Route("VratiTabeluKlubaZaTakmicenje/{takmicenjeID}/{sezona}/{klubID}")]
        public async Task<IActionResult> VratiTabeluKlubaZaTakmicenje([FromRoute]int takmicenjeID,[FromRoute]string sezona,[FromRoute]int klubID)
        {
            try
            {
                 var s=Uri.UnescapeDataString(sezona);
                var result=await _klubService.VratiTabeluKlubaZaTakmicenjeAsync(takmicenjeID,s,klubID);
                return Ok(result);
                
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost]
        [Route("KlubDodajeNovost/{klubID}")]
        public async Task<IActionResult>  KlubDodajeNovost([FromRoute]int klubID,[FromBody]NovostZaDodavanje novost)
        {
            try
            {
               

                var result= await _klubService.DodajNovuVest(klubID,novost);
                return Ok(result);
                
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut]
        [Route("KlubAzuriraNovost/{klubID}")]
        public async Task<IActionResult> KlubAzuziraNovost([FromRoute] int klubID,[FromBody]NovostZaKorisnika novost)
        {
            try
            {
               var result= await _klubService.PromeniPostojecuVest(klubID,novost);
               return Ok(result);

            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete]
        [Route("ObrisiPostojecuVest/{klubID}/{vestID}")]
        public async Task<IActionResult> ObrisiPostojecuVestAsync([FromRoute]int klubID,[FromRoute]int vestID)
        {
            try
            {
                var result= await _klubService.ObrisiPostojecuVestAsync(klubID, vestID);
                return Ok(result);
                
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost]
        [Route("DodajIgracaKlubu/{klubID}")]
        public async Task<IActionResult> DodajIgracaKlubu([FromRoute]int klubID,[FromBody]IgracDTO igrac)
        {
            try
            {
                var result = await _klubService.DodajIgracaTimuAsync(klubID,igrac);
                return Ok(result);
                
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut]
        [Route("AzurirajIgracaKluba/{igracID}")]
        public async Task<IActionResult> AzurirajIgracaKluba([FromRoute]int igracID,[FromBody]SastavKluba igrac)
        {
            try
            {
                var result = await _klubService.IzmeniIgracaKlubaAsync(igracID,igrac);
                return Ok(result);
                
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
         [HttpDelete]
        [Route("ObrsisiIgraca/{klubID}/{igracID}")]
        public async Task<IActionResult> ObrisiIgraca([FromRoute]int klubID,[FromRoute]int igracID)
        {
            try
            {
                var result = await _klubService.ObrisiPostojecegIgracaAsync(klubID,igracID);
                return Ok(result);
                
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut]
        [Route("AzurirajKlub/{klubID}")]
        public async Task<IActionResult> AzurirajKlubAsync([FromRoute]int klubID,[FromBody]KlubDTO klub)
        {
            try
            {
                var result = await _klubService.ImeniInformacijeKlubaAsync(klubID,klub);
                return Ok(result);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }        
    }
}