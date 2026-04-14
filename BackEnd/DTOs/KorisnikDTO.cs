using Models;

namespace DTO
{
    public class RegistracijaKorisnika
    {
          public string Ime { get; set; } 
     
        public string Prezime { get; set; }
     
        public string Username { get; set; } 
      
        public string Lozinka { get; set; }
     
        
        public int Telefon { get; set; }
        
        
    }
    public class PrijavaKorisnika
    {
        public string Username { get; set; } 
      
        public string Lozinka { get; set; }
    }
    public class OdgovorPrijave
    {
         public int Id { get; set; }
        public string Username { get; set; } 
    }
    public class OdgovorPrijaveKorisnika : OdgovorPrijave
    {
       
      
        public string Ime { get; set; } 
     
        public string Prezime { get; set; }
     
        public int Telefon { get; set; }
    }
    public class OdgovorPrijaveAdmina : OdgovorPrijave
    {      
        public bool IsAdmin{get;set;}
    }
    public class OdgovorPrijaveKluba: OdgovorPrijave
    {
       public int Sport { get; set; }
       public string Naziv{get;set;}
       public string Logo {get;set;}
       public string Trofeji{get;set;}
       public string Istorija{get;set;}
       public string Prihodi {get;set;}
       public string Rashodi {get;set;}
       public string Sponzori{get;set;}
       public string Adresa{get;set;}
       public int BrojPratioca{get;set;}
       public List<string> Takicenja{get;set;}=new List<string>();
    }
    public class PorukaSadrzaj
    {
        public string Sadrzaj{get;set;}
    }
    public class porukaDTO
    {
         public string Id{get;set;}
         public int? Klub{get;set;}
        public int? Utakmica{get;set;}
         public string Username{get;set;}
         public string Text{get;set;}
         public string Time{get;set;}
         public string Day{get;set;}
    }
    public class KlubTakmicenje
    {
        public int KlubId{get;set;}
        public string Logo{get;set;}
        public string Klub{get;set;}
        public int Odigrane{get;set;}
        public int Pobeda{get;set;}
        public int Neresene{get;set;}
        public int Porazi{get;set;}
        public int DatiPoeni{get;set;}
        public int PrimljeniPoeni{get;set;}
        public int Razlika{get;set;}
        public int Bodovi{get;set;}
        public List<int> PoslednjihPet{get;set;}=new List<int>();

    }
    public class Indeks
    {
          public string Igrac{get;set;}
         public string Klub{get;set;}
         public int Odigrane{get;set;}
         public int Ukupno{get;set;}
         public double IndeksKorisnosti{get;set;}
    }
    public class IndeksFudbal:Indeks
    {
       
         public int PasIndeks{get;set;}
         public double SutIndeks{get;set;}
         public int FerPlej{get;set;}
        
    }
    public class IndeksKosarka:Indeks
    {
        
       
        public int AsistencijeIndeks{get;set;}

        public int BlokadeIndeks{get;set;}
        public int SkokoviIndeks{get;set;}
        public int UkradeneLopteIndeks{get;set;}
        public int PromasajiIndeks{get;set;}
        public int IzgubljeneLopteIndeks{get;set;}
        public int FerPlejIndeks{get;set;}
    }
    public class KluboviZaPocetnu
    {
        public int Id{get;set;}
        public string Naziv{get;set;}
        public string Logo{get;set;}
        public List<object> ListaTakmicenja{get;set;}=new List<object>();
        public List<object> ListaSvezihVesti{get;set;}=new List<object>();
    }

    public class StatistikaNovosti
    {
        public int Id{get;set;}
        public List<int> IdKorisnikaKojiLajkuju{get;set;}=new List<int>();
        public List<int> IdKorisnikaKojiDislajkuju{get;set;}=new List<int>();
        
    }
    public class ReactionResult
    {
        public int VestId { get; set; }
        public int Likes { get; set; }
        public int Dislikes { get; set; }
        public bool LikedByMe { get; set; }
        public bool DislikedByMe { get; set; }
    }
    public class UcinakIgracaNaUtakmici
    {
        public bool IgraUtakmicu { get; set; }
        public int Pogotci { get; set; }
        public int Asistencije { get; set; }
        public int UkupnoSuteva{get;set;}
        public int IndeksKorisnosti { get; set; }
        public int? IzgubljeneLopte { get; set; }
        public int? UkradeneLopte { get; set; }
        public int? BlokiraniUdarci { get; set; }
        public int? VraceniPosedi { get; set; }
        public int? UkupnoDodavanja { get; set; }
        public int? UkupnoTacnihDodavanja { get; set; }
        public int? PredjenaDistancaKM { get; set; }
        public int? Skokovi{get;set;}
        public int? SkokoviOF{get;set;}
        public int? SkokoviDF{get;set;}
        public int? Iskljucenja{get;set;}
        public int? UkupnoFaula{get;set;}
        public bool?CrveniKartoni{get;set;}
        public bool?ZutiKartoni{get;set;}
        public string ImePrezime{get;set;}
        public int IgracId { get; set; }
    }
    public class UcinakObeStrane
    {
        public List<UcinakIgracaNaUtakmici> Domacin{get;set;} = new List<UcinakIgracaNaUtakmici>();
        public List<UcinakIgracaNaUtakmici> Gost{get;set;} = new List<UcinakIgracaNaUtakmici>();
        
    }
}

