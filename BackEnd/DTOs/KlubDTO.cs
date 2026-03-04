using System.Text.Json.Serialization;
using Models;

namespace DTO
{
  public class NovostZaDodavanje
  {
      public string Slika { get; set; }
      public string Naslov { get; set; }
      public string Sazetak { get; set; }
      public string Vest { get; set; }
      public string Autor { get; set; }
      public DateTime Datum { get; set; }
  }
  public class NovostZaKorisnika
    {
        public int Id { get; set; }
        public string Slika { get; set; }
        public string Naslov { get; set; }
        public string Sazetak { get; set; }
        public string Vest { get; set; }
        public string Autor { get; set; }
        public DateTime Datum { get; set; }
        public int BrojLajkova { get; set; }
        public int BrojDislajkova { get; set; }
        public int KlubID { get; set; }
        public bool LikedByMe { get; set; }
        public bool DislikedByMe { get; set; }
                
    }
    public class SastavKluba
  {
      public int Id { get; set; }
       
        public string Ime { get; set; } 
        public string Prezime { get; set; }
       
        public DateOnly DatumPocetkaUgovora { get; set; }
       
        public DateOnly DatumKrajaUgovora { get; set; }
      
        public string Pozicija { get; set; }
        
        public float Visina { get; set; }
       
        public float Tezina { get; set; }
      
        public DateOnly DatumRodjenja { get; set; }
       
       public string ListaKlubova{get;set;}
       
       
        public int BrojGodina { get; set; }
        public int KlubID { get; set; } 

        public int IndeksniRejting{get;set;}
  }
  public class ParametriDTO
  {
    public List<Takmicenje> Takmicenja{get;set;}=new List<Takmicenje>();
    public List<string> Sezone{get;set;}=new List<string>();
  }
  public class UcinakKluba
  {
    public List<Utakmica> Utakmice{get;set;}=new List<Utakmica>();
    public object Statistika{get;set;} 
  }
  public class TabelaKluba
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
        public string  NazivTabele{get;set;}
  }
     public class IgracDTO
    {
       [JsonPropertyName("ime")]
        public string Ime{get;set;}
         [JsonPropertyName("prezime")]
        public string Prezime{get;set;}
        [JsonPropertyName("datumPocetkaUgovora")]
        public DateOnly DatumPocetkaUgovora{get;set;}
        [JsonPropertyName("datumKrajaUgovora")]
        public DateOnly DatumKrajaUgovora{get;set;}
        [JsonPropertyName("datumRodjenja")]
        public DateOnly DatmRodjenja{get;set;}
          [JsonPropertyName("pozicija")]
        public string Pozicija{get;set;}
        [JsonPropertyName("visina")]
        public float Visina{get;set;}
         [JsonPropertyName("tezina")]
        public float Tezina{get;set;}
        [JsonPropertyName("takmicenja")]
        public List<string> Takmicenja{get;set;}=new List<string>();
        [JsonPropertyName("listaKlubova")]
        public string ListaKlubova{get;set;}


    }
  public class KlubDTO
  {
    public string Adresa{get;set;}
    public int BrojPratioca{get;set;}
    public int Id{get;set;}
    public string Istorija{get;set;}
    public string Logo{get;set;}
    public string Naziv{get;set;}
    public string Prihodi{get;set;}
    public string Rashodi{get;set;}
    public string Sponzori{get;set;}
    public int Sport{get;set;}
    public List<string> Takicenja{get;set;}=new List<string>();
    public string Trofeji{get;set;}
    public string Username{get;set;}
    
  }
}