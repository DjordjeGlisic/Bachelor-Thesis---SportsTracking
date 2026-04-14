using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using DTO;
using Models;
namespace Hubs
{
    public class MatchHub : Hub
    {
        public async Task PromenjenUcinakIgracuNaUtakmici(int utakmicaID, UcinakIgracaNaUtakmici azuriranUcinak)
        {
            await  Clients.All.SendAsync($"PromenjenUcinakIgracuNaUtakmici{utakmicaID}",azuriranUcinak);
        }
        public async Task PromenjenRezultatNaUtakmici(int brojKola,int takmicenjeID,object rezultat)
        {
            await Clients.All.SendAsync($"PromenjenRezultatUtkamice:Kolo:{brojKola}|Takmicenje:{takmicenjeID}", rezultat);
        }
        public async Task PromenjenaStatistikaUtakmice(int utakmicaID,Statistika statistika )
        {
            await Clients.All.SendAsync($"PromenjenaStatistikaUtakmice{utakmicaID}",statistika);
        }
        public async Task AzuriranStatusUtakmiceKola(int koloBroj,int takmicenjeID, Utakmica utakmica)
        {
            await Clients.All.SendAsync($"Azuriran status utakmice kola:{koloBroj} takmicenja:{takmicenjeID}",utakmica);
        }
        public async Task UtakmicaAzuriranMinut(int utakmicaID,int minut)
        {
            await Clients.All.SendAsync($"Utakmica:{utakmicaID} azuriran minut",minut);
        }
     
    }
}