using DTO;
using Microsoft.AspNetCore.Mvc;
using Strukture;
using Models;
namespace Services
{
    public interface IAdminService
    {
        Task<List<TakmicenjeDTO>> VratiTakmicenjaSporta(int sport);
        Task<List<PostojeciUcinak>> VratiUcinkeKlubaAsync(int KlubID);
        Task<object> DodajMenjajKlubAsync(int KlubID,DodajMenjajKlubDTO klub,SportType sport);
        Task<int> ObrisiKlubSaZavisnostimaAsync(int KlubID);
        Task<List<IgracZaTransferDTO>> VratiIgraceSportaAsync(SportType sport);
        Task<List<KlubZaIgracaDTO>> VratiKluboveAsync(SportType sport);
        Task<IgracZaTransferDTO> IzvrsiTransferIgracaAsync(TransferDTO tranfer);
        Task<IgracZaTransferDTO> ProglasiIgracaSlobodnimAsync(int igracID);
        Task<List<KlubZaUcinakDTO>> VratiSveKluboveSportaAsync(SportType sport);
        Task<OpsteZaTakmicenjaDTO> DodajTakmicenjeSportuAsync(AddOrEdiTakmicenjeDTO takmicenje);
        Task<OpsteZaTakmicenjaDTO> ObrisiTakmicenjeAsync(int takmicenjeID);    
        Task<AddOrEdiTakmicenjeDTO> VratiTakmicenjeAsync(int takmicenjeID);
        Task<OpsteZaTakmicenjaDTO> IzmeniPostojeceTakmicenjeAsync(int takmicenjeID,AddOrEdiTakmicenjeDTO takmicenje);
        Task<List<KlubZaUcinakDTO>> VratiPotencijalneKluboveNoveUtakmiceAsync(int takmicenjeID,int brojKola);
        Task<NovaUtakmicaDTO> DodajNovuUtakmicuTakmicenju(DodavanjeUtakmiceDTO novaUtakmica);
        Task<int> ObrisiUtakmicuKolaAsync(int utakmicaID);
        Task AzurirajStatistikuIgracuNaUtakmiciAsync(int utakmicaID,SportType sport,IgracUcinakDTO parametri);
        Task AzurirajStatistikuUtakmiceAsync(int utakmicaID,SportType sport,UtakmicaStatDTO parametri);
        Task UpravljanjeStatusomTokomUtakmiceAsync(int utakmicaID,string status);
    }
}