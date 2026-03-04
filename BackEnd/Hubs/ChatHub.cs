using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using DTO;
namespace Hubs
{
    public class ChatHub : Hub
    {
        public async Task NotifyClientsAboutMessageChangeUtakmica(porukaDTO porukaDTO)
        {
            await Clients.All.SendAsync($"DodataPorukaUtakmici{porukaDTO.Utakmica}",porukaDTO);
        }
         public async Task NotifyClientsAboutMessageChangeUtakmicaObrisanaPoruka(string porukaId,int utakmicaId)
        {
            await Clients.All.SendAsync($"ObrisanaPoruka{utakmicaId}",porukaId);
        }
         public async Task NotifyClubAndUser(int korisnikID,int klubID, porukaDTO p)
        {
            await Clients.All.SendAsync($"Stigla nova poruka korID={korisnikID} klubID={klubID}",p);
        }
        public async Task NotifyAboutNewChat(int id,object o)
        {
            await Clients.All.SendAsync($"Dodaj novi chat:{id}",o);
        }
         public async Task NotifyAboutDeleteMessage(int korisnikID,int klubID,int sport,string id)
        {
            await Clients.All.SendAsync($"Obrisana poruka:{korisnikID}:{klubID}:{sport}",id);
        }
        public async Task NotifySpecificUserAboutNewMessage(int ID)
        {
            await Clients.All.SendAsync($"Stigla nova poruka ID=${ID}");
        }
        
    }
}