namespace Models
{
    
public class Poruka
{
    public string Id{get;set;}
	public int PosiljaocID{get;set;}
	public int PrimaocID{get;set;}
	public string Sadrzaj{get;set;}
	public string PosiljaocUsername{get;set;}
	public string Dan{get;set;}
	public string VremeSlanjaPoruke{get;set;}
    public DateTime TacnoVreme{get;set;}
}
public class PorukaKlubKorisnik
	{
		 public string Id{get;set;}
		
	public int KorisnikID{get;set;}
	public int KlubID{get;set;}
	public string UsernameKor{get;set;}
	public string NazivKlub{get;set;}
	public string Sadrzaj{get;set;}
	public string PosiljaocUsername{get;set;}
	public string Dan{get;set;}
	public string VremeSlanjaPoruke{get;set;}
    public DateTime TacnoVreme{get;set;}
		
	}
}