using DTO;
using Microsoft.AspNetCore.Mvc;
using Strukture;
using Models;
namespace Services
{
    public interface IKorisnikService
    {
        Task RegistracijaAsync(RegistracijaKorisnika dto);
        Task<OdgovorPrijave> PrijavaAsync(PrijavaKorisnika dto);
        Task<IActionResult> VratiTakmicenjaAsync(SportType sport);
        Task<List<object>> VratiKluboveAsync(SportType sport,int? korisnikID);
        Task<IActionResult> VratiUtakmiceKolaAsync(int takmicenjeId,int brojKola); 
        Task<object?> VratiStatistikuUtakmiceAsync(int utakmicaID,SportType sportType);
        Task KorisnikSaljePorukuZaUtakmicuAsync(int korisnikID,int utakmicaID,PorukaSadrzaj sadrzaj);
        Task<List<Poruka>> VratiPorukeKorisnikUtakmicaAsync(int utakmicaID);  
        Task ObrisiPorukuUtakmciAsync(string porukaId,int utakmicaID);
        Task<List<KlubTakmicenje>> VratiTabeluTakmicenjaAsync(int takmicenjeID,string sezona,string nazivTabele);
        Task<object?> VratiKriterijumePretrageTakmicenjaAsync(int takmicenjeId);
        Task<List<object>> VratiIgracePoKriterijumuAsync(int takmicenjeId,int kriterijum,string sezona);
        Task ZapratiKlubAsync(int korisnikID,int klubID);
        Task OtpratiKlubAsync(int korisnikID,int klubID);
        Task<List<PorukaKlubKorisnik>>VratiChatKlubKorisnikAsync(int korisnikID,int klubID,int sport);
        Task KorisnikKlubPorukaAsync(int korisnikID,int klubID,PorukaSadrzaj sadrzaj,int sport,bool korisnik);
       Task<List<object>> VratiInboxAsync(int ID,bool korisnik,int sport);

       Task ObrisiPorukuKlubKorisnikAsync(string ID,int korisnikID,int klubID,int sport );
       Task<List<KluboviZaPocetnu>> VratiNajskorijeRezultateKlubovaSvimTakmicenjimaAsync(int korisnikID,bool prijavljen,SportType sport);
      Task<ReactionResult> LajkujIliDislajkujVestAsync(int korisnikID, int vestID, bool lajk);
      Task<object>VratiKlubAsync(SportType sport,string nazivKlubaint,int? korisnikID);
      Task<UcinakObeStrane> VratiUcinakIgracaKlubaZaUtakmicuAsync(int utakmicaID,SportType sport);
      Task<int> VratiMinutUtakmiceAsync(int utakmicaID);
       
    }
    
}