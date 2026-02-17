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
    }
}