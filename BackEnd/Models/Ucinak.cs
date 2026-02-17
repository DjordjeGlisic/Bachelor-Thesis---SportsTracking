using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models
{
[Table("UcinakIgraca")]
public class Ucinak
    {
    [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
    [Required]
        public int Pogotci { get; set; }
    [Required]
    public int UkupnoSuteva{get;set;}
    [Required]
        public int Asistencije { get; set; }
    [Required]
        public int IndeksKorisnosti { get; set; }
         [Required]
        public int OdigraneUtakmice { get; set; }
          
        public int? IzgubljeneLopte { get; set; }
        
        public int? UkradeneLopte { get; set; }
         
        public int? BlokiraniUdarci { get; set; }
        
        public int? VraceniPosedi { get; set; }
        
        public int? UkupnoDodavanja { get; set; }
        
        public int? UkupnoTacnihDodavanja { get; set; }

          
        public int? PredjenaDistancaKM { get; set; }
        
    [Required]
    public string Sezona { get; set; }

    [Required]
    public string NazivKluba{get;set;}
    public int? Skokovi{get;set;}
    public int? SkokoviOF{get;set;}
    public int? SkokoviDF{get;set;}
    public int? Iskljucenja{get;set;}
    public int? UkupnoFaula{get;set;}
    public int?CrveniKartoni{get;set;}
    public int?ZutiKartoni{get;set;}

    
    
    //VEZE
    public Takmicenje Takmicenje { get; set; }
    [Required]
        public int TakmicenjeId { get; set; }   
    [Required]
    public int IgracId { get; set; }
    public Igrac Igrac { get; set; }
}
    
}