using Models;
using Strukture;

public class TakmicenjeDTO
{
    public int Id{get;set;}
    public string NazivTakmicenja{get;set;}
    public List<UcinakDTO> ListaUcinaka{get;set;} =  new List<UcinakDTO>();
}
public class UcinakDTO
{
    public string NazivTabele{get;set;}
    public string Sezona{get;set;} 
}
public class PostojeciUcinak : UcinakDTO
{
    public string NazivTakmicenja {get;set;}
    public int IdTakmicenja{get;set;}
    public int IdUcinka{get;set;} 
}
public class DodajMenjajKlubDTO
{
    public string? Naziv{get;set;}
    public string? Email{get;set;}
    public string? Lozinka{get;set;}
    public List<PostojeciUcinak> ListaUcinaka{get;set;} = new List<PostojeciUcinak>();
    public string? Logo{get;set;}
}
public class IgracZaTransferDTO
{
    public int Id{get;set;}
    public string Ime{get;set;}
    public string Prezime{get;set;}
    public int? KlubID{get;set;}
    public string? KlubNaziv{get;set;}
    public string? ListaKlubova{get;set;}
    public int BrojGodina{get;set;}
    public DateOnly DatumPocetkaUgovora{get;set;}
    public DateOnly DatumKrajaUgovora{get;set;}

}
public class KlubZaIgracaDTO
{
    public int Id{get;set;}
    public string Naziv{get;set;}

}
public class TransferDTO
{
   public int Id{get;set;}
   public int NoviKlubID{get;set;}
    public DateOnly DatumPocetka{get;set;}
    public DateOnly DatumKraja{get;set;}
}
public class KlubZaUcinakDTO
{
    public int Id{get;set;}
    public string Naziv{get;set;}
}
public class AddOrEdiTakmicenjeDTO
{
    public string Naziv{get;set;}
    public string LogoURL{get;set;}
    public int Sport{get;set;}
    public string Opis{get;set;}
    public string Drzava{get;set;}
    public int? RegularnoBr{get;set;}
    public int? RoundOf128Br{get;set;}
    public int? RoundOf64Br{get;set;}
    public int? RoundOf32Br{get;set;}
    public int? RoundOf16Br{get;set;}
    public int? RoundOf8Br{get;set;}
    public int? RoundOf4Br{get;set;}
    public int? RoundOf2Br{get;set;}
    public List<SekcijaDTO> Sekcije{get;set;} = new List<SekcijaDTO>();
  }
  public class SekcijaDTO
  {
    public string NazivTabele{get;set;}
    public string Sezona{get;set;}
    public List<KlubZaUcinakDTO> Klubovi{get;set;} =  new List<KlubZaUcinakDTO>();
  }
  public class OpsteZaTakmicenjaDTO
{
    public int Id{get;set;}
    public string Naziv{get;set;}
    public string LogoURL{get;set;}
    public SportType Sport{get;set;}
    public string Opis{get;set;}
    public string Drzava{get;set;}
  }
public class TabelaDTO
{
    public string Naziv{get;set;}
    public string Sezona{get;set;}
    public int KlubID{get;set;}
    
}
public class NovaUtakmicaDTO
{
     public int Id{get;set;}
     public string Domacin{get;set;}
     public string? DomacinLogo{get;set;}
    public string? GostLogo{get;set;}
     public string Gost{get;set;}
     public DateTime Datum{get;set;}
     public bool Uzivo{get;set;}
                
     public string Rezultat{get;set;}
     public int Vreme{get;set;}
     public string ListaStrelaca{get;set;}
     public string Lokacija{get;set;}
}
public class DodavanjeUtakmiceDTO
{
    public int BrojKola{get;set;}
    public DateTime Datum{get;set;}
    public string Domacin{get;set;}
    public string Gost{get;set;}
    public string Lokacija{get;set;}
    public int Sport{get;set;}
    public int TakmicenjeID{get;set;}
    public string TakmicenjeNaziv{get;set;}
}
public class IgracUcinakDTO
{
     public string Klub{get;set;}
     public int IgracID{get;set;}
     public string Parametar{get;set;}
     public string Promena{get;set;}
}
public class UtakmicaStatDTO
{
    public string Klub{get;set;}
     public string Parametar{get;set;}
     public string Promena{get;set;}
    
}