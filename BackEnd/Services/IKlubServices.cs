using DTO;
using Microsoft.AspNetCore.Mvc;
using Strukture;
using Models;
namespace Services
{
     public interface IKlubService
    {
        Task<List<object>> VratiFormuAsync(int klubId);
        Task<List<NovostZaKorisnika>> VratiNovostiAsync(int klubId,int? korisnikID);
        Task<List<SastavKluba>> VratiSastavAsync(int klubId); 
        Task<ParametriDTO> VratiParametreIgracaAsync(int igracID);
        Task<object> VratiStatistikuIgracaAsync(int igracID,string sezona,int takmicenjeID);
        Task<List<Takmicenje>> VratiTakmicenjaKlubaAsync(int klubID );
        Task<UcinakKluba> VratiUtakmiceTakmicenjaAsync(int klubID,int takmicenjeID);
        Task<List<TabelaKluba>> VratiTabeluKlubaZaTakmicenjeAsync(int takmicenjeID,string sezona,int klubID);
        Task<NovostZaKorisnika> DodajNovuVest(int klubID,NovostZaDodavanje novost);
        Task<NovostZaKorisnika> PromeniPostojecuVest(int klubID,NovostZaKorisnika novost);
        Task<int> ObrisiPostojecuVestAsync(int klubID,int vestID);
        Task<SastavKluba> DodajIgracaTimuAsync(int klubID,IgracDTO igrac);
        Task<SastavKluba> IzmeniIgracaKlubaAsync(int igracID,SastavKluba igrac);
        Task<int> ObrisiPostojecegIgracaAsync(int klubID,int igracID);
        Task<OdgovorPrijave> ImeniInformacijeKlubaAsync(int klubID,KlubDTO klub);
        
    }
}