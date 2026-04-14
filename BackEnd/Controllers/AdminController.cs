using Models;
using DTO;
using Services;
using Microsoft.AspNetCore.Mvc;
using Strukture;
using Microsoft.EntityFrameworkCore;
namespace Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AdminController: ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService, ApplicationDbContext context)
        {
            _adminService = adminService;
        }
        [HttpGet]
        [Route("VratiTakmicenjaSportaSaUcincima/{sport}")]
        public async Task<IActionResult> VratiTakmicenjaSportaSaUcincima([FromRoute] int sport)
        {
            try
            {
                var result = await _adminService.VratiTakmicenjaSporta(sport);
                return Ok(result);
                
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
        [Route("VratiUcinkeKluba/{KlubID}")]
        public async Task<IActionResult> VratiUcinkeKlubaAsync([FromRoute] int KlubID)
        {
            try
            {
                var result = await _adminService.VratiUcinkeKlubaAsync(KlubID);
                return Ok(result);
                
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost]
        [Route("DodajILIMenjajKlub/{KlubID}/{Sport}")]
        public async Task<IActionResult> DodajILIMenjajKlubAsync([FromRoute]int KlubID,[FromRoute]int Sport,[FromBody] DodajMenjajKlubDTO Klub )
        {
            try
            {
                SportType sport = Sport == 1 ? SportType.Fudbal : Sport ==  2 ? SportType.Kosarka : SportType.Vaterpolo;
                var res = await _adminService.DodajMenjajKlubAsync(KlubID,Klub,sport);
                return Ok(res);
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        [HttpDelete]
        [Route("ObrisiPostojeciKlubSaNjegovimZavisnostima/{KlubID}")]
        public async Task<IActionResult> ObrisiKlubAsync([FromRoute] int KlubID)
        {
            try
            {
                var res = await _adminService.ObrisiKlubSaZavisnostimaAsync(KlubID);
                return Ok(res);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
        [Route("VratiIgraceZaTransfer/{sport}")]
        public async Task<IActionResult> VratiIgraceZaTransferAsync([FromRoute]int sport)
        {
            try
            {
                SportType sportType = sport == 1 ? SportType.Fudbal : sport == 2 ? SportType.Kosarka : SportType.Vaterpolo;
                var result = await _adminService.VratiIgraceSportaAsync(sportType);
                return Ok(result);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
        [Route("VratiKluboveZaTransferIgraca/{sport}")]
        public async Task<IActionResult> VratiKluboveZaTransferAsync([FromRoute]int sport)
        {
            try
            {
                SportType sportType = sport == 1 ? SportType.Fudbal : sport == 2 ? SportType.Kosarka : SportType.Vaterpolo;
                var res = await _adminService.VratiKluboveAsync(sportType);
                return Ok(res);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut]
        [Route("ObaviTransferIgracu")]
        public async Task<IActionResult> ObaviTransferIgracuAsync([FromBody]TransferDTO transfer)
        {
            try
            {
               var res =  await _adminService.IzvrsiTransferIgracaAsync(transfer);
               return Ok(res);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete]
        [Route("ProglasiIgracaSlobodnimAgentom/{igracID}")]
        public async Task<IActionResult> ProglasiIgracaSlobodnimAgentomAsync([FromRoute]int igracID)
        {
            try
            {
               var res =  await _adminService.ProglasiIgracaSlobodnimAsync(igracID);
               return Ok(res);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
        [Route("VratiPotencijalneUcesnikeSekcije/{sport}")]   
       public async Task<IActionResult> VratiPotencijalneUcesnikeSekcije([FromRoute]int sport)
        {
            try
            {
                SportType sportType = sport == 1 ? SportType.Fudbal : sport == 2 ? SportType.Kosarka : SportType.Vaterpolo;
                var res = await _adminService.VratiSveKluboveSportaAsync(sportType);
                return Ok(res);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost]
        [Route("DodajTakmicenje")]
        public async Task<IActionResult> DodajTakmicenjeZaSport([FromBody] AddOrEdiTakmicenjeDTO takmicenje)
        {
            try
            {
                var res = await _adminService.DodajTakmicenjeSportuAsync(takmicenje);
                return Ok(res);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete]
        [Route("ObrisiTakmicenje/{takmicenjeID}")]
        public async Task<IActionResult> ObrisiTakmicenjeAsync([FromRoute] int takmicenjeID)
        {
            try
            {
                var res = await _adminService.ObrisiTakmicenjeAsync(takmicenjeID);
                return Ok(res);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
        [Route("VratiTakmicenje/{takmicenjeID}")]
        public async Task<IActionResult> VratiTakmicenje([FromRoute]int takmicenjeID)
        {
            try
            {
                var res = await _adminService.VratiTakmicenjeAsync(takmicenjeID);
                return Ok(res);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut]
        [Route("IzmeniTakmicenje/{takmicenjeID}")]
        public async Task<IActionResult> EditPostojecegTakmicenja([FromRoute]int takmicenjeID,[FromBody]AddOrEdiTakmicenjeDTO takmicenje)
        {
            try
            {
                var result = await _adminService.IzmeniPostojeceTakmicenjeAsync(takmicenjeID,takmicenje);
                return Ok(result);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
        [Route("VratiSlobodneKluboveZaKoloTakmicenja/{takmicenjeID}/{brojKola}")]
        public async Task<IActionResult> VratiSlobodneKluboveZaKoloTakmicenja([FromRoute]int takmicenjeID, [FromRoute] int brojKola )
        {
            try
            {
                var res = await _adminService.VratiPotencijalneKluboveNoveUtakmiceAsync(takmicenjeID,brojKola);
                return Ok(res);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost]
        [Route("DodajNovuUtakmicuKolu")]
        public async Task<IActionResult> DodajNovuUtakmicuTakmicenju([FromBody] DodavanjeUtakmiceDTO novaUtakmica)
        {
            try
            {
                var res = await _adminService.DodajNovuUtakmicuTakmicenju(novaUtakmica);
                return Ok(res);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete]
        [Route("ObrisiUtakmicuKola/{utakmicaID}")]
        public async Task<IActionResult> ObrisiUtakmicuKolaAsync([FromRoute] int utakmicaID)
        {
            try
            {
                var res = await _adminService.ObrisiUtakmicuKolaAsync(utakmicaID);
                return Ok(res);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut]
        [Route("PromeniParametarIgracu/{utakmicaID}/{sport}")]
        public async Task<IActionResult> PromeniParametarIgracu([FromRoute]int utakmicaID,[FromRoute]int sport,
        [FromBody]IgracUcinakDTO dto)
        {
            try
            {
                var Sport = sport == 1 ? SportType.Fudbal : sport == 2 ? SportType.Kosarka : SportType.Vaterpolo;
                await _adminService.AzurirajStatistikuIgracuNaUtakmiciAsync(utakmicaID,Sport,dto);
                return Ok("Uspesno obavljeno azuriranje");
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut]
        [Route("AzurirajStatUtakmice/{utakmicaID}/{sport}")]
        public async Task<IActionResult> AzurirajStatUtakmiceAsync([FromRoute] int utakmicaID,[FromRoute] int sport, [FromBody] UtakmicaStatDTO parametri)
        {
            try
            {
                SportType Sport =  sport == 1 ? SportType.Fudbal : sport == 2 ? SportType.Kosarka : SportType.Vaterpolo;
                await _adminService.AzurirajStatistikuUtakmiceAsync(utakmicaID,Sport,parametri);
                return Ok("Uspesno azurirana statistika prosledjene utakmcie");
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut]
        [Route("UpravljanjeStatusomTokomUtakmice/{utakmicaID}/{status}")]
        public async Task<IActionResult> UpravljanjeStatusomTokomUtakmiceAsync(int utakmicaID,string status)
        {
            try
            {
                await _adminService.UpravljanjeStatusomTokomUtakmiceAsync(utakmicaID,status);
                return Ok("Uspešno ažuriran trenutni status utakmice");
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
    }
}